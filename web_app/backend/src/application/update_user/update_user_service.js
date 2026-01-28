import { hashPassword } from "../../utils/password";

export class UpdateUserService {
  constructor(userRepository, salt = 'default_salt') {
    this.userRepository = userRepository;
    this.salt = salt;
  }

  async execute(command) {
    // Validate requester is the user
    if (command.requesterId !== command.userId) {
      throw new Error('Unauthorized: Can only update your own profile');
    }

    // Find existing user
    const existingUser = await this.userRepository.findById(command.userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Update name if provided
    if (command.name !== undefined) {
      existingUser.updateName(command.name);
    }

    // Update password if provided
    if (command.password !== undefined) {
      const passwordHash = await hashPassword(command.password, this.salt);
      existingUser.updatePassword(passwordHash);
    }

    // Save updates
    await this.userRepository.update(existingUser);

    return existingUser;
  }
}