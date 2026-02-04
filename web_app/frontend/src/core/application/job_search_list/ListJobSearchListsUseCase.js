/**
 * ListJobSearchListsUseCase
 *
 * Orchestrates listing all job search lists for a user.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class ListJobSearchListsUseCase {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

  /**
   * Execute the listing
   * @param {Object} command
   * @param {string} command.userId - The user whose lists to retrieve
   * @returns {Promise<JobSearchList[]>} - Array of job search lists
   */
  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find all lists for user
    const lists = await this.jobSearchListRepository.findAllByUserId(command.userId);

    return lists;
  }
}