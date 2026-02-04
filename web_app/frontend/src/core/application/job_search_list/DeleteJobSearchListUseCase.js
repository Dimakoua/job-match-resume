/**
 * DeleteJobSearchListUseCase
 *
 * Orchestrates deleting a job search list.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class DeleteJobSearchListUseCase {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

  /**
   * Execute the deletion
   * @param {Object} command
   * @param {string} command.id - The list ID to delete
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

    // Find the list
    const list = await this.jobSearchListRepository.findById(command.id);
    if (!list) {
      throw new Error('Job search list not found');
    }

    // Check ownership
    if (list.userId !== command.userId) {
      throw new Error('Access denied');
    }

    // Delete
    await this.jobSearchListRepository.delete(command.id);

    return { success: true };
  }
}