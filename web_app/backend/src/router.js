/**
 * Cloudflare Worker Backend
 */

import { AutoRouter } from 'itty-router';
import { HealthController } from './adapters/controllers/health/health_controller.js';
import { setupAuthRoutes } from './routes/authRoutes.js';

// ==================== CORS HEADERS ====================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ==================== ROUTER ====================

const router = AutoRouter({
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

// Setup feature routes
// setupAuthRoutes(router);

// Export the router, scheduled handler, and queue handlers
export default router;
