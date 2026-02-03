import { JobSearchListController } from '../adapters/controllers/job_search_list/job_search_list_controller.js';
import { createController } from '../utils/route_helpers.js';

export function setupJobSearchListRoutes(router) {
  // Create a new job search list
  // Usage: POST /api/lists
  // Headers: Authorization: Bearer <jwt>
  // Body: { "name": "My Job List", "description": "Optional description" }
  // Returns: { "success": true, "data": { "list": { "id": "...", "name": "...", "description": "...", "createdAt": "...", "updatedAt": "..." } } }
  router.post('/api/lists', async (request, env, ctx) => {
    const { controller } = createController(env, JobSearchListController, [env.JWT_SECRET]);
    return controller.createJobSearchList(request);
  });

  // List user's job search lists
  // Usage: GET /api/lists
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "data": { "lists": [{ "id": "...", "name": "...", "description": "...", "createdAt": "...", "updatedAt": "..." }, ...] } }
  router.get('/api/lists', async (request, env, ctx) => {
    const { controller } = createController(env, JobSearchListController, [env.JWT_SECRET]);
    return controller.listJobSearchLists(request);
  });

  // Update a job search list
  // Usage: PUT /api/lists/:id
  // Headers: Authorization: Bearer <jwt>
  // Body: { "name": "Updated Name", "description": "Updated description" } (all fields optional)
  // Returns: { "success": true, "data": { "list": { "id": "...", "name": "...", "description": "...", "updatedAt": "..." } } }
  router.put('/api/lists/:id', async (request, env, ctx) => {
    const { controller } = createController(env, JobSearchListController, [env.JWT_SECRET]);
    return controller.updateJobSearchList(request, env, ctx, request.params.id);
  });

  // Delete a job search list
  // Usage: DELETE /api/lists/:id
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "message": "Job search list deleted successfully" }
  router.delete('/api/lists/:id', async (request, env, ctx) => {
    const { controller } = createController(env, JobSearchListController, [env.JWT_SECRET]);
    return controller.deleteJobSearchList(request, env, ctx, request.params.id);
  });
}