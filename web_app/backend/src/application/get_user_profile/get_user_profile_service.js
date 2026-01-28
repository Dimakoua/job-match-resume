export class GetUserProfileService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Return user profile without password hash
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}