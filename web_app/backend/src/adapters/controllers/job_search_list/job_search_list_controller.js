import { z } from 'zod';
import { BaseController } from '../base/base_controller.js';

const createJobSearchListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

const updateJobSearchListSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').nullable().optional(),
});

export class JobSearchListController extends BaseController {
  constructor(deps, jwtSecret) {
    super(jwtSecret);
    this.createJobSearchListService = deps.createJobSearchListService;
    this.listJobSearchListsService = deps.listJobSearchListsService;
    this.updateJobSearchListService = deps.updateJobSearchListService;
    this.deleteJobSearchListService = deps.deleteJobSearchListService;
    this.jobSearchListRepository = deps.jobSearchListRepository;
  }

  async createJobSearchList(request) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = createJobSearchListSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        ...validationResult.data,
        userId,
      };

      // Execute create job search list
      const list = await this.createJobSearchListService.execute(command);

      return this.successResponse({
        success: true,
        data: {
          list: {
            id: list.id,
            name: list.name,
            description: list.description,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
          },
        },
      }, 201);
    } catch (error) {
      console.error('Create job search list error:', error);
      if (error instanceof Response) {
        return error;
      }
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async listJobSearchLists(request) {
    try {
      const userId = await this.authenticate(request);

      // Execute list job search lists
      const lists = await this.listJobSearchListsService.execute({ userId });

      return this.successResponse({
        success: true,
        data: { lists },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async getJobSearchList(request, env, ctx, id) {
    try {
      const userId = await this.authenticate(request);

      // Find the list
      const list = await this.jobSearchListRepository.findById(id);
      
      if (!list) {
        return this.errorResponse('NOT_FOUND', 'Job search list not found', 404);
      }

      // Check ownership
      if (list.userId !== userId) {
        return this.errorResponse('FORBIDDEN', 'Access denied', 403);
      }

      return this.successResponse({
        success: true,
        data: { list },
      });
    } catch (error) {
      // If authenticate threw a Response, return it
      if (error instanceof Response) {
        return error;
      }
      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async updateJobSearchList(request, env, ctx, id) {
    try {
      const userId = await this.authenticate(request);

      const body = await request.json();

      // Validate input
      const validationResult = updateJobSearchListSchema.safeParse(body);
      if (!validationResult.success) {
        return this.validationErrorResponse(validationResult.error.issues);
      }

      const command = {
        id,
        ...validationResult.data,
        userId,
      };

      // Execute update job search list
      const list = await this.updateJobSearchListService.execute(command);

      return this.successResponse({
        success: true,
        data: {
          list: {
            id: list.id,
            name: list.name,
            description: list.description,
            updatedAt: list.updatedAt,
          },
        },
      });
    } catch (error) {
      console.error('Update job search list error:', error);

      if (error instanceof Response) {
        return error;
      }
      if (error.message === 'Job search list not found') {
        return this.errorResponse('NOT_FOUND', 'Job search list not found', 404);
      }
      if (error.message === 'Access denied') {
        return this.errorResponse('FORBIDDEN', 'Access denied', 403);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }

  async deleteJobSearchList(request, env, ctx, id) {
    try {
      const userId = await this.authenticate(request);

      const command = {
        id,
        userId,
      };

      // Execute delete job search list
      await this.deleteJobSearchListService.execute(command);

      return this.successResponse({
        success: true,
        message: 'Job search list deleted successfully',
      });
    } catch (error) {
      console.error('Delete job search list error:', error);

      if (error instanceof Response) {
        return error;
      }
      if (error.message === 'Job search list not found') {
        return this.errorResponse('NOT_FOUND', 'Job search list not found', 404);
      }
      if (error.message === 'Access denied') {
        return this.errorResponse('FORBIDDEN', 'Access denied', 403);
      }

      return this.errorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
    }
  }
}