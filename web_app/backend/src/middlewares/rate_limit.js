/**
 * Rate Limiting Middleware for Cloudflare Workers
 * Production-ready implementation with multiple security levels
 */

import { logger } from '../utils/logger.js';

// ==================== RATE LIMITER CLASS ====================

class RateLimiter {
  constructor(options = {}) {
    this.requests = new Map();
    this.maxRequests = options.maxRequests || 1000000;
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Check if request should be rate limited
   * @param {string} identifier - Client identifier (IP address)
   * @returns {object} - { limited: boolean, resetTime: number, remaining: number }
   */
  check(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier);
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);

    const isLimited = validRequests.length >= this.maxRequests;

    if (!isLimited) {
      validRequests.push(now);
      this.requests.set(identifier, validRequests);
    }

    const resetTime = windowStart + this.windowMs;
    const remaining = Math.max(0, this.maxRequests - validRequests.length);

    return {
      limited: isLimited,
      resetTime,
      remaining
    };
  }

  /**
   * Clean up old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// ==================== RATE LIMIT LEVELS ====================

/**
 * Predefined rate limiting levels
 */
const RateLimitLevels = {
  STRICT: new RateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 }),      // 5 req/15min - Auth endpoints
  STANDARD: new RateLimiter({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),  // 100 req/15min - General API
  RELAXED: new RateLimiter({ maxRequests: 300, windowMs: 15 * 60 * 1000 }),   // 300 req/15min - Read operations
};

// ==================== MIDDLEWARE ====================

/**
 * Extract client IP from Cloudflare headers
 */
function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
         request.headers.get('X-Real-IP') ||
         'unknown';
}

/**
 * Create rate limiting middleware
 * @param {object} options - Configuration options
 * @param {string} options.level - 'STRICT' | 'STANDARD' | 'RELAXED'
 * @param {string[]} options.excludePaths - Paths to exclude from rate limiting
 */
export function rateLimitMiddleware(options = {}) {
  const level = options.level || 'STANDARD';
  const limiter = RateLimitLevels[level] || RateLimitLevels.STANDARD;
  const excludePaths = options.excludePaths || [];

  logger.info('Rate limit middleware initialized', { level, maxRequests: limiter.maxRequests, windowMinutes: limiter.windowMs / 60000 });

  return async (request) => {
    try {
      // Get the request path for checking
      const url = new URL(request.url);
      const path = url.pathname;

      // Check if path should be excluded first
      const shouldExclude = excludePaths.some(excludePath => path === excludePath || path.startsWith(excludePath + '/'));
      if (shouldExclude) {
        logger.debug('Rate limit skipped for excluded path', { path });
        return;
      }

      // Perform periodic cleanup on request (if needed)
      const now = Date.now();
      if (!global.__rateLimitLastCleanup || now - global.__rateLimitLastCleanup > 5 * 60 * 1000) {
        const entriesCount = Array.from(Object.values(RateLimitLevels)).reduce((sum, l) => sum + l.requests.size, 0);
        logger.info('Rate limit cleanup triggered', { trackedIPs: entriesCount });
        Object.values(RateLimitLevels).forEach(l => l.cleanup());
        global.__rateLimitLastCleanup = now;
      }

      const clientIP = getClientIP(request);
      const result = limiter.check(clientIP);

      if (result.limited) {
        logger.warn('Rate limit exceeded', { clientIP, limit: limiter.maxRequests, remaining: result.remaining, resetInSeconds: Math.ceil((result.resetTime - now) / 1000) });
        const resetTime = new Date(result.resetTime);
        return new Response(JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limiter.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': resetTime.toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        });
      } else {
        logger.debug('Rate limit allowed', { clientIP, remaining: result.remaining, maxRequests: limiter.maxRequests, path });
      }
    } catch (error) {
      logger.error('Rate limit middleware error', { error: error.message });
    }
  };
}

// Export for testing
export { RateLimiter, RateLimitLevels };
