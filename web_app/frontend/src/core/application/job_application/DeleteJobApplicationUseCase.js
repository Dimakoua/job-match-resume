/**
 * DeleteJobApplicationUseCase
 *
 * Orchestrates deleting a job application.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class DeleteJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  /**
   * Execute the deletion
   * @param {Object} command
   * @param {string} command.id - The application ID to delete
   * @param {string} command.userId - The user making the deletion
   * @returns {Promise<Object>} - Success confirmation
   */
  async execute(command) {
    // Validate command
    if (!command.id) {
      throw new Error('id is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find the application
    const application = await this.jobApplicationRepository.findById(command.id);
    if (!application) {
      throw new Error('Job application not found');
    }

    // Check ownership
    if (application.userId !== command.userId) {
      throw new Error('Access denied');
    }

    // Delete
    await this.jobApplicationRepository.delete(command.id);

    return { success: true };
  }
}