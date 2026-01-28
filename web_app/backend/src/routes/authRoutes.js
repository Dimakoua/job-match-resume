import { AuthController } from '../adapters/controllers/auth/auth_controller.js';
import { createController } from '../utils/routeHelpers.js';

export function setupAuthRoutes(router) {
  // Sign up a new user
  // Usage: POST /api/auth/signup
  // Body: { "email": "user@example.com", "name": "User Name", "password": "password123" }
  // Returns: { "success": true, "data": { "id": "...", "email": "...", "name": "..." } }
  router.post('/api/auth/signup', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.signUp(request);
  });

  // Login a user
  // Usage: POST /api/auth/login
  // Body: { "email": "user@example.com", "password": "password123" }
  // Returns: { "success": true, "data": { "user": { "id": "...", "email": "...", "name": "..." }, "token": "jwt..." } }
  router.post('/api/auth/login', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.login(request);
  });

  // Update user profile
  // Usage: PUT /api/user/profile
  // Headers: Authorization: Bearer <jwt>
  // Body: { "name": "New Name" } or { "password": "newpassword123" } or both
  // Returns: { "success": true, "data": { "user": { "id": "...", "email": "...", "name": "..." } } }
  router.put('/api/user/profile', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.updateUser(request);
  });

  // Get user profile
  // Usage: GET /api/user/profile
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "data": { "profile": { "id": "...", "email": "...", "name": "..." } } }
  router.get('/api/user/profile', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.getUserProfile(request);
  });

  // Google OAuth initiation
  // Usage: GET /api/auth/google
  // Redirects to Google OAuth authorization URL
  router.get('/api/auth/google', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.googleAuth(request, env);
  });

  // Google OAuth callback
  // Usage: GET /api/auth/google/callback?code=...
  // Returns: { "success": true, "data": { "user": { "id": "...", "email": "...", "name": "..." }, "token": "jwt..." } }
  router.get('/api/auth/google/callback', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.googleAuthCallback(request, env);
  });

  // Google login with ID token
  // Usage: POST /api/auth/google/login
  // Body: { "idToken": "google.id.token" }
  // Returns: { "success": true, "data": { "user": { "id": "...", "email": "...", "name": "..." }, "token": "jwt..." } }
  router.post('/api/auth/google/login', async (request, env, ctx) => {
    const { controller } = createController(env, AuthController, [env.JWT_SECRET]);
    return controller.googleLogin(request, env);
  });
}