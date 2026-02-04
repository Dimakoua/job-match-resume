/**
 * CreateJobSearchListUseCase
 *
 * Orchestrates the creation of a new job search list.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
import { JobSearchList } from '../../domain/job_search_list/JobSearchList.js';

export class CreateJobSearchListUseCase {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

  /**
   * Execute the creation
   * @param {Object} command
   * @param {string} command.userId - The user creating the list
   * @param {string} command.name - The list name
   * @param {string} [command.description] - Optional description
   * @returns {Promise<JobSearchList>} - The created list
   */
  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (!command.name) {
      throw new Error('name is required');
    }

    // Create list without ID (let repository generate it)
    const list = new JobSearchList(null, command.userId, command.name, command.description || null);

    // Save and get back the list with proper ID
    const savedList = await this.jobSearchListRepository.save(list);

    return savedList;
  }
}