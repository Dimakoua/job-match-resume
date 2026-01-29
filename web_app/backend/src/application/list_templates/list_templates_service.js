export class ListTemplatesService {
  constructor(templateRepository) {
    this.templateRepository = templateRepository;
  }

  async execute() {
    return await this.templateRepository.getAllTemplates();
  }
}