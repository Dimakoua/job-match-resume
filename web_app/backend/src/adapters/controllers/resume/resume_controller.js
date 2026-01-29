import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';

const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  templateId: z.string().optional(),
});

const generateFromJDSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required'),
  templateId: z.string().optional(),
});

const improveTextSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text must be less than 10,000 characters'),
});

export class ResumeController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createResumeService = deps.createResumeService;
    this.listResumesService = deps.listResumesService;
    this.generateFromJDService = deps.generateFromJDService;
    this.improveTextService = deps.improveTextService;
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

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async generateFromJD(request) {
    try {
      // Authenticate user
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = generateFromJDSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
      };

      // Execute generate from JD
      const resume = await this.generateFromJDService.execute(command);

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

      console.error('Generate from JD error:', error);

      if (error.message && error.message.includes('templateId')) {
        return this.errorResponse('INVALID_TEMPLATE', 'Invalid template ID', 400);
      }

      if (error.message && error.message.includes('AI')) {
        return this.errorResponse('AI_ERROR', 'Failed to generate resume from job description', 500);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async improveText(request) {
    try {
      // Authenticate user
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = improveTextSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
      };

      // Execute improve text
      const result = await this.improveTextService.execute(command);

      return this.successResponse({
        success: true,
        data: result,
      });
    } catch (error) {
      // If error is a Response (from authenticate), return it directly
      if (error instanceof Response) {
        return error;
      }

      console.error('Improve text error:', error);

      if (error.message && error.message.includes('AI')) {
        return this.errorResponse('AI_ERROR', 'Failed to improve text', 500);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}