/**
 * GetJobApplicationUseCase
 *
 * Orchestrates getting a single job application.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class GetJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  /**
   * Execute the get
   * @param {Object} command
   * @param {string} command.applicationId - The application ID
   * @param {string} command.userId - The user making the request
   * @returns {Promise<JobApplication>} - The job application
   */
  async execute(command) {
    // Validate command
    if (!command.applicationId) {
      throw new Error('applicationId is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find the application
    const application = await this.jobApplicationRepository.findById(command.applicationId);

    if (!application) {
      throw new Error('Job application not found');
    }

    return application;
  }
}