import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';
import { AtsScoringError } from '../../../application/calculate_ats_score/ats_scoring_error.js';

const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  templateId: z.string().optional(),
  sections: z.any().optional(), // Flexible for JSON content
});

const generateFromJDSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required'),
  userData: z.string().min(1, 'User data is required'),
  templateId: z.string().optional(),
  generationSettings: z.object({
    tone: z.enum(['professional', 'formal', 'creative', 'concise']).optional(),
    targetAtsScore: z.number().min(0).max(100).optional(),
  }).optional(),
});

const improveTextSchema = z.object({
  text: z.string().min(1, 'Text is required').max(10000, 'Text must be less than 10,000 characters'),
});

const calculateAtsScoreSchema = z.object({
  resumeText: z.string().min(1, 'Resume text is required').max(50000, 'Resume text must be less than 50,000 characters'),
  jobDescription: z.string().min(1, 'Job description is required').max(50000, 'Job description must be less than 50,000 characters'),
});

const updateResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  templateId: z.string().nullable().optional(),
  sections: z.any().optional(),
});

export class ResumeController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createResumeService = deps.createResumeService;
    this.listResumesService = deps.listResumesService;
    this.getResumeService = deps.getResumeService;
    this.deleteResumeService = deps.deleteResumeService;
    this.updateResumeService = deps.updateResumeService;
    this.listTemplatesService = deps.listTemplatesService;
    this.generateFromJDService = deps.generateFromJDService;
    this.improveTextService = deps.improveTextService;
    this.exportResumeService = deps.exportResumeService;
    this.calculateAtsScoreService = deps.calculateAtsScoreService;
  }

  async createResume(request) {
    try {
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
      console.error('Create resume error:', error);

      if (error.message && error.message.includes('templateId')) {
        return this.errorResponse('INVALID_TEMPLATE', 'Invalid template ID', 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async listResumes(request) {
    try {
      const userId = await this.authenticate(request);

      // Execute list resumes
      const resumes = await this.listResumesService.execute({ userId });

      return this.successResponse({
        success: true,
        data: { resumes },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async getResume(request, resumeId) {
    try {
      const userId = await this.authenticate(request);

      // Execute get resume
      const resume = await this.getResumeService.execute(resumeId, userId);

      return this.successResponse({
        success: true,
        data: { resume },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }
      if (error.message === 'Resume not found') {
        return this.errorResponse('NOT_FOUND', 'Resume not found', 404);
      }
      if (error.message.includes('Unauthorized')) {
        return this.errorResponse('FORBIDDEN', error.message, 403);
      }
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async generateFromJD(request) {
    try {
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
      // If authenticate threw a Response, return it
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
      // If authenticate threw a Response, return it
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

  async calculateAtsScore(request) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = calculateAtsScoreSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
      };

      // Execute ATS score calculation
      const result = await this.calculateAtsScoreService.execute(command);

      return this.successResponse({
        success: true,
        data: result,
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      // Handle ATS scoring specific errors
      if (error instanceof AtsScoringError) {
        console.error('ATS scoring error:', error.message, error.details);
        return this.errorResponse(
          error.code,
          error.message,
          error.code === 'INVALID_INPUT' || error.code === 'TEXT_TOO_LONG' ? 400 : 500
        );
      }

      console.error('Calculate ATS score error:', error);
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async exportResume(request) {
    try {
      const userId = await this.authenticate(request);

      // Extract resume ID from URL params
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const resumeId = pathParts[pathParts.length - 2]; // Extract :id from /api/resumes/:id/export

      // Extract format from query params
      const format = url.searchParams.get('format');
      if (!format || !['pdf', 'docx'].includes(format)) {
        return this.errorResponse('INVALID_FORMAT', 'Format must be either "pdf" or "docx"', 400);
      }

      const command = {
        resumeId,
        userId,
        format,
      };

      // Execute export
      const result = await this.exportResumeService.execute(command);

      // Return binary response with appropriate headers
      const contentType = format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      return new Response(result.buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${result.filename}"`,
        },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }
      console.error('Export resume error:', error);

      if (error.message && error.message.includes('not found')) {
        return this.errorResponse('RESUME_NOT_FOUND', 'Resume not found', 404);
      }

      if (error.message && error.message.includes('Access denied')) {
        return this.errorResponse('ACCESS_DENIED', 'Access denied', 403);
      }

      if (error.message && error.message.includes('format')) {
        return this.errorResponse('INVALID_FORMAT', 'Invalid format specified', 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async listTemplates(request) {
    try {
      // Execute list templates
      const templates = await this.listTemplatesService.execute();

      return this.successResponse({
        success: true,
        data: { templates },
      });
    } catch (error) {
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async updateResume(request, resumeId) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = updateResumeSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        resumeId,
        userId,
        ...validationResult.data,
      };

      // Execute update resume
      const resume = await this.updateResumeService.execute(command);

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
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      // Handle specific business errors
      if (error.message === 'Resume not found') {
        return this.errorResponse('RESUME_NOT_FOUND', 'Resume not found', 404);
      }
      if (error.message === 'Access denied') {
        return this.errorResponse('ACCESS_DENIED', 'Access denied', 403);
      }
      if (error.message === 'Invalid template ID') {
        return this.errorResponse('INVALID_TEMPLATE', 'Invalid template ID', 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async deleteResume(request, resumeId) {
    try {
      const userId = await this.authenticate(request);

      const command = {
        resumeId,
        userId,
      };

      // Execute delete
      await this.deleteResumeService.execute(command);

      return this.successResponse({
        success: true,
        data: {
          message: 'Resume deleted successfully',
          id: resumeId,
        },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      // Handle specific business errors
      if (error.message === 'Resume not found') {
        return this.errorResponse('RESUME_NOT_FOUND', 'Resume not found', 404);
      }
      if (error.message === 'Access denied') {
        return this.errorResponse('ACCESS_DENIED', 'Access denied', 403);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}