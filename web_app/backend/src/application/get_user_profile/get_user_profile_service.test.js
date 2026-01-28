import { describe, it, expect, vi } from 'vitest';
import { GetUserProfileService } from './get_user_profile_service.js';

describe('GetUserProfileService', () => {
  const mockUserRepository = {
    findById: vi.fn(),
  };

  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GetUserProfileService(mockUserRepository);
  });

  it('should return user profile on successful retrieval', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
    };

    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await service.execute({ userId: 'user-123' });

    expect(result).toEqual({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
    });
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
  });

  it('should throw error when user not found', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(service.execute({ userId: 'user-123' })).rejects.toThrow('User not found');
    expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
  });
});