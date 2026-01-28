import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUserService } from './login_user_service.js';

describe('LoginUserService', () => {
  let mockUserRepository;
  let service;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
    };
    service = new LoginUserService(mockUserRepository, 'test_secret');
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'dGVzdGhhc2g=', // base64 of 'test' hashed, but we'll mock
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    // Mock the verifyPassword to return true
    service.verifyPassword = vi.fn().mockResolvedValue(true);

    // Mock jwt.sign
    const mockToken = 'mock.jwt.token';
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    jwt.default.sign = vi.fn().mockResolvedValue(mockToken);

    const result = await service.execute({ email: 'test@example.com', password: 'password123' });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(service.verifyPassword).toHaveBeenCalledWith('password123', mockUser.passwordHash);
    expect(jwt.default.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-123',
        email: 'test@example.com',
        exp: expect.any(Number),
      }),
      'test_secret'
    );
    expect(result).toEqual({ user: mockUser, token: mockToken });
  });

  it('should throw error for non-existent email', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(service.execute({ email: 'nonexistent@example.com', password: 'password' }))
      .rejects.toThrow('Invalid email or password');
  });

  it('should throw error for invalid password', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: 'dGVzdGhhc2g=',
    };

    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    service.verifyPassword = vi.fn().mockResolvedValue(false);

    await expect(service.execute({ email: 'test@example.com', password: 'wrongpassword' }))
      .rejects.toThrow('Invalid email or password');
  });
});