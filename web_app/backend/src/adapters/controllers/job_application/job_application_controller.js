// adapters/controllers/job_application/job_application_controller.js
import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';

const createFromExtensionSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required').max(10000, 'Job description must be less than 10,000 characters'),
  company: z.string().max(200, 'Company must be less than 200 characters').optional(),
  position: z.string().max(200, 'Position must be less than 200 characters').optional(),
  url: z.string().max(1000, 'URL must be less than 1000 characters').optional(),
});

export class JobApplicationController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createJobApplicationFromExtensionService = deps.createJobApplicationFromExtensionService;
  }

  async createFromExtension(request) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = createFromExtensionSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      // Execute service
      const jobApplication = await this.createJobApplicationFromExtensionService.execute(userId, validationResult.data);

      return this.successResponse({
        success: true,
        data: {
          jobApplication: {
            id: jobApplication.id,
            userId: jobApplication.userId,
            jobSearchListId: jobApplication.jobSearchListId,
            resumeId: jobApplication.resumeId,
            company: jobApplication.company,
            position: jobApplication.position,
            jobDescription: jobApplication.jobDescription,
            status: jobApplication.status,
            appliedDate: jobApplication.appliedDate,
            notes: jobApplication.notes,
            createdAt: jobApplication.createdAt,
            updatedAt: jobApplication.updatedAt,
          },
        },
      }, 201);
    } catch (error) {
      console.error('Create job application from extension error:', error);

      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      if (error.message && error.message.includes('User not found')) {
        return this.errorResponse('USER_NOT_FOUND', 'User not found', 404);
      }

      if (error.message && error.message.includes('Job description')) {
        return this.errorResponse('INVALID_JOB_DESCRIPTION', error.message, 400);
      }

      if (error.message && error.message.includes('Company') ||
          error.message && error.message.includes('Position') ||
          error.message && error.message.includes('URL')) {
        return this.errorResponse('INVALID_INPUT', error.message, 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}