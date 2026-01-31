export class UpdateResumeService {
  constructor(resumeRepository, templateRepository) {
    this.resumeRepository = resumeRepository;
    this.templateRepository = templateRepository;
  }

  async execute(command) {
    // Validate command
    if (!command.resumeId) {
      throw new Error('resumeId is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (command.templateId !== undefined && command.templateId !== null) {
      // Validate that template exists
      const sections = await this.templateRepository.getSections(command.templateId);
      if (sections.length === 0) {
        throw new Error('Invalid template ID');
      }
    }

    // Find the resume
    const resume = await this.resumeRepository.findById(command.resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Check ownership
    if (resume.userId !== command.userId) {
      throw new Error('Access denied');
    }

    // Update fields if provided
    if (command.title !== undefined) {
      resume.title = command.title;
    }
    
    if (command.templateId !== undefined) {
      resume.templateId = command.templateId;
    }
    
    if (command.sections !== undefined) {
      resume.sections = command.sections;
    }

    resume.updatedAt = new Date();

    // Save the updated resume
    await this.resumeRepository.update(resume);

    return resume;
  }
}