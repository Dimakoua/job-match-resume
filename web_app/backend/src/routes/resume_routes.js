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

  // Generate resume from job description
  // Usage: POST /api/resumes/generate-from-jd
  // Headers: Authorization: Bearer <jwt>
  // Body: { "jobDescription": "Software Engineer position...", "templateId": "professional" } (templateId is optional)
  // Returns: { "success": true, "data": { "resume": { "id": "...", "title": "...", "templateId": "...", "sections": [...], "createdAt": "...", "updatedAt": "..." } } }
  router.post('/api/resumes/generate-from-jd', async (request, env, ctx) => {
    const { controller } = createController(env, ResumeController, [env.JWT_SECRET]);
    return controller.generateFromJD(request);
  });

  // Improve resume text
  // Usage: POST /api/resumes/improve-text
  // Headers: Authorization: Bearer <jwt>
  // Body: { "text": "Original resume text to improve..." }
  // Returns: { "success": true, "data": { "originalText": "...", "variations": ["Improved text 1", "Improved text 2", "Improved text 3"] } }
  router.post('/api/resumes/improve-text', async (request, env, ctx) => {
    const { controller } = createController(env, ResumeController, [env.JWT_SECRET]);
    return controller.improveText(request);
  });
}