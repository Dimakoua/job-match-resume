import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JobSearchListController } from './job_search_list_controller.js';
import { Factory } from '../../../factory.js';
import { CreateJobSearchListService } from '../../../application/job_search_list/create_job_search_list_service.js';
import { ListJobSearchListsService } from '../../../application/job_search_list/list_job_search_lists_service.js';
import { UpdateJobSearchListService } from '../../../application/job_search_list/update_job_search_list_service.js';
import { DeleteJobSearchListService } from '../../../application/job_search_list/delete_job_search_list_service.js';
import { D1JobSearchListRepository } from '../../../adapters/repositories/job_search_list/d1_job_search_list_repository.js';
import { D1JobApplicationRepository } from '../../../adapters/repositories/job_application/d1_job_application_repository.js';
import jwt from '@tsndr/cloudflare-worker-jwt';

describe('JobSearchListController Integration Tests', () => {
  let controller;
  let factory;
  let db;

  beforeEach(() => {
    db = global.DB;
    if (!db) {
      controller = null;
      factory = null;
      return;
    }

    const jobSearchListRepository = new D1JobSearchListRepository(db);
    const jobApplicationRepository = new D1JobApplicationRepository(db);

    const createJobSearchListService = new CreateJobSearchListService(jobSearchListRepository);
    const listJobSearchListsService = new ListJobSearchListsService(jobSearchListRepository, jobApplicationRepository);
    const updateJobSearchListService = new UpdateJobSearchListService(jobSearchListRepository);
    const deleteJobSearchListService = new DeleteJobSearchListService(jobSearchListRepository);

    const deps = {
      createJobSearchListService,
      listJobSearchListsService,
      updateJobSearchListService,
      deleteJobSearchListService,
      jobSearchListRepository,
    };

    controller = new JobSearchListController(deps, 'test_jwt_secret');
    factory = new Factory(db);
  });

  // Helper function to create JWT token
  const createToken = async (userId) => {
    return await jwt.sign(
      {
        userId,
        email: 'test@example.com',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      'test_jwt_secret'
    );
  };

  // Helper function to create mock request
  const createMockRequest = (method = 'GET', body = null, headers = {}) => {
    const request = {
      method,
      headers: {
        get: (header) => headers[header.toLowerCase()] || null,
      },
      json: vi.fn().mockResolvedValue(body),
      url: 'http://localhost/api/job-search-lists',
    };
    return request;
  };

  describe('createJobSearchList', () => {
    it('should create a job search list and return 201 on success', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const requestBody = {
        name: 'Software Engineer Positions',
        description: 'Tech jobs in SF',
      };

      const request = createMockRequest('POST', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.list).toMatchObject({
        name: 'Software Engineer Positions',
        description: 'Tech jobs in SF',
      });
      expect(result.data.list.id).toBeDefined();
      expect(result.data.list.createdAt).toBeDefined();
      expect(result.data.list.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid input - empty name', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const requestBody = {
        name: '',
        description: 'Test description',
      };

      const request = createMockRequest('POST', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.details).toBeDefined();
    });

    it('should return 400 for invalid input - name too long', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const requestBody = {
        name: 'a'.repeat(101), // 101 characters, exceeds limit
        description: 'Test description',
      };

      const request = createMockRequest('POST', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid input - description too long', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const requestBody = {
        name: 'Valid Name',
        description: 'a'.repeat(501), // 501 characters, exceeds limit
      };

      const request = createMockRequest('POST', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for missing authentication', async () => {
      const requestBody = {
        name: 'Test List',
        description: 'Test description',
      };

      const request = createMockRequest('POST', requestBody);

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('Unauthorized');
    });

    it('should return 401 for invalid token', async () => {
      const requestBody = {
        name: 'Test List',
        description: 'Test description',
      };

      const request = createMockRequest('POST', requestBody, {
        authorization: 'Bearer invalid_token',
      });

      const response = await controller.createJobSearchList(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('Unauthorized');
    });
  });

  describe('listJobSearchLists', () => {
    it('should return user\'s job search lists', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      // Create some job search lists for the user
      await factory.insert('job_search_list', { userId, name: 'List 1', description: 'Description 1' });
      await factory.insert('job_search_list', { userId, name: 'List 2', description: 'Description 2' });

      // Create a list for another user (should not be returned)
      const otherUser = await factory.insert('user');
      await factory.insert('job_search_list', { userId: otherUser.id, name: 'Other List' });

      const request = createMockRequest('GET', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.listJobSearchLists(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.lists).toHaveLength(2);
      expect(result.data.lists[0].name).toBe('List 1');
      expect(result.data.lists[1].name).toBe('List 2');
    });

    it('should return empty array when user has no lists', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const request = createMockRequest('GET', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.listJobSearchLists(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.lists).toEqual([]);
    });

    it('should return 401 for missing authentication', async () => {
      const request = createMockRequest('GET');

      const response = await controller.listJobSearchLists(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('Unauthorized');
    });
  });

  describe('getJobSearchList', () => {
    it('should return a specific job search list for the owner', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'My List',
        description: 'My description'
      });

      const request = createMockRequest('GET', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.getJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.list.id).toBe(list.id);
      expect(result.data.list.name).toBe('My List');
      expect(result.data.list.description).toBe('My description');
    });

    it('should return 404 for non-existent list', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const request = createMockRequest('GET', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.getJobSearchList(request, {}, {}, 'non-existent-id');
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for accessing another user\'s list', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const otherUser = await factory.insert('user');
      const otherList = await factory.insert('job_search_list', {
        userId: otherUser.id,
        name: 'Other User List'
      });

      const request = createMockRequest('GET', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.getJobSearchList(request, {}, {}, otherList.id);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return 401 for missing authentication', async () => {
      const user = await factory.insert('user');
      const list = await factory.insert('job_search_list', {
        userId: user.id,
        name: 'Test List'
      });

      const request = createMockRequest('GET');

      const response = await controller.getJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('Unauthorized');
    });
  });

  describe('updateJobSearchList', () => {
    it('should update a job search list and return 200 on success', async () => {
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'Original Name',
        description: 'Original description'
      });

      const requestBody = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.list.id).toBe(list.id);
      expect(result.data.list.name).toBe('Updated Name');
      expect(result.data.list.description).toBe('Updated description');
      expect(result.data.list.updatedAt).toBeDefined();
    });

    it('should allow partial updates - only name', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'Original Name',
        description: 'Original description'
      });

      const requestBody = {
        name: 'Only Name Updated',
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.list.name).toBe('Only Name Updated');
      expect(result.data.list.description).toBe('Original description'); // Should remain unchanged
    });

    it('should allow setting description to null', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'Test List',
        description: 'Has description'
      });

      const requestBody = {
        description: null,
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.list.description).toBeNull();
    });

    it('should return 400 for invalid input - empty name', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'Original Name'
      });

      const requestBody = {
        name: '',
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent list', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const requestBody = {
        name: 'Updated Name',
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, 'non-existent-id');
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for updating another user\'s list', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const otherUser = await factory.insert('user');
      const otherList = await factory.insert('job_search_list', {
        userId: otherUser.id,
        name: 'Other User List'
      });

      const requestBody = {
        name: 'Trying to update',
      };

      const request = createMockRequest('PUT', requestBody, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.updateJobSearchList(request, {}, {}, otherList.id);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    });
  });

  describe('deleteJobSearchList', () => {
    it('should delete a job search list and return 200 on success', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const list = await factory.insert('job_search_list', {
        userId,
        name: 'List to Delete',
        description: 'Will be deleted'
      });

      const request = createMockRequest('DELETE', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.deleteJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Job search list deleted successfully');
    });

    it('should return 404 for non-existent list', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const request = createMockRequest('DELETE', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.deleteJobSearchList(request, {}, {}, 'non-existent-id');
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for deleting another user\'s list', async () => {

      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const otherUser = await factory.insert('user');
      const otherList = await factory.insert('job_search_list', {
        userId: otherUser.id,
        name: 'Other User List'
      });

      const request = createMockRequest('DELETE', null, {
        authorization: `Bearer ${token}`,
      });

      const response = await controller.deleteJobSearchList(request, {}, {}, otherList.id);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return 401 for missing authentication', async () => {

      const user = await factory.insert('user');
      const list = await factory.insert('job_search_list', {
        userId: user.id,
        name: 'Test List'
      });

      const request = createMockRequest('DELETE');

      const response = await controller.deleteJobSearchList(request, {}, {}, list.id);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('Unauthorized');
    });
  });
});