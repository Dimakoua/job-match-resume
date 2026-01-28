import { describe, it, expect, beforeEach } from 'vitest';
import { SignUpUserService } from './sign_up_user_service.js';
import { D1UserRepository } from '../../adapters/repositories/user/d1_user_repository.js';

describe('SignUpUserService Integration Tests', () => {
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    if (!db) {
      service = null;
      return;
    }

    // Clean the test database
    await db.prepare('DELETE FROM Users').run();
    const repo = new D1UserRepository(db);
    service = new SignUpUserService(repo, 'integration_salt');
  });

  afterAll(async () => {
    if (db) {
      // Clean up after all tests
      await db.prepare('DELETE FROM Users').run();
    }
  });

  it('should create and save a new user with real DB', async () => {
    if (!service) return;
    const command = { email: `integration${Date.now()}@example.com`, name: 'Integration User', password: 'password123' };

    const result = await service.execute(command);

    expect(result).toBeDefined();
    expect(result.email).toBe(command.email);
    expect(result.name).toBe(command.name);
    expect(result.passwordHash).toBeDefined();
    expect(result.passwordHash).not.toBe(''); // Ensure hash is generated

    // Verify persistence by querying the repository
    const repo = new D1UserRepository(db);
    const savedUser = await repo.findByEmail(command.email);
    expect(savedUser).not.toBeNull();
    expect(savedUser.id).toBe(result.id);
    expect(savedUser.email).toBe(command.email);
    expect(savedUser.name).toBe(command.name);
  });

  it('should throw error if email already exists in real DB', async () => {
    if (!service) return;
    const email = `duplicate${Date.now()}@example.com`;
    const command1 = { email, name: 'First User', password: 'password123' };
    const command2 = { email, name: 'Second User', password: 'password456' };

    // First signup should succeed
    await service.execute(command1);

    // Second should fail
    await expect(service.execute(command2)).rejects.toThrow('Email already in use');
  });
});