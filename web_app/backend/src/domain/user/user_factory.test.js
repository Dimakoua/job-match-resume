import { describe, it, expect, vi } from 'vitest';
import { fakeUser } from './user_factory.js';
import { User } from './user.js';

describe('fakeUser', () => {
  it('should create a user with defaults', async () => {
    const mockRepo = { save: vi.fn() };
    const user = await fakeUser(mockRepo, {});
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBeDefined();
    expect(user.email).toMatch(/user-.*@coffee-run\.com/);
    expect(user.name).toBe('Test User');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should create a user with provided opts', async () => {
    const mockRepo = { save: vi.fn() };
    const opts = { id: 'custom-id', name: 'John Doe', email: 'john@example.com' };
    const user = await fakeUser(mockRepo, opts);
    expect(user.id).toBe('custom-id');
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should save the user if persisted is true', async () => {
    const mockRepo = { save: vi.fn().mockResolvedValue() };
    const opts = { persisted: true };
    const user = await fakeUser(mockRepo, opts);
    expect(user).toBeInstanceOf(User);
    expect(mockRepo.save).toHaveBeenCalledWith(user);
  });

  it('should not save if persisted is false', async () => {
    const mockRepo = { save: vi.fn() };
    const opts = { persisted: false };
    const user = await fakeUser(mockRepo, opts);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});