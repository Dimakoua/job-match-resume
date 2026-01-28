import { describe, it, expect, beforeEach } from 'vitest';
import { D1UserRepository } from './d1_user_repository.js';
import { User } from '../../../domain/user/user.js';
import { newUUID, Factory } from '../../../factory.js';

describe('D1UserRepository Integration Tests', () => {
  let db;
  let repo;
  let factory;

  beforeEach(() => {
    db = global.DB;
    if (!db) {
      repo = null;
      factory = null;
      return;
    }
    repo = new D1UserRepository(db);
    factory = new Factory(db);
  });

  it('should save and find a user by ID', async () => {
    const userId = newUUID();
    const email = `test${userId}@example.com`;
    const name = 'Test User';
    const user = new User(userId, email, name, 'hashedpass');

    // Save the user
    await repo.save(user);

    // Find the user
    const foundUser = await repo.findById(userId);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userId);
    expect(foundUser.email).toBe(email);
    expect(foundUser.name).toBe(name);
    expect(foundUser.passwordHash).toBe('hashedpass');
    expect(foundUser.googleId).toBe(null);
  });

  it('should return null for non-existent user', async () => {
    const nonExistentId = newUUID();
    const foundUser = await repo.findById(nonExistentId);
    expect(foundUser).toBeNull();
  });

  it('should find a user by email', async () => {
    const userId = newUUID();
    const email = `emailtest${userId}@example.com`;
    const name = 'Email Test User';
    const user = new User(userId, email, name, 'hashedpass');

    await repo.save(user);

    const foundUser = await repo.findByEmail(email);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userId);
    expect(foundUser.email).toBe(email);
    expect(foundUser.name).toBe(name);
    expect(foundUser.googleId).toBe(null);
  });

  it('should return null for non-existent email', async () => {
    const nonExistentEmail = `nonexistent${newUUID()}@example.com`;
    const foundUser = await repo.findByEmail(nonExistentEmail);
    expect(foundUser).toBeNull();
  });

  it('should find a user by Google ID', async () => {
    const userId = newUUID();
    const email = `googletest${userId}@example.com`;
    const name = 'Google Test User';
    const googleId = 'google123';
    const user = new User(userId, email, name, 'hashedpass', googleId);

    await repo.save(user);

    const foundUser = await repo.findByGoogleId(googleId);

    expect(foundUser).not.toBeNull();
    expect(foundUser.id).toBe(userId);
    expect(foundUser.email).toBe(email);
    expect(foundUser.name).toBe(name);
    expect(foundUser.googleId).toBe(googleId);
  });

  it('should return null for non-existent Google ID', async () => {
    const nonExistentGoogleId = 'nonexistentgoogleid';
    const foundUser = await repo.findByGoogleId(nonExistentGoogleId);
    expect(foundUser).toBeNull();
  });

  it('should throw error on save with invalid data', async () => {
    const userId = newUUID();
    const email = `unique${userId}@example.com`;
    const user = new User(userId, email, 'Test User', 'hash');

    await repo.save(user);
    // Saving again should fail due to unique constraint on id (primary key)
    await expect(repo.save(user)).rejects.toThrow('Failed to save user');
  });

  it('should update user name and password', async () => {
    const userId = newUUID();
    const email = `update${userId}@example.com`;
    const user = new User(userId, email, 'Original Name', 'originalhash');

    // Save the user
    await repo.save(user);

    // Update name and password
    user.updateName('Updated Name');
    user.updatePassword('updatedhash');
    await repo.update(user);

    // Find and verify
    const updatedUser = await repo.findById(userId);
    expect(updatedUser).not.toBeNull();
    expect(updatedUser.id).toBe(userId);
    expect(updatedUser.email).toBe(email);
    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.passwordHash).toBe('updatedhash');
    expect(updatedUser.googleId).toBe(null);
  });
});