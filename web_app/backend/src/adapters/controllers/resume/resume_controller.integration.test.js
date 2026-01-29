import { describe, it, expect, beforeEach } from 'vitest';
import { ResumeController } from './resume_controller.js';
import { Factory } from '../../../factory.js';
import { CreateResumeService } from '../../../application/resume/create_resume_service.js';
import { ListResumesService } from '../../../application/resume/list_resumes_service.js';
import { D1ResumeRepository } from '../../../adapters/repositories/resume/d1_resume_repository.js';

describe('ResumeController Integration Tests', () => {
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
    const resumeRepository = new D1ResumeRepository(db);
    const templateRepository = new (class {
      async getSections(templateId) {
        // Mock template sections for testing
        return [
          { id: 'personal', name: 'Personal Information', required: true },
          { id: 'experience', name: 'Work Experience', required: true }
        ];
      }
    })();
    const createResumeService = new CreateResumeService(resumeRepository, templateRepository);
    const listResumesService = new ListResumesService(resumeRepository);
    const deps = {
      createResumeService,
      listResumesService,
    };
    controller = new ResumeController(deps, 'test_jwt_secret');
    factory = new Factory(db);
  });

  it('should create a resume and return 201 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    // Create JWT token for the user
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwt.sign({ userId }, 'test_jwt_secret');

    const title = 'My Integration Resume';

    const request = {
      json: async () => ({
        title,
      }),
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.resume.title).toBe(title);
    expect(result.data.resume.id).toBeDefined();
    expect(result.data.resume.sections).toEqual([]);
    expect(result.data.resume.templateId).toBeNull();
  });

  it('should create a resume with template and return 201 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    // Create JWT token for the user
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwt.sign({ userId }, 'test_jwt_secret');

    const title = 'My Template Resume';
    const templateId = 'basic';

    const request = {
      json: async () => ({
        title,
        templateId,
      }),
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.resume.title).toBe(title);
    expect(result.data.resume.templateId).toBe(templateId);
    expect(result.data.resume.sections).toBeDefined();
    expect(Array.isArray(result.data.resume.sections)).toBe(true);
  });

  it('should return 400 for invalid request data', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    // Create JWT token for the user
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwt.sign({ userId }, 'test_jwt_secret');

    const request = {
      json: async () => ({
        title: '', // Invalid: empty title
      }),
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 401 for missing auth token on create', async () => {
    if (!controller) return;

    const request = {
      json: async () => ({
        title: 'Test Resume',
      }),
      headers: new Map(),
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error.code).toBe('Unauthorized');
  });

  it('should list resumes and return 200 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    // Create a resume for the user
    await factory.insert('resume', { userId, title: 'Test Resume' });

    // Create JWT token for the user
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwt.sign({ userId }, 'test_jwt_secret');

    const request = {
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const response = await controller.listResumes(request);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data.resumes)).toBe(true);
    expect(result.data.resumes.length).toBeGreaterThan(0);
    expect(result.data.resumes[0]).toHaveProperty('id');
    expect(result.data.resumes[0]).toHaveProperty('title');
    expect(result.data.resumes[0]).toHaveProperty('updatedAt');
  });

  it('should return 401 for missing auth token on list', async () => {
    const request = {
      headers: new Map(),
    };

    const response = await controller.listResumes(request);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error.code).toBe('Unauthorized');
  });

  it('should not list resumes from other users', async () => {
    if (!controller || !factory) return;

    // Create two users
    const userA = await factory.insert('user');
    const userB = await factory.insert('user');

    // Create a resume for user A
    await factory.insert('resume', { userId: userA.id, title: 'User A Resume' });

    // Create JWT token for user B
    const jwt = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwt.sign({ userId: userB.id }, 'test_jwt_secret');

    const request = {
      headers: new Map([['Authorization', `Bearer ${token}`]]),
    };

    const response = await controller.listResumes(request);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.resumes.length).toBe(0); // User B should see no resumes
  });
});