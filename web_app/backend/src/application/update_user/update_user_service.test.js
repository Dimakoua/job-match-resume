import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpdateUserService } from './update_user_service.js';
import { User } from '../../domain/user/user.js';

describe('UpdateUserService', () => {
  let mockUserRepository;
  let service;

  beforeEach(() => {
    mockUserRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    };
    service = new UpdateUserService(mockUserRepository);
  });

  it('should update name successfully', async () => {
    const userId = 'user1';
    const existingUser = new User(userId, 'test@example.com', 'Old Name', 'hash');
    mockUserRepository.findById.mockResolvedValue(existingUser);

    const command = {
      userId,
      requesterId: userId,
      name: 'New Name',
    };

    const result = await service.execute(command);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result.name).toBe('New Name');
    expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser);
  });

  it('should update password successfully', async () => {
    const userId = 'user1';
    const existingUser = new User(userId, 'test@example.com', 'Name', 'oldhash');
    mockUserRepository.findById.mockResolvedValue(existingUser);

    const command = {
      userId,
      requesterId: userId,
      password: 'newpassword',
    };

    const result = await service.execute(command);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(result.passwordHash).not.toBe('oldhash'); // Should be hashed
    expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser);
  });

  it('should update both name and password', async () => {
    const userId = 'user1';
    const existingUser = new User(userId, 'test@example.com', 'Old Name', 'oldhash');
    mockUserRepository.findById.mockResolvedValue(existingUser);

    const command = {
      userId,
      requesterId: userId,
      name: 'New Name',
      password: 'newpassword',
    };

    const result = await service.execute(command);

    expect(result.name).toBe('New Name');
    expect(result.passwordHash).not.toBe('oldhash');
    expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser);
  });

  it('should throw error if requester is not the user', async () => {
    const command = {
      userId: 'user1',
      requesterId: 'user2',
      name: 'New Name',
    };

    await expect(service.execute(command)).rejects.toThrow('Unauthorized: Can only update your own profile');
  });

  it('should throw error if user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    const command = {
      userId: 'user1',
      requesterId: 'user1',
      name: 'New Name',
    };

    await expect(service.execute(command)).rejects.toThrow('User not found');
  });

  it('should throw error for invalid name', async () => {
    const userId = 'user1';
    const existingUser = new User(userId, 'test@example.com', 'Old Name', 'hash');
    mockUserRepository.findById.mockResolvedValue(existingUser);

    const command = {
      userId,
      requesterId: userId,
      name: '', // Invalid name
    };

    await expect(service.execute(command)).rejects.toThrow();
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('should not update if no fields provided', async () => {
    const userId = 'user1';
    const existingUser = new User(userId, 'test@example.com', 'Name', 'hash');
    mockUserRepository.findById.mockResolvedValue(existingUser);

    const command = {
      userId,
      requesterId: userId,
    };

    const result = await service.execute(command);

    expect(result).toBe(existingUser);
    expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser);
  });
});