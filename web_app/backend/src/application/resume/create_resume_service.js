import { Resume } from '../../domain/resume/resume.js';

export class CreateResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
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

    // Initialize sections based on template or empty
    let sections = [];
    if (command.templateId) {
      // For now, start with empty sections even with template
      // TODO: Load template sections when template system is implemented
      sections = [];
    }

    // Create resume
    const resume = new Resume(id, command.userId, command.title, sections, command.templateId || null);

    // Save
    await this.resumeRepository.save(resume);

    return resume;
  }
}