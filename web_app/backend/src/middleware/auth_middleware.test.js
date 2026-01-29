import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authMiddleware } from './auth_middleware.js';

describe('Auth Middleware', () => {
  let mockJwt;
  let jwtSecret;
  let env;
  let ctx;

  beforeEach(() => {
    // Mock the JWT library
    mockJwt = {
      verify: vi.fn(),
      decode: vi.fn(),
    };

    // Mock the import
    vi.doMock('@tsndr/cloudflare-worker-jwt', () => mockJwt);

    jwtSecret = 'test-secret';
    env = {};
    ctx = {};
  });

  it('should authenticate valid token and inject userId', async () => {
    const userId = 'user-123';
    const validToken = 'valid.jwt.token';

    // Mock successful verification
    mockJwt.verify.mockResolvedValue(true);
    mockJwt.decode.mockReturnValue({
      payload: { userId }
    });

    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', `Bearer ${validToken}`]]),
    };

    const result = await middleware(request, env, ctx);

    // Should continue to next handler (return undefined)
    expect(result).toBeUndefined();
    expect(request.userId).toBe(userId);
    expect(mockJwt.verify).toHaveBeenCalledWith(validToken, jwtSecret);
    expect(mockJwt.decode).toHaveBeenCalledWith(validToken);
  });

  it('should return 401 for missing Authorization header', async () => {
    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map(),
    };

    const result = await middleware(request, env, ctx);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(401);

    const body = await result.json();
    expect(body.error.code).toBe('Unauthorized');
    expect(body.error.message).toBe('Authentication required');
  });

  it('should return 401 for Authorization header without Bearer prefix', async () => {
    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', 'invalid-token-format']]),
    };

    const result = await middleware(request, env, ctx);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(401);

    const body = await result.json();
    expect(body.error.code).toBe('Unauthorized');
    expect(body.error.message).toBe('Authentication required');
  });

  it('should return 401 for invalid token', async () => {
    const invalidToken = 'invalid.jwt.token';

    // Mock failed verification
    mockJwt.verify.mockResolvedValue(false);

    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', `Bearer ${invalidToken}`]]),
    };

    const result = await middleware(request, env, ctx);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(401);

    const body = await result.json();
    expect(body.error.code).toBe('Unauthorized');
    expect(body.error.message).toBe('Invalid token');
  });

  it('should return 500 for token verification error', async () => {
    const token = 'some.token';

    // Mock verification throwing error
    mockJwt.verify.mockRejectedValue(new Error('Verification failed'));

    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const result = await middleware(request, env, ctx);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(500);

    const body = await result.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Authentication error');
  });

  it('should handle empty Bearer token', async () => {
    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', 'Bearer ']]),
    };

    const result = await middleware(request, env, ctx);

    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(401);

    const body = await result.json();
    expect(body.error.code).toBe('Unauthorized');
    expect(body.error.message).toBe('Authentication required');
  });

  it('should handle malformed Authorization header', async () => {
    const middleware = authMiddleware(jwtSecret);
    const request = {
      headers: new Map([['Authorization', 'Bearer token with spaces']]),
    };

    // Mock successful verification for the malformed token
    mockJwt.verify.mockResolvedValue(true);
    mockJwt.decode.mockReturnValue({
      payload: { userId: 'user-123' }
    });

    const result = await middleware(request, env, ctx);

    // Should still work if JWT library can handle it
    expect(result).toBeUndefined();
    expect(request.userId).toBe('user-123');
  });
});