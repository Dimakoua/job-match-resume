import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeController } from './resume_controller.js';
import { Factory } from '../../../factory.js';
import { CreateResumeService } from '../../../application/resume/create_resume_service.js';
import { ListResumesService } from '../../../application/resume/list_resumes_service.js';
import { GenerateFromJDService } from '../../../application/generate_from_jd/generate_from_jd_service.js';
import { ImproveTextService } from '../../../application/improve_text/improve_text_service.js';
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

    // Mock AI adapter
    const mockAIAdapter = {
      generateJSON: vi.fn(),
    };

    const createResumeService = new CreateResumeService(resumeRepository, templateRepository);
    const listResumesService = new ListResumesService(resumeRepository);
    const generateFromJDService = new GenerateFromJDService(mockAIAdapter, resumeRepository, templateRepository);
    const improveTextService = new ImproveTextService(mockAIAdapter);

    const deps = {
      createResumeService,
      listResumesService,
      generateFromJDService,
      improveTextService,
    };
    controller = new ResumeController(deps, 'test_jwt_secret');
    factory = new Factory(db);
  });

  it('should create a resume and return 201 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    const title = 'My Integration Resume';

    const request = {
      json: async () => ({
        title,
      }),
      userId, // Set by auth middleware
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

    const title = 'My Template Resume';
    const templateId = 'basic';

    const request = {
      json: async () => ({
        title,
        templateId,
      }),
      userId, // Set by auth middleware
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

    const request = {
      json: async () => ({
        title: '', // Invalid: empty title
      }),
      userId, // Set by auth middleware
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 for missing userId', async () => {
    if (!controller) return;

    const request = {
      json: async () => ({
        title: 'Test Resume',
      }),
      // No userId set
    };

    const response = await controller.createResume(request);
    expect(response.status).toBe(500);

    const result = await response.json();
    expect(result.error.code).toBe('INTERNAL_ERROR');
  });

  it('should list resumes and return 200 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;

    // Create a resume for the user
    await factory.insert('resume', { userId, title: 'Test Resume' });

    const request = {
      userId, // Set by auth middleware
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

  it('should not list resumes from other users', async () => {
    if (!controller || !factory) return;

    // Create two users
    const userA = await factory.insert('user');
    const userB = await factory.insert('user');

    // Create a resume for user A
    await factory.insert('resume', { userId: userA.id, title: 'User A Resume' });

    const request = {
      userId: userB.id, // Set by auth middleware
    };

    const response = await controller.listResumes(request);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.resumes.length).toBe(0); // User B should see no resumes
  });

  describe('generateFromJD endpoint', () => {
    it('should generate resume from job description and return 201 on success', async () => {
      if (!controller || !factory) return;

      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;

      const jobDescription = 'We are looking for a Software Engineer with 3+ years experience in JavaScript and Node.js.';

      // Mock AI response
      const mockAIResponse = {
        sections: [
          {
            type: 'personal_info',
            title: 'Personal Information',
            content: {
              name: 'John Doe',
              email: 'john@example.com',
              phone: '(555) 123-4567',
              location: 'San Francisco, CA'
            }
          },
          {
            type: 'summary',
            title: 'Professional Summary',
            content: 'Experienced software engineer with expertise in JavaScript and Node.js.'
          },
          {
            type: 'experience',
            title: 'Work Experience',
            content: [
              {
                company: 'Tech Corp',
                position: 'Software Engineer',
                duration: '01/2020 - Present',
                description: 'Developed web applications using JavaScript and Node.js.'
              }
            ]
          },
          {
            type: 'education',
            title: 'Education',
            content: [
              {
                degree: 'Bachelor of Science in Computer Science',
                school: 'University of California',
                year: '2019'
              }
            ]
          },
          {
            type: 'skills',
            title: 'Skills',
            content: ['JavaScript', 'Node.js', 'React', 'Python']
          }
        ]
      };

      // Mock the AI adapter
      controller.generateFromJDService.aiAdapter.generateJSON.mockResolvedValue(mockAIResponse);

      const request = {
        json: async () => ({
          jobDescription,
        }),
        userId, // Set by auth middleware
      };

      const response = await controller.generateFromJD(request);
      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.resume.title).toBe('AI Generated Resume');
      expect(result.data.resume.templateId).toBe('professional');
      expect(result.data.resume.sections).toEqual(mockAIResponse.sections);
      expect(result.data.resume.id).toBeDefined();
    });

    it('should return 400 for invalid job description', async () => {
      if (!controller || !factory) return;

      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;

      const request = {
        json: async () => ({
          jobDescription: '', // Invalid: empty string
        }),
        userId, // Set by auth middleware
      };

      const response = await controller.generateFromJD(request);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

  });

  describe('improveText endpoint', () => {
    it('should improve text and return variations on success', async () => {
      if (!controller || !factory) return;

      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;

      const originalText = 'I am a software engineer with experience in javascript.';

      // Mock AI response
      const mockAIResponse = {
        variations: [
          'Experienced software engineer proficient in JavaScript development.',
          'Skilled software engineer with comprehensive JavaScript expertise.',
          'Professional software engineer specializing in JavaScript technologies.'
        ]
      };

      // Mock the AI adapter
      controller.improveTextService.aiAdapter.generateJSON.mockResolvedValue(mockAIResponse);

      const request = {
        json: async () => ({
          text: originalText,
        }),
        userId, // Set by auth middleware
      };

      const response = await controller.improveText(request);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.originalText).toBe(originalText);
      expect(result.data.variations).toEqual(mockAIResponse.variations);
      expect(result.data.variations).toHaveLength(3);
    });

    it('should return 400 for text too long', async () => {
      if (!controller || !factory) return;

      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;

      const longText = 'a'.repeat(10001); // Too long

      const request = {
        json: async () => ({
          text: longText,
        }),
        userId, // Set by auth middleware
      };

      const response = await controller.improveText(request);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

  });
});