// routes/job_application_routes.js
import { JobApplicationController } from '../adapters/controllers/job_application/job_application_controller.js';
import { createController } from '../utils/route_helpers.js';

export function setupJobApplicationRoutes(router) {
  // Create job application from Chrome extension
  // Usage: POST /api/job-applications/from-extension
  // Headers: Authorization: Bearer <jwt>
  // Body: { "jobDescription": "Software Engineer position...", "company": "Tech Corp", "position": "Senior Developer", "url": "https://example.com/job/123" }
  // Returns: { "success": true, "data": { "jobApplication": { "id": "...", "company": "...", "position": "...", "jobDescription": "...", "status": "saved", ... } } }
  router.post('/api/job-applications/from-extension', async (request, env, ctx) => {
    const { controller } = createController(env, JobApplicationController, [env.JWT_SECRET]);
    return controller.createFromExtension(request);
  });
}