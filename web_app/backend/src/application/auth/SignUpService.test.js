import { describe, it, expect, vi } from 'vitest';
import { SignUpService } from './SignUpService.js';
import { User } from '../../domain/user/user.js';

describe('SignUpService', () => {
  it('should successfully sign up a new user', async () => {
    const mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    const service = new SignUpService(mockUserRepository);

    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    const user = await service.execute(email, password, name);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe(email);
    expect(user.name).toBe(name);
    expect(user.passwordHash).not.toBe(password); // Should be hashed
  });

  it('should throw an error if user already exists', async () => {
    const mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };

    const existingUser = new User('existing-id', 'test@example.com', 'Existing User', 'hashedpass');
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    const service = new SignUpService(mockUserRepository);

    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Test User';

    await expect(service.execute(email, password, name)).rejects.toThrow('User with this email already exists');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});