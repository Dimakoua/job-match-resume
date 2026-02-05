// application/calculate_ats_score/calculate_ats_score_service.js
import { AtsScoringError } from './ats_scoring_error.js';
import { ATS_CONFIG, STOP_WORDS, TECHNICAL_TERMS } from './keyword_config.js';

/**
 * Service for calculating ATS (Applicant Tracking System) compatibility scores.
 * 
 * This service analyzes the keyword overlap between a resume and job description
 * to produce a deterministic compatibility score from 0-100.
 * 
 * @class CalculateAtsScoreService
 */
export class CalculateAtsScoreService {
  /**
   * Execute ATS score calculation
   * 
   * @param {Object} command - The command object
   * @param {string} command.resumeText - The resume text to analyze
   * @param {string} command.jobDescription - The job description to compare against
   * @returns {Promise<Object>} Result containing score, keywords, and metadata
   * @returns {number} result.score - ATS compatibility score (0-100)
   * @returns {string[]} result.matchedKeywords - Keywords found in both resume and job description
   * @returns {string[]} result.missedKeywords - Keywords in job description but missing from resume
   * @returns {string[]} result.resumeKeywords - All keywords extracted from resume
   * @returns {string[]} result.jobDescriptionKeywords - All keywords extracted from job description
   * @returns {Object} result.metadata - Additional metadata about the analysis
   * @throws {AtsScoringError} If input validation fails
   */
  async execute(command) {
    // Validate inputs
    this._validateInput(command);

    // Normalize texts for processing
    const normalizedResume = this._normalizeText(command.resumeText);
    const normalizedJobDesc = this._normalizeText(command.jobDescription);

    // Extract keywords from both texts
    const jobKeywords = this._extractKeywords(normalizedJobDesc);
    const resumeKeywords = this._extractKeywords(normalizedResume);

    // Find matching keywords in resume
    const matchedKeywords = this._findMatchedKeywords(normalizedResume, jobKeywords);

    // Find missed keywords (in job description but not in resume)
    const missedKeywords = jobKeywords.filter(keyword => !matchedKeywords.includes(keyword));

    // Calculate final score
    const score = this._calculateScore(jobKeywords.length, matchedKeywords.length);

    return {
      score,
      matchedKeywords: matchedKeywords.sort(), // Sort for consistent output
      missedKeywords: missedKeywords.sort(), // Sort for consistent output
      resumeKeywords: resumeKeywords.sort(), // All resume keywords for highlighting
      jobDescriptionKeywords: jobKeywords.sort(), // All job keywords for reference
      totalKeywords: jobKeywords.length, // Keep for backwards compatibility
      metadata: {
        resumeLength: command.resumeText.length,
        jobDescriptionLength: command.jobDescription.length,
        wordCount: command.resumeText.split(/\s+/).filter(word => word.length > 0).length,
        matchRate: jobKeywords.length > 0 
          ? Math.round((matchedKeywords.length / jobKeywords.length) * 100) / 100 
          : 0,
        resumeKeywordCount: resumeKeywords.length,
        jobKeywordCount: jobKeywords.length,
        matchedCount: matchedKeywords.length,
        missedCount: missedKeywords.length
      }
    };
  }

  /**
   * Validate command input
   * 
   * @private
   * @param {Object} command - The command to validate
   * @throws {AtsScoringError} If validation fails
   */
  _validateInput(command) {
    if (!command) {
      throw AtsScoringError.invalidInput('command', 'command object is required');
    }

    // Validate resumeText
    if (!command.resumeText || typeof command.resumeText !== 'string') {
      throw AtsScoringError.invalidInput('resumeText', 'must be a non-empty string');
    }

    if (command.resumeText.trim().length === 0) {
      throw AtsScoringError.invalidInput('resumeText', 'cannot be empty or whitespace only');
    }

    if (command.resumeText.length > ATS_CONFIG.MAX_TEXT_LENGTH) {
      throw AtsScoringError.textTooLong(
        'resumeText', 
        command.resumeText.length, 
        ATS_CONFIG.MAX_TEXT_LENGTH
      );
    }

    // Validate jobDescription
    if (!command.jobDescription || typeof command.jobDescription !== 'string') {
      throw AtsScoringError.invalidInput('jobDescription', 'must be a non-empty string');
    }

    if (command.jobDescription.trim().length === 0) {
      throw AtsScoringError.invalidInput('jobDescription', 'cannot be empty or whitespace only');
    }

    if (command.jobDescription.length > ATS_CONFIG.MAX_TEXT_LENGTH) {
      throw AtsScoringError.textTooLong(
        'jobDescription', 
        command.jobDescription.length, 
        ATS_CONFIG.MAX_TEXT_LENGTH
      );
    }
  }

  /**
   * Normalize text for processing
   * Handles special characters, multiple spaces, etc.
   * 
   * @private
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text
   */
  _normalizeText(text) {
    return text
      .toLowerCase()
      // Replace common separators with spaces for better word boundary detection
      .replace(/[\/\-_]/g, ' ')
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract relevant keywords from text
   * 
   * @private
   * @param {string} text - Normalized text to extract keywords from
   * @returns {string[]} Array of unique keywords
   */
  _extractKeywords(text) {
    // Extract all words
    const words = text.match(/\b[a-z0-9]+\b/g) || [];

    // Filter and deduplicate
    const keywords = new Set();

    for (const word of words) {
      // Skip if too short
      if (word.length < ATS_CONFIG.MIN_KEYWORD_LENGTH) {
        continue;
      }

      // Skip stop words
      if (STOP_WORDS.has(word)) {
        continue;
      }

      // Skip pure numbers
      if (/^\d+$/.test(word)) {
        continue;
      }

      // Include technical terms or longer words that are likely meaningful
      if (TECHNICAL_TERMS.has(word) || word.length >= ATS_CONFIG.MIN_GENERAL_KEYWORD_LENGTH) {
        keywords.add(word);
      }
    }

    return Array.from(keywords);
  }

  /**
   * Find which job keywords are present in the resume
   * 
   * @private
   * @param {string} resumeText - Normalized resume text
   * @param {string[]} jobKeywords - Keywords from job description
   * @returns {string[]} Array of matched keywords
   */
  _findMatchedKeywords(resumeText, jobKeywords) {
    const matched = [];

    // Pre-compile resume text for efficient searching
    const resumeWords = new Set(resumeText.match(/\b[a-z0-9]+\b/g) || []);

    for (const keyword of jobKeywords) {
      if (resumeWords.has(keyword)) {
        matched.push(keyword);
      }
    }

    return matched;
  }

  /**
   * Calculate final ATS score
   * 
   * @private
   * @param {number} totalKeywords - Total number of keywords from job description
   * @param {number} matchedKeywords - Number of matched keywords
   * @returns {number} Score from 0-100
   */
  _calculateScore(totalKeywords, matchedKeywords) {
    // Handle edge case of no keywords
    if (totalKeywords === 0) {
      return 0;
    }

    // Calculate percentage match
    const rawScore = (matchedKeywords / totalKeywords) * 100;

    // Round to nearest integer and ensure within bounds
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }
}