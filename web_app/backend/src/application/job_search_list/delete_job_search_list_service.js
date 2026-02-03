export class DeleteJobSearchListService {
  constructor(jobSearchListRepository) {
    this.jobSearchListRepository = jobSearchListRepository;
  }

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