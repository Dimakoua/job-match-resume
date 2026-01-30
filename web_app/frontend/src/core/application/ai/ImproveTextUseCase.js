export class ImproveTextUseCase {
  constructor(aiService) {
    this.aiService = aiService;
  }

  async execute(text) {
    return await this.aiService.improveText(text);
  }
}