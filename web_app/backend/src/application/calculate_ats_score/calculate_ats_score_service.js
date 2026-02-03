// application/calculate_ats_score/calculate_ats_score_service.js
export class CalculateAtsScoreService {
  async execute(command) {
    // Validate command
    if (!command.resumeText || typeof command.resumeText !== 'string' || command.resumeText.trim().length === 0) {
      throw new Error('resumeText is required and must be a non-empty string');
    }

    if (!command.jobDescription || typeof command.jobDescription !== 'string' || command.jobDescription.trim().length === 0) {
      throw new Error('jobDescription is required and must be a non-empty string');
    }

    if (command.resumeText.length > 50000) {
      throw new Error('resumeText must be less than 50,000 characters');
    }

    if (command.jobDescription.length > 50000) {
      throw new Error('jobDescription must be less than 50,000 characters');
    }

    // Extract keywords from job description
    const jobKeywords = this._extractKeywords(command.jobDescription);

    // Calculate score based on keyword matches in resume
    const score = this._calculateScore(command.resumeText, jobKeywords);

    return {
      score: score,
      matchedKeywords: jobKeywords.filter(keyword => this._containsKeyword(command.resumeText, keyword)),
      totalKeywords: jobKeywords.length
    };
  }

  _extractKeywords(text) {
    // Convert to lowercase and split into words
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];

    // Filter out common stop words and short words
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'would', 'i', 'you', 'we', 'they',
      'this', 'these', 'those', 'me', 'my', 'your', 'our', 'their',
      'his', 'her', 'him', 'she', 'us', 'them', 'who', 'what', 'where',
      'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'just', 'should', 'now',
      'have', 'been', 'were', 'had', 'did', 'do', 'does', 'done', 'doing',
      'am', 'are', 'is', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
      'make', 'made', 'making', 'get', 'got', 'getting', 'go', 'went', 'going',
      'come', 'came', 'coming', 'take', 'took', 'taking', 'see', 'saw', 'seeing',
      'know', 'knew', 'knowing', 'think', 'thought', 'thinking', 'look', 'looked', 'looking'
    ]);

    // For ATS scoring, focus on potential technical terms, job titles, and skills
    // Include words that are likely to be skills/technologies
    const technicalTerms = new Set([
      'javascript', 'python', 'java', 'csharp', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails',
      'html', 'css', 'sass', 'scss', 'bootstrap', 'tailwind', 'material',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab',
      'linux', 'windows', 'macos', 'android', 'ios',
      'developer', 'engineer', 'architect', 'analyst', 'manager', 'lead', 'senior', 'junior',
      'frontend', 'backend', 'fullstack', 'mobile', 'web', 'software', 'data', 'devops', 'qa', 'testing',
      'agile', 'scrum', 'kanban', 'ci', 'cd', 'api', 'rest', 'graphql', 'microservices'
    ]);

    const keywords = words.filter(word => {
      // Must be at least 3 characters
      if (word.length < 3) return false;
      
      // Not a stop word
      if (stopWords.has(word)) return false;
      
      // Not just numbers
      if (/^\d+$/.test(word)) return false;
      
      // Either a known technical term or a longer word (likely technical)
      return technicalTerms.has(word) || word.length >= 6;
    });

    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  _containsKeyword(text, keyword) {
    // Case-insensitive search for the keyword
    const regex = new RegExp(`\\b${this._escapeRegExp(keyword)}\\b`, 'i');
    return regex.test(text);
  }

  _escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  _calculateScore(resumeText, jobKeywords) {
    if (jobKeywords.length === 0) {
      return 0;
    }

    // Count how many keywords are found in the resume
    const matchedCount = jobKeywords.filter(keyword =>
      this._containsKeyword(resumeText, keyword)
    ).length;

    // Calculate percentage score (0-100)
    const score = Math.round((matchedCount / jobKeywords.length) * 100);

    return Math.min(100, Math.max(0, score)); // Ensure score is between 0-100
  }
}