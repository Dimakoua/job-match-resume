import { JobSearchList } from '../../domain/job_search_list/job_search_list.js';

export class CreateJobSearchListService {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (!command.name) {
      throw new Error('name is required');
    }

    // Generate ID
    const id = crypto.randomUUID();

    // Create list
    const list = new JobSearchList(id, command.userId, command.name, command.description || null);

    // Save
    await this.jobSearchListRepository.save(list);

    return list;
  }
}