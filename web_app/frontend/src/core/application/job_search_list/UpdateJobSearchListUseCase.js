/**
 * UpdateJobSearchListUseCase
 *
 * Orchestrates updating a job search list.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class UpdateJobSearchListUseCase {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

  /**
   * Execute the update
   * @param {Object} command
   * @param {string} command.id - The list ID to update
   * @param {string} command.userId - The user making the update
   * @param {string} [command.name] - New name (optional)
   * @param {string} [command.description] - New description (optional)
   * @returns {Promise<JobSearchList>} - The updated list
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

    // Update fields if provided
    if (command.name !== undefined) {
      list.updateName(command.name);
    }
    if (command.description !== undefined) {
      list.updateDescription(command.description);
    }

    // Save
    await this.jobSearchListRepository.update(list);

    return list;
  }
}