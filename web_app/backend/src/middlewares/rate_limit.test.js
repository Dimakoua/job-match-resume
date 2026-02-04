import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter, RateLimitLevels } from './rate_limit.js';

describe('RateLimiter', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000 // 1 second for testing
    });
  });

  it('should allow requests within limit', () => {
    const ip = '192.168.1.1';

    for (let i = 0; i < 3; i++) {
      const result = limiter.check(ip);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(2 - i);
    }
  });

  it('should block requests over limit', () => {
    const ip = '192.168.1.1';

    // Use up the limit
    for (let i = 0; i < 3; i++) {
      limiter.check(ip);
    }

    // Next request should be limited
    const result = limiter.check(ip);
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should reset after window expires', async () => {
    const ip = '192.168.1.1';

    // Use up the limit
    for (let i = 0; i < 3; i++) {
      limiter.check(ip);
    }

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should allow new requests
    const result = limiter.check(ip);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  it('should track different IPs separately', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    // IP1 uses up limit
    for (let i = 0; i < 3; i++) {
      limiter.check(ip1);
    }

    // IP2 should still be allowed
    const result = limiter.check(ip2);
    expect(result.limited).toBe(false);
    expect(result.remaining).toBe(2);
  });

  it('should cleanup old entries', () => {
    const ip1 = '192.168.1.1';
    const ip2 = '192.168.1.2';

    limiter.check(ip1);
    limiter.check(ip2);

    // Manually set old timestamp for ip1
    limiter.requests.get(ip1)[0] = Date.now() - 2000;

    limiter.cleanup();

    expect(limiter.requests.has(ip1)).toBe(false);
    expect(limiter.requests.has(ip2)).toBe(true);
  });
});

describe('RateLimitLevels', () => {
  it('should have predefined levels with correct limits', () => {
    expect(RateLimitLevels.STRICT.maxRequests).toBe(5);
    expect(RateLimitLevels.STANDARD.maxRequests).toBe(100);
    expect(RateLimitLevels.RELAXED.maxRequests).toBe(300);
  });

  it('should have 15 minute windows for all levels', () => {
    expect(RateLimitLevels.STRICT.windowMs).toBe(15 * 60 * 1000);
    expect(RateLimitLevels.STANDARD.windowMs).toBe(15 * 60 * 1000);
    expect(RateLimitLevels.RELAXED.windowMs).toBe(15 * 60 * 1000);
  });
});
