/**
 * UpdateResumeUseCase
 *
 * Orchestrates updating a resume.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class UpdateResumeUseCase {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  /**
   * Execute the update
   * @param {Object} command
   * @param {Object} command.resume - The resume to update
   * @returns {Promise<Resume>} - The updated resume
   */
  async execute(command) {
    // Validate command
    if (!command.resume) {
      throw new Error('resume is required');
    }

    if (!command.resume.id) {
      throw new Error('resume.id is required');
    }

    // Validate resume
    if (command.resume.validate) {
      command.resume.validate();
    }

    // Update the resume
    const updated = await this.resumeRepository.update(command.resume.id, command.resume);

    return updated;
  }
}
