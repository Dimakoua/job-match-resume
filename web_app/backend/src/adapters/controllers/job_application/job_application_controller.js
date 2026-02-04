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
    this.listJobApplicationsService = deps.listJobApplicationsService;
    this.updateJobApplicationService = deps.updateJobApplicationService;
    this.deleteJobApplicationService = deps.deleteJobApplicationService;
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

  async list(request) {
    try {
      const userId = await this.authenticate(request);

      // Get query params
      const url = new URL(request.url);
      const jobSearchListId = url.searchParams.get('jobSearchListId');

      if (!jobSearchListId) {
        return this.errorResponse('MISSING_JOB_SEARCH_LIST_ID', 'jobSearchListId query parameter is required', 400);
      }

      // Execute service
      const result = await this.listJobApplicationsService.execute(jobSearchListId, userId);

      return this.successResponse({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('List job applications error:', error);

      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      if (error.message && error.message.includes('Invalid')) {
        return this.errorResponse('INVALID_INPUT', error.message, 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async update(request) {
    try {
      const userId = await this.authenticate(request);

      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return this.errorResponse('MISSING_ID', 'Job application ID is required', 400);
      }

      const body = await request.json();

      // Execute service
      const result = await this.updateJobApplicationService.execute(id, userId, body);

      return this.successResponse({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Update job application error:', error);

      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      if (error.message && error.message.includes('not found')) {
        return this.errorResponse('NOT_FOUND', error.message, 404);
      }

      if (error.message && error.message.includes('Access denied')) {
        return this.errorResponse('ACCESS_DENIED', error.message, 403);
      }

      if (error.message && error.message.includes('Validation failed')) {
        return this.errorResponse('INVALID_INPUT', error.message, 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async delete(request) {
    try {
      const userId = await this.authenticate(request);

      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return this.errorResponse('MISSING_ID', 'Job application ID is required', 400);
      }

      // Execute service
      await this.deleteJobApplicationService.execute(id, userId);

      return this.successResponse({
        success: true,
        message: 'Job application deleted successfully'
      });
    } catch (error) {
      console.error('Delete job application error:', error);

      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      if (error.message && error.message.includes('not found')) {
        return this.errorResponse('NOT_FOUND', error.message, 404);
      }

      if (error.message && error.message.includes('Access denied')) {
        return this.errorResponse('ACCESS_DENIED', error.message, 403);
      }

      if (error.message && error.message.includes('Validation failed')) {
        return this.errorResponse('INVALID_INPUT', error.message, 400);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}