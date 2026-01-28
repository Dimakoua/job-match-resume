import { describe, it, expect, vi } from 'vitest';
import { AuthController } from './auth_controller.js';
import jwt from '@tsndr/cloudflare-worker-jwt';

vi.mock('@tsndr/cloudflare-worker-jwt', () => ({
  default: {
    verify: vi.fn(),
    sign: vi.fn(),
  },
}));

describe('AuthController', () => {
  let mockSignUpService;
  let mockLoginService;
  let mockUpdateUserService;
  let mockListUserTeamsService;
  let mockGetUserProfileService;
  let controller;

  beforeEach(() => {
    mockSignUpService = {
      execute: vi.fn(),
    };
    mockLoginService = {
      execute: vi.fn(),
    };
    mockUpdateUserService = {
      execute: vi.fn(),
    };
    mockListUserTeamsService = {
      execute: vi.fn(),
    };
    mockGetUserProfileService = {
      execute: vi.fn(),
    };
    const mockDeps = {
      signUpService: mockSignUpService,
      loginService: mockLoginService,
      updateUserService: mockUpdateUserService,
      listUserTeamsService: mockListUserTeamsService,
      getUserProfileService: mockGetUserProfileService,
    };
    controller = new AuthController(mockDeps, 'test_secret');
  });

  describe('signUp', () => {
    it('should return 201 and user data with token on successful sign up', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockToken = 'mock.jwt.token';
      mockSignUpService.execute.mockResolvedValue(mockUser);
      mockLoginService.execute.mockResolvedValue({ user: mockUser, token: mockToken });

      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: mockToken,
      });
      expect(mockSignUpService.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      });
      expect(mockLoginService.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return 400 for invalid email', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.message).toBe('Invalid request data');
    });

    it('should return 400 for missing name', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          name: '',
          password: 'password123',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          name: 'Test User',
          password: 'short',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 for email already in use', async () => {
      mockSignUpService.execute.mockRejectedValue(new Error('Email already in use'));

      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.error.code).toBe('EMAIL_IN_USE');
    });

    it('should return 500 for unexpected errors', async () => {
      mockSignUpService.execute.mockRejectedValue(new Error('Unexpected error'));

      const request = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        }),
      };

      const response = await controller.signUp(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('updateUser', () => {
    it('should return 200 and updated user data on successful update', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Updated Name',
      };
      mockUpdateUserService.execute.mockResolvedValue(mockUser);

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          name: 'Updated Name',
        }),
      };

      // Mock the authenticate method
      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({
        user: {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Updated Name',
        },
      });
      expect(mockUpdateUserService.execute).toHaveBeenCalledWith({
        name: 'Updated Name',
        userId: 'user-id',
        requesterId: 'user-id',
      });
    });

    it('should return 401 for missing auth token', async () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        json: vi.fn().mockResolvedValue({
          name: 'Updated Name',
        }),
      };

      controller.authenticate = vi.fn().mockRejectedValue(new Response(JSON.stringify({ error: { code: 'Unauthorized', message: 'Authentication required' } }), { status: 401 }));

      const response = await controller.updateUser(request);

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid name', async () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          name: '',
        }),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for short password', async () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          password: 'short',
        }),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for no fields provided', async () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({}),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for user not found', async () => {
      mockUpdateUserService.execute.mockRejectedValue(new Error('User not found'));

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          name: 'Updated Name',
        }),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 403 for unauthorized update', async () => {
      mockUpdateUserService.execute.mockRejectedValue(new Error('Unauthorized: Can only update your own profile'));

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          name: 'Updated Name',
        }),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 500 for unexpected errors', async () => {
      mockUpdateUserService.execute.mockRejectedValue(new Error('Unexpected error'));

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer valid.jwt.token'),
        },
        json: vi.fn().mockResolvedValue({
          name: 'Updated Name',
        }),
      };

      controller.authenticate = vi.fn().mockResolvedValue('user-id');

      const response = await controller.updateUser(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('getUserProfile', () => {
    it('should return 200 and user profile on success', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      mockGetUserProfileService.execute.mockResolvedValue(mockProfile);

      controller.verifyToken = vi.fn().mockResolvedValue({ userId: 'user-123' });

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer fake-token'),
        },
      };

      const response = await controller.getUserProfile(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.profile).toEqual(mockProfile);
      expect(mockGetUserProfileService.execute).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('should return 401 if authentication fails', async () => {
      controller.verifyToken = vi.fn().mockResolvedValue(null);

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer invalid-token'),
        },
      };

      const response = await controller.getUserProfile(request);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe('Unauthorized');
    });

    it('should return 500 on service error', async () => {
      mockGetUserProfileService.execute.mockRejectedValue(new Error('Service error'));

      controller.verifyToken = vi.fn().mockResolvedValue({ userId: 'user-123' });

      const request = {
        headers: {
          get: vi.fn().mockReturnValue('Bearer fake-token'),
        },
      };

      const response = await controller.getUserProfile(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('googleAuth', () => {
    it('should redirect to Google OAuth URL when configured', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_REDIRECT_URI: 'https://example.com/callback',
      };
      const request = {
        url: 'https://example.com/api/auth/google',
      };

      const response = await controller.googleAuth(request, mockEnv);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(response.headers.get('Location')).toContain('client_id=test-client-id');
      expect(response.headers.get('Location')).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
    });

    it('should use default redirect URI when not provided', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
      };
      const request = {
        url: 'https://example.com/api/auth/google',
      };

      const response = await controller.googleAuth(request, mockEnv);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Fauth%2Fgoogle%2Fcallback');
    });

    it('should return 500 when Google Client ID not configured', async () => {
      const mockEnv = {};
      const request = {
        url: 'https://example.com/api/auth/google',
      };

      const response = await controller.googleAuth(request, mockEnv);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('CONFIG_ERROR');
    });
  });

  describe('googleAuthCallback', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return 400 when authorization code is missing', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-secret',
      };
      const request = {
        url: 'https://example.com/api/auth/google/callback',
      };

      const response = await controller.googleAuthCallback(request, mockEnv);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    it('should return 500 when Google OAuth not configured', async () => {
      const mockEnv = {};
      const request = {
        url: 'https://example.com/api/auth/google/callback?code=test-code',
      };

      const response = await controller.googleAuthCallback(request, mockEnv);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('CONFIG_ERROR');
    });

    it('should handle successful Google OAuth flow', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-secret',
      };
      const request = {
        url: 'https://example.com/api/auth/google/callback?code=test-code',
      };

      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-access-token' }),
      };
      const mockUserResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'google-id-123',
          email: 'user@example.com',
          name: 'Google User',
        }),
      };
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Google User',
      };

      global.fetch
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockUserResponse);

      mockSignUpService.execute.mockResolvedValue(mockUser);
      jwt.sign.mockResolvedValue('mock.jwt.token');

      const response = await controller.googleAuthCallback(request, mockEnv);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        name: 'Google User',
      });
      expect(body.data.token).toBeDefined();
    });

    it('should handle token exchange failure', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-secret',
      };
      const request = {
        url: 'https://example.com/api/auth/google/callback?code=test-code',
      };

      const mockTokenResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Invalid code'),
      };

      global.fetch.mockResolvedValue(mockTokenResponse);

      const response = await controller.googleAuthCallback(request, mockEnv);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('OAUTH_ERROR');
    });

    it('should handle user info fetch failure', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        GOOGLE_CLIENT_SECRET: 'test-secret',
      };
      const request = {
        url: 'https://example.com/api/auth/google/callback?code=test-code',
      };

      const mockTokenResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ access_token: 'test-access-token' }),
      };
      const mockUserResponse = {
        ok: false,
        text: vi.fn().mockResolvedValue('Invalid token'),
      };

      global.fetch
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockUserResponse);

      const response = await controller.googleAuthCallback(request, mockEnv);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('OAUTH_ERROR');
    });
  });

  describe('googleLogin', () => {
    it('should return 400 when ID token is missing', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
      };
      const request = {
        json: vi.fn().mockResolvedValue({}),
      };

      const response = await controller.googleLogin(request, mockEnv);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    it('should return 500 when Google Client ID not configured', async () => {
      const mockEnv = {};
      const request = {
        json: vi.fn().mockResolvedValue({ idToken: 'test-token' }),
      };

      const response = await controller.googleLogin(request, mockEnv);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error.code).toBe('CONFIG_ERROR');
    });

    it('should handle successful Google login with ID token', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
      };
      const request = {
        json: vi.fn().mockResolvedValue({ idToken: 'test-id-token' }),
      };

      const mockDecoded = {
        payload: {
          sub: 'google-id-123',
          email: 'user@example.com',
          name: 'Google User',
        },
      };

      jwt.verify.mockResolvedValue(mockDecoded);

      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        name: 'Google User',
      };

      mockSignUpService.execute.mockResolvedValue(mockUser);
      jwt.sign.mockResolvedValue('mock.jwt.token');

      const response = await controller.googleLogin(request, mockEnv);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.user).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        name: 'Google User',
      });
      expect(body.data.token).toBeDefined();
    });

    it('should return 401 for invalid ID token', async () => {
      const mockEnv = {
        GOOGLE_CLIENT_ID: 'test-client-id',
      };
      const request = {
        json: vi.fn().mockResolvedValue({ idToken: 'invalid-token' }),
      };

      jwt.verify.mockResolvedValue(null);

      const response = await controller.googleLogin(request, mockEnv);

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error.code).toBe('INVALID_TOKEN');
    });
  });
});