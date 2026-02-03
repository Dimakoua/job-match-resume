export class UpdateJobSearchListService {
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