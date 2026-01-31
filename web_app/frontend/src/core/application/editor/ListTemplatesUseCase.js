/**
 * ListTemplatesUseCase
 * 
 * Application Service for retrieving all available resume templates.
 */
export class ListTemplatesUseCase {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute() {
    return await this.resumeRepository.listTemplates();
  }
}
