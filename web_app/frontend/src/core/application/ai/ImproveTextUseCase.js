export class ImproveTextUseCase {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async execute(text) {
    if (!text || text.trim().length === 0) {
      throw new Error("Text to improve cannot be empty");
    }
    if (text.length > 10000) {
      throw new Error("Text is too long (max 10000 characters)");
    }
    return await this.aiService.improveText(text);
  }
}