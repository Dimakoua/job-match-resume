import { User } from '../../domain/user/user.js';
import { newUUID } from '../../factory.js';
import bcrypt from 'bcryptjs';

export class SignUpService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password, name) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const id = newUUID();
    const user = new User(id, email, name, passwordHash);

    // Save the user
    await this.userRepository.save(user);

    return user;
  }
}