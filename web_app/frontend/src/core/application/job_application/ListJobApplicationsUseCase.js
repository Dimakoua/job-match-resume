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
   * @param {boolean} command.includeArchived - Whether to include archived applications
   * @returns {Promise<JobApplication[]>} - Array of job applications
   */
  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    
    // Warn if neither list ID nor archive flag is set (optional strictness)
    // if (!command.jobSearchListId && !command.includeArchived) { ... }

    // Find all applications for the job search list
    const applications = await this.jobApplicationRepository.findAllByJobSearchListId(

      command.jobSearchListId,
      command.userId,
      { includeArchived: command.includeArchived }
    );

    return applications;
  }
}