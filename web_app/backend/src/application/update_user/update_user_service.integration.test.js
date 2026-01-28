import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateUserService } from './update_user_service.js';
import { D1UserRepository } from '../../adapters/repositories/user/d1_user_repository.js';
import { Factory } from '../../factory.js';

describe('UpdateUserService Integration Tests', () => {
  let service;
  let userRepository;
  let factory;

  beforeEach(() => {
    const db = global.DB;
    if (!db) {
      service = null;
      userRepository = null;
      factory = null;
      return;
    }
    userRepository = new D1UserRepository(db);
    service = new UpdateUserService(userRepository);
    factory = new Factory(db);
  });

  it('should update user name successfully', async () => {
    if (!service) return;

    // Create a test user
    const testUser = await factory.insert('user', {
      email: 'update_name@example.com',
      name: 'Original Name',
      passwordHash: 'originalhash',
    });

    // Update name
    const command = {
      userId: testUser.id,
      requesterId: testUser.id,
      name: 'Updated Name',
    };

    const result = await service.execute(command);

    expect(result.name).toBe('Updated Name');
    expect(result.id).toBe(testUser.id);

    // Verify in DB
    const updatedUser = await userRepository.findById(testUser.id);
    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.passwordHash).toBe('originalhash'); // unchanged
  });

  it('should update user password successfully', async () => {
    if (!service) return;

    // Create a test user
    const testUser = await factory.insert('user', {
      email: 'update_password@example.com',
      name: 'Test User',
      passwordHash: 'originalhash',
    });

    // Update password
    const command = {
      userId: testUser.id,
      requesterId: testUser.id,
      password: 'newpassword123',
    };

    const result = await service.execute(command);

    expect(result.name).toBe('Test User');
    expect(result.id).toBe(testUser.id);
    expect(result.passwordHash).not.toBe('originalhash'); // should be hashed

    // Verify in DB
    const updatedUser = await userRepository.findById(testUser.id);
    expect(updatedUser.passwordHash).not.toBe('originalhash');
    expect(updatedUser.passwordHash).toBe(result.passwordHash);
  });

  it('should update both name and password', async () => {
    if (!service) return;

    // Create a test user
    const testUser = await factory.insert('user', {
      email: 'update_both@example.com',
      name: 'Original Name',
      passwordHash: 'originalhash',
    });

    // Update both
    const command = {
      userId: testUser.id,
      requesterId: testUser.id,
      name: 'New Name',
      password: 'newpassword456',
    };

    const result = await service.execute(command);

    expect(result.name).toBe('New Name');
    expect(result.passwordHash).not.toBe('originalhash');

    // Verify in DB
    const updatedUser = await userRepository.findById(testUser.id);
    expect(updatedUser.name).toBe('New Name');
    expect(updatedUser.passwordHash).toBe(result.passwordHash);
  });

  it('should throw error if requester is not the user', async () => {
    if (!service) return;

    const command = {
      userId: 'user1',
      requesterId: 'user2',
      name: 'New Name',
    };

    await expect(service.execute(command)).rejects.toThrow('Unauthorized: Can only update your own profile');
  });

  it('should throw error if user not found', async () => {
    if (!service) return;

    const command = {
      userId: 'nonexistent',
      requesterId: 'nonexistent',
      name: 'New Name',
    };

    await expect(service.execute(command)).rejects.toThrow('User not found');
  });

  it('should throw error for invalid name', async () => {
    if (!service) return;

    // Create a test user
    const testUser = await factory.insert('user', {
      email: 'invalid_name@example.com',
      name: 'Valid Name',
      passwordHash: 'hash',
    });

    const command = {
      userId: testUser.id,
      requesterId: testUser.id,
      name: '', // Invalid
    };

    await expect(service.execute(command)).rejects.toThrow();
  });
});