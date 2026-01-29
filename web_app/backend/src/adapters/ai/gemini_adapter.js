/**
 * Gemini AI Adapter for external API communication
 * Handles JSON generation requests using Google's Gemini API
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiAdapter {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Generate JSON response using Gemini AI
   * @param {string} systemPrompt - System instructions for the AI
   * @param {string} userPrompt - User input prompt
   * @returns {Promise<Object>} Parsed JSON response from Gemini
   * @throws {Error} If API call fails or response is invalid
   */
  async generateJSON(systemPrompt, userPrompt) {
    try {
      // Combine system and user prompts
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return this._parseJSONResponse(text);
    } catch (error) {
      throw this._handleSdkError(error);
    }
  }

  /**
   * Parse the text response and extract JSON
   * @private
   */
  _parseJSONResponse(text) {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini API');
    }

    try {
      // Clean the text - sometimes Gemini adds markdown formatting
      const cleanedText = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      return JSON.parse(cleanedText);
    } catch (parseError) {
      throw new Error(`Failed to parse JSON response from Gemini: ${parseError.message}. Raw response: ${text}`);
    }
  }

  /**
   * Handle SDK errors and convert to user-friendly messages
   * @private
   */
  _handleSdkError(error) {
    // Handle specific SDK error types
    if (error.message.includes('API_KEY_INVALID')) {
      return new Error('Authentication failed: Invalid API key');
    }

    if (error.message.includes('PERMISSION_DENIED')) {
      return new Error('Access forbidden: Check API key permissions');
    }

    if (error.message.includes('RESOURCE_EXHAUSTED')) {
      return new Error('Rate limit exceeded: Too many requests');
    }

    if (error.message.includes('SAFETY')) {
      return new Error('Content blocked by Gemini safety filters');
    }

    if (error.message.includes('SERVICE_UNAVAILABLE') ||
        error.message.includes('INTERNAL') ||
        error.message.includes('UNAVAILABLE')) {
      return new Error('Gemini service temporarily unavailable');
    }

    if (error.message.includes('INVALID_ARGUMENT')) {
      return new Error(`Invalid request: ${error.message}`);
    }

    // Network or other errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Error('Network error: Unable to connect to Gemini API');
    }

    // Generic error with original message
    return new Error(`Gemini API error: ${error.message}`);
  }
}