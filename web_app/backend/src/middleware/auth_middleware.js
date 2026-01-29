/**
 * Authentication middleware for protected routes
 */

/**
 * Middleware to authenticate requests and inject userId into request context
 * @param {string} jwtSecret - JWT secret for token verification
 * @returns {Function} Middleware function
 */
export function authMiddleware(jwtSecret) {
  return async (request, env, ctx) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          error: { code: 'Unauthorized', message: 'Authentication required' }
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const token = authHeader.slice(7); // Remove 'Bearer '
      if (!token.trim()) {
        return new Response(JSON.stringify({
          error: { code: 'Unauthorized', message: 'Authentication required' }
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify token
      const isValid = await import('@tsndr/cloudflare-worker-jwt');
      const verified = await isValid.verify(token, jwtSecret);
      if (!verified) {
        return new Response(JSON.stringify({
          error: { code: 'Unauthorized', message: 'Invalid token' }
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Decode token to get payload
      const decoded = isValid.decode(token);
      const userId = decoded.payload.userId;

      // Inject userId into request for use in controllers
      request.userId = userId;

      // Continue to next handler
      return;
    } catch (error) {
      console.error('Auth middleware error:', error);
      return new Response(JSON.stringify({
        error: { code: 'INTERNAL_ERROR', message: 'Authentication error' }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}