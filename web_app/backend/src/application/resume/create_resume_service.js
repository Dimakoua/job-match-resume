import { Resume } from '../../domain/resume/resume.js';

export class CreateResumeService {
  constructor(resumeRepository, templateRepository) {
    this.resumeRepository = resumeRepository;
    this.templateRepository = templateRepository;
  }

  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (!command.title) {
      throw new Error('title is required');
    }

    // Generate ID
    const id = crypto.randomUUID();

    // Initialize sections based on template, provided sections, or empty
    let sections = command.sections || [];
    
    if (!command.sections && command.templateId) {
      // Load predefined template sections
      sections = await this.templateRepository.getSections(command.templateId);
    }

    // Create resume
    const resume = new Resume(id, command.userId, command.title, sections, command.templateId || null);

    // Save
    await this.resumeRepository.save(resume);

    return resume;
  }
}