import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';

const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  templateId: z.string().optional(),
});

export class ResumeController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createResumeService = deps.createResumeService;
    this.listResumesService = deps.listResumesService;
  }

  async createResume(request) {
    try {
      // Authenticate user
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = createResumeSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
      };

      // Execute create resume
      const resume = await this.createResumeService.execute(command);

      return this.successResponse({
        success: true,
        data: {
          resume: {
            id: resume.id,
            title: resume.title,
            templateId: resume.templateId,
            sections: resume.sections,
            createdAt: resume.createdAt,
            updatedAt: resume.updatedAt,
          },
        },
      }, 201);
    } catch (error) {
      // If error is a Response (from authenticate), return it directly
      if (error instanceof Response) {
        return error;
      }

      console.error('Create resume error:', error);

      if (error.message && error.message.includes('templateId')) {
        return this.errorResponse('INVALID_TEMPLATE', 'Invalid template ID', 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async listResumes(request) {
    try {
      // Authenticate user
      const userId = await this.authenticate(request);

      // Execute list resumes
      const resumes = await this.listResumesService.execute({ userId });

      return this.successResponse({
        success: true,
        data: { resumes },
      });
    } catch (error) {
      // If error is a Response (from authenticate), return it directly
      if (error instanceof Response) {
        return error;
      }

      console.error('List resumes error:', error);
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}