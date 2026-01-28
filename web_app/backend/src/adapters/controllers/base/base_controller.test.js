import { describe, it, expect } from 'vitest';
import { BaseController } from './base_controller.js';

describe('BaseController', () => {
  let controller;

  beforeEach(() => {
    controller = new BaseController();
  });

  describe('jsonResponse', () => {
    it('should create a JSON response with default status 200', async () => {
      const data = { message: 'test' };
      const response = controller.jsonResponse(data);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      const body = await response.json();
      expect(body).toEqual(data);
    });

    it('should create a JSON response with custom status', async () => {
      const data = { error: 'not found' };
      const response = controller.jsonResponse(data, 404);

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual(data);
    });
  });

  describe('successResponse', () => {
    it('should create a success response', async () => {
      const data = { success: true };
      const response = controller.successResponse(data, 201);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(data);
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with details', async () => {
      const response = controller.errorResponse('TEST_ERROR', 'Test message', 400, { field: 'required' });

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
          details: { field: 'required' },
        },
      });
    });

    it('should create an error response without details', async () => {
      const response = controller.errorResponse('INTERNAL_ERROR', 'Something went wrong');

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
        },
      });
    });
  });

  describe('validationErrorResponse', () => {
    it('should create a validation error response', async () => {
      const issues = [{ message: 'Required', path: ['email'] }];
      const response = controller.validationErrorResponse(issues);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toEqual({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: issues,
        },
      });
    });
  });
});