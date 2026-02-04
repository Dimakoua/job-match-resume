// routes/job_application_routes.js
import { JobApplicationController } from '../adapters/controllers/job_application/job_application_controller.js';
import { createController } from '../utils/route_helpers.js';

export function setupJobApplicationRoutes(router) {
  // Create job application
  // Usage: POST /api/job-applications
  // Headers: Authorization: Bearer <jwt>
  // Body: { "jobSearchListId": "...", "company": "...", "position": "...", "jobDescription": "...", "status": "saved", "resumeId": "..." (optional), "appliedDate": "..." (optional), "notes": "..." (optional) }
  // Returns: { "success": true, "data": { "jobApplication": { "id": "...", "company": "...", "position": "...", "jobDescription": "...", "status": "saved", ... } } }
  router.post('/api/job-applications', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.create(request);
  });

  // Create job application from Chrome extension
  // Usage: POST /api/job-applications/from-extension
  // Headers: Authorization: Bearer <jwt>
  // Body: { "jobDescription": "Software Engineer position...", "company": "Tech Corp", "position": "Senior Developer", "url": "https://example.com/job/123" }
  // Returns: { "success": true, "data": { "jobApplication": { "id": "...", "company": "...", "position": "...", "jobDescription": "...", "status": "saved", ... } } }
  router.post('/api/job-applications/from-extension', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.createFromExtension(request);
  });

  // List job applications
  // Usage: GET /api/job-applications?jobSearchListId=<uuid>
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "data": { "applications": [...] } }
  router.get('/api/job-applications', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.list(request);
  });

  // Update job application
  // Usage: PUT /api/job-applications/<id>
  // Headers: Authorization: Bearer <jwt>
  // Body: { "status": "applied", "notes": "Updated notes" }
  // Returns: { "success": true, "data": { "jobApplication": {...} } }
  router.put('/api/job-applications/:id', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.update(request);
  });

  // Delete job application
  // Usage: DELETE /api/job-applications/<id>
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "message": "Job application deleted successfully" }
  router.delete('/api/job-applications/:id', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.delete(request);
  });
}