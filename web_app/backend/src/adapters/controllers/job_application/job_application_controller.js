// adapters/controllers/job_application/job_application_controller.js
import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';

const createFromExtensionSchema = z.object({
  jobDescription: z.string().min(1, 'Job description is required').max(10000, 'Job description must be less than 10,000 characters'),
  company: z.string().max(200, 'Company must be less than 200 characters').optional(),
  position: z.string().max(200, 'Position must be less than 200 characters').optional(),
  url: z.string().max(1000, 'URL must be less than 1000 characters').optional(),
});

const createSchema = z.object({
  jobSearchListId: z.string().uuid('Invalid job search list ID'),
  resumeId: z.string().uuid('Invalid resume ID').nullable().optional(),
  company: z.string().min(1, 'Company is required').max(200, 'Company must be less than 200 characters'),
  position: z.string().min(1, 'Position is required').max(200, 'Position must be less than 200 characters'),
  jobDescription: z.string().min(1, 'Job description is required').max(10000, 'Job description must be less than 10,000 characters'),
  status: z.enum(['saved', 'applied', 'interviewing', 'rejected', 'accepted', 'withdrawn']).optional(),
  appliedDate: z.string().datetime().nullable().optional(),
  notes: z.string().max(5000, 'Notes must be less than 5,000 characters').nullable().optional(),
});

export class JobApplicationController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createJobApplicationFromExtensionService = deps.createJobApplicationFromExtensionService;
    this.listJobApplicationsService = deps.listJobApplicationsService;
    this.updateJobApplicationService = deps.updateJobApplicationService;
    this.deleteJobApplicationService = deps.deleteJobApplicationService;
    this.archiveJobApplicationService = deps.archiveJobApplicationService;
    this.unarchiveJobApplicationService = deps.unarchiveJobApplicationService;
    this.jobApplicationRepository = deps.jobApplicationRepository;
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

  async create(request) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = createSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      // Execute service
      const jobApplication = await this.createJobApplicationFromExtensionService.execute(userId, {
        jobDescription: validationResult.data.jobDescription,
        company: validationResult.data.company,
        position: validationResult.data.position,
        jobSearchListId: validationResult.data.jobSearchListId,
        resumeId: validationResult.data.resumeId,
        status: validationResult.data.status,
        appliedDate: validationResult.data.appliedDate,
        notes: validationResult.data.notes,
      });

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
      console.error('Create job application error:', error);

      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }

      if (error.message && error.message.includes('User not found')) {
        return this.errorResponse('USER_NOT_FOUND', 'User not found', 404);
      }

      if (error.message && error.message.includes('required')) {
        return this.errorResponse('VALIDATION_ERROR', error.message, 400);
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
      const includeArchived = url.searchParams.get('includeArchived') === 'true';

      if (!jobSearchListId && !includeArchived) {
        return this.errorResponse('MISSING_JOB_SEARCH_LIST_ID', 'jobSearchListId query parameter is required when not viewing archive', 400);
      }

      // Execute service
      // Pass undefined if jobSearchListId is null (missing) to allow fetching across all lists
      const result = await this.listJobApplicationsService.execute(jobSearchListId || undefined, userId, { includeArchived });

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

  async get(request) {
    try {
      const userId = await this.authenticate(request);

      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return this.errorResponse('MISSING_ID', 'Job application ID is required', 400);
      }

      // Execute service - for now, use repository directly since no use case
      const jobApplication = await this.jobApplicationRepository.findById(id);

      if (!jobApplication || jobApplication.userId !== userId) {
        return this.errorResponse('NOT_FOUND', 'Job application not found', 404);
      }

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
            archived: jobApplication.archived,
            createdAt: jobApplication.createdAt,
            updatedAt: jobApplication.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error('Get job application error:', error);

      if (error instanceof Response) {
        return error;
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

  async archive(request) {
    try {
      const userId = await this.authenticate(request);

      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(p => p !== '');
      let id = parts.pop();
      
      // Handle /api/job-applications/:id/archive
      if (id === 'archive') {
        id = parts.pop();
      }

      if (!id) {
        return this.errorResponse('MISSING_ID', 'Job application ID is required', 400);
      }

      // Execute service
      const result = await this.archiveJobApplicationService.execute(id, userId);

      return this.successResponse(result);
    } catch (error) {
      console.error('Archive job application error:', error);

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

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async unarchive(request) {
    try {
      const userId = await this.authenticate(request);

      const url = new URL(request.url);
      const parts = url.pathname.split('/').filter(p => p !== '');
      let id = parts.pop();
      
      // Handle /api/job-applications/:id/unarchive
      if (id === 'unarchive') {
        id = parts.pop();
      }

      if (!id) {
        return this.errorResponse('MISSING_ID', 'Job application ID is required', 400);
      }

      // Execute service
      const result = await this.unarchiveJobApplicationService.execute(id, userId);

      return this.successResponse(result);
    } catch (error) {
      console.error('Unarchive job application error:', error);

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

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}