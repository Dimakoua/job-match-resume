/**
 * Cloudflare Worker Backend
 */

import { AutoRouter } from 'itty-router';
import { HealthController } from './adapters/controllers/health/health_controller.js';
import { setupAuthRoutes } from './routes/auth_routes.js';
import { setupResumeRoutes } from './routes/resume_routes.js';
import { setupJobSearchListRoutes } from './routes/job_search_list_routes.js';
import { setupJobApplicationRoutes } from './routes/job_application_routes.js';
import { rateLimitMiddleware } from './middlewares/rate_limit.js';

// ==================== MIDDLEWARE ====================

const apiRateLimit = rateLimitMiddleware({
  level: 'STANDARD',
  excludePaths: ['/api/health', '/']
});

// ==================== CORS HEADERS ====================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ==================== ROUTER ====================

const router = AutoRouter({
  before: [apiRateLimit],
  finally: [(response) => {
    // Add CORS headers to all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }],
});

// Handle CORS preflight requests
router.options('*', () => new Response(null, { status: 200, headers: corsHeaders }));

// Health endpoint
// Usage: GET /api/health
// Returns: { "status": "ok", "timestamp": "2026-01-13T...", "version": "1.0.0" }
router.get('/api/health', async () => {
  const healthController = new HealthController();
  return healthController.getHealth();
});

router.get('/', () => new Response('Hello World from Resume Builder Backend!'));

// Debug route - only available in development
// Usage: GET /api/debug/env
// Returns: Environment variables (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/debug/env', async (request, env) => {
    // In Cloudflare Workers, env vars are passed as the second parameter
    
    // Create a safe version of all env vars, masking sensitive ones
    const safeEnv = {};
    for (const [key, value] of Object.entries(env)) {
      if (key.includes('SECRET') || key.includes('KEY') || key.includes('TOKEN') || key.includes('PASSWORD')) {
        // Mask sensitive values (only if they are strings)
        if (typeof value === 'string') {
          safeEnv[key] = value ? `${value.substring(0, 8)}...` : 'not set';
        } else {
          safeEnv[key] = '[object binding]';
        }
      } else {
        // Show non-sensitive values as-is
        safeEnv[key] = value;
      }
    }
    
    safeEnv._debug_info = {
      timestamp: new Date().toISOString(),
      total_vars: Object.keys(env).length,
      masked_vars: Object.keys(safeEnv).filter(key => safeEnv[key] && typeof safeEnv[key] === 'string' && safeEnv[key].includes('...')).length,
      available_bindings: Object.keys(env).filter(key => typeof env[key] === 'object' && env[key] !== null)
    };

    return new Response(JSON.stringify(safeEnv, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

// Setup feature routes
setupAuthRoutes(router);
setupResumeRoutes(router);
setupJobSearchListRoutes(router);
setupJobApplicationRoutes(router);

// Export the router, scheduled handler, and queue handlers
export default router;
