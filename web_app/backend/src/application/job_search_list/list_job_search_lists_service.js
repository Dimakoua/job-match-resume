export class ListJobSearchListsService {
  constructor(jobSearchListRepository, jobApplicationRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find all lists for user
    const lists = await this.jobSearchListRepository.findAllByUserId(command.userId);

    // Add application count to each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const applicationCount = await this.jobApplicationRepository.countByUserId(command.userId, {
          jobSearchListId: list.id
        });
        return {
          ...list,
          applicationCount
        };
      })
    );

    return listsWithCounts;
  }
}