import jwt from '@tsndr/cloudflare-worker-jwt';

export class BaseController {
  constructor(jwtSecret = null) {
    this.jwtSecret = jwtSecret;
  }

  /**
   * Verifies JWT token and returns payload
   * @param {string} token - JWT token
   * @param {string} secret - JWT secret
   * @returns {Promise<object|null>} Decoded payload or null if invalid
   */
  async verifyToken(token, secret) {
    try {
      const isValid = await jwt.verify(token, secret);
      if (!isValid) return null;
      const decoded = jwt.decode(token);
      return decoded.payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Authenticates request and returns user ID from JWT
   * @param {Request} request - The HTTP request
   * @returns {Promise<string>} User ID from JWT
   * @throws {Response} 401 error response if authentication fails
   */
  async authenticate(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw this.errorResponse('Unauthorized', 'Authentication required', 401);
    }

    const token = authHeader.slice(7); // Remove 'Bearer '
    const payload = await this.verifyToken(token, this.jwtSecret);
    if (!payload) {
      throw this.errorResponse('Unauthorized', 'Invalid token', 401);
    }
    return payload.userId;
  }
  /**
   * Creates a JSON response with proper headers
   * @param {any} data - The data to serialize as JSON
   * @param {number} status - HTTP status code (default: 200)
   * @returns {Response}
   */
  jsonResponse(data, status = 200) {
    return new Response(
      JSON.stringify(data),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Creates a success response
   * @param {any} data - The success data
   * @param {number} status - HTTP status code (default: 200)
   * @returns {Response}
   */
  successResponse(data, status = 200) {
    return this.jsonResponse(data, status);
  }

  /**
   * Creates an error response
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {number} status - HTTP status code (default: 500)
   * @param {any} details - Optional error details
   * @returns {Response}
   */
  errorResponse(code, message, status = 500, details = null) {
    const error = { code, message };
    if (details) {
      error.details = details;
    }
    return this.jsonResponse({ error }, status);
  }

  /**
   * Creates a validation error response
   * @param {Array} issues - Zod validation issues
   * @returns {Response}
   */
  validationErrorResponse(issues) {
    return this.errorResponse('VALIDATION_ERROR', 'Invalid request data', 400, issues);
  }
}