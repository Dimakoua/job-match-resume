/**
 * GenerateSuggestionsUseCase
 *
 * Orchestrates generating AI-powered suggestions for resume improvement.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class GenerateSuggestionsUseCase {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async execute(jobDescription, resumeText) {
    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error("Job description cannot be empty");
    }
    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume text cannot be empty");
    }
    if (jobDescription.length > 10000) {
      throw new Error("Job description is too long (max 10000 characters)");
    }
    if (resumeText.length > 10000) {
      throw new Error("Resume text is too long (max 10000 characters)");
    }
    return await this.aiService.generateSuggestions(jobDescription, resumeText);
  }
}