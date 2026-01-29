import { ResumeController } from '../adapters/controllers/resume/resume_controller.js';
import { createController } from '../utils/route_helpers.js';

export function setupResumeRoutes(router) {
  // Create a new resume
  // Usage: POST /api/resumes
  // Headers: Authorization: Bearer <jwt>
  // Body: { "title": "My Resume", "templateId": "basic" } (templateId is optional)
  // Returns: { "success": true, "data": { "resume": { "id": "...", "title": "...", "templateId": "...", "sections": [...], "createdAt": "...", "updatedAt": "..." } } }
  router.post('/api/resumes', async (request, env, ctx) => {
    const { controller } = createController(env, ResumeController, [env.JWT_SECRET]);
    return controller.createResume(request);
  });

  // List user's resumes
  // Usage: GET /api/resumes
  // Headers: Authorization: Bearer <jwt>
  // Returns: { "success": true, "data": { "resumes": [{ "id": "...", "title": "...", "updatedAt": "..." }, ...] } }
  router.get('/api/resumes', async (request, env, ctx) => {
    const { controller } = createController(env, ResumeController, [env.JWT_SECRET]);
    return controller.listResumes(request);
  });
}