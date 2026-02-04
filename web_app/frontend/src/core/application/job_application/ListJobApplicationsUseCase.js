/**
 * ListJobApplicationsUseCase
 *
 * Orchestrates listing job applications for a job search list.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class ListJobApplicationsUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  /**
   * Execute the listing
   * @param {Object} command
   * @param {string} command.jobSearchListId - The job search list ID
   * @param {string} command.userId - The user making the request
   * @returns {Promise<JobApplication[]>} - Array of job applications
   */
  async execute(command) {
    // Validate command
    if (!command.jobSearchListId) {
      throw new Error('jobSearchListId is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find all applications for the job search list
    const applications = await this.jobApplicationRepository.findAllByJobSearchListId(command.jobSearchListId, command.userId);

    return applications;
  }
}