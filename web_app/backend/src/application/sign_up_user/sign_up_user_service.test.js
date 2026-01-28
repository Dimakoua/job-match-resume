import { describe, it, expect, vi } from 'vitest';
import { SignUpUserService } from './sign_up_user_service.js';
import { User } from '../../domain/user/user.js';

describe('SignUpUserService', () => {
  let mockUserRepository;
  let service;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findByGoogleId: vi.fn(),
      save: vi.fn(),
    };
    service = new SignUpUserService(mockUserRepository, 'test_salt');
  });

  it('should create and save a new user on success', async () => {
    const command = { email: 'test@example.com', name: 'Test User', password: 'password123' };
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    const result = await service.execute(command);

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.passwordHash).toBeDefined();
  });

  it('should throw error if email already in use', async () => {
    const command = { email: 'existing@example.com', name: 'Existing User', password: 'password123' };
    const existingUser = new User('id', 'existing@example.com', 'Existing', 'hash');
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(service.execute(command)).rejects.toThrow('Email already in use');

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should create and save a new Google user on success', async () => {
    const command = { googleId: 'google123', email: 'google@example.com', name: 'Google User' };
    mockUserRepository.findByGoogleId.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.save.mockResolvedValue();

    const result = await service.execute(command);

    expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith('google123');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('google@example.com');
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe('google@example.com');
    expect(result.name).toBe('Google User');
    expect(result.googleId).toBe('google123');
    expect(result.passwordHash).toBe(null);
  });

  it('should return existing Google user if googleId already exists', async () => {
    const command = { googleId: 'existing_google_id', email: 'existing@example.com', name: 'Existing Google User' };
    const existingUser = new User('id', 'existing@example.com', 'Existing Google', null, 'existing_google_id');
    mockUserRepository.findByGoogleId.mockResolvedValue(existingUser);

    const result = await service.execute(command);

    expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith('existing_google_id');
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(result).toBe(existingUser);
  });

  it('should throw error if Google sign up email already in use', async () => {
    const command = { googleId: 'google123', email: 'existing@example.com', name: 'Google User' };
    const existingUser = new User('id', 'existing@example.com', 'Existing', 'hash');
    mockUserRepository.findByGoogleId.mockResolvedValue(null);
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(service.execute(command)).rejects.toThrow('Email already in use');

    expect(mockUserRepository.findByGoogleId).toHaveBeenCalledWith('google123');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});