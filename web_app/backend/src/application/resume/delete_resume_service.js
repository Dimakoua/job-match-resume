/**
 * DeleteResumeService
 * Deletes a resume by ID after verifying ownership
 */
export class DeleteResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute(command) {
    // Validate input
    if (!command.resumeId) {
      throw new Error('resumeId is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Get resume to verify it exists and user owns it
    const resume = await this.resumeRepository.findById(command.resumeId);
    
    if (!resume) {
      throw new Error('Resume not found');
    }

    if (resume.userId !== command.userId) {
      throw new Error('Access denied');
    }

    // Delete the resume
    await this.resumeRepository.delete(command.resumeId);

    return {
      success: true,
      id: command.resumeId
    };
  }
}
