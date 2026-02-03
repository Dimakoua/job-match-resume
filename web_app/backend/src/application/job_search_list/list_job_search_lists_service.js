export class ListJobSearchListsService {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

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