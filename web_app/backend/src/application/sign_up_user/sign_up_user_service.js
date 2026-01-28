import { User } from '../../domain/user/user.js';
import { hashPassword } from '../../utils/password.js';

export class SignUpUserService {
  constructor(userRepository, salt = 'default_salt') {
    this.userRepository = userRepository;
    this.salt = salt;
  }

  async execute(command) {
    if (command.googleId) {
      // Google Auth sign up
      return await this._signUpWithGoogle(command);
    } else {
      // Traditional email/password sign up
      return await this._signUpWithEmail(command);
    }
  }

  async _signUpWithEmail(command) {
    // Check for duplicate email
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    // Hash password
    const passwordHash = await hashPassword(command.password, this.salt);

    // Create user
    const id = crypto.randomUUID();
    const user = new User(id, command.email, command.name, passwordHash);

    // Save
    await this.userRepository.save(user);

    return user;
  }

  async _signUpWithGoogle(command) {
    // Check if user already exists with this Google ID
    const existingByGoogleId = await this.userRepository.findByGoogleId(command.googleId);
    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    // Check for duplicate email
    const existingByEmail = await this.userRepository.findByEmail(command.email);
    if (existingByEmail) {
      throw new Error('Email already in use');
    }

    // Create user without password
    const id = crypto.randomUUID();
    const user = new User(id, command.email, command.name, null, command.googleId);

    // Save
    await this.userRepository.save(user);

    return user;
  }
}