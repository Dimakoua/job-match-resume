import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeController } from './resume_controller.js';
import { Factory } from '../../../factory.js';
import { CreateResumeService } from '../../../application/resume/create_resume_service.js';
import { ListResumesService } from '../../../application/resume/list_resumes_service.js';
import { DeleteResumeService } from '../../../application/resume/delete_resume_service.js';
import { UpdateResumeService } from '../../../application/update_resume/update_resume_service.js';
import { ListTemplatesService } from '../../../application/list_templates/list_templates_service.js';
import { GenerateFromJDService } from '../../../application/generate_from_jd/generate_from_jd_service.js';
import { ImproveTextService } from '../../../application/improve_text/improve_text_service.js';
import { ExportResumeService } from '../../../application/export_resume/export_resume_service.js';
import { D1ResumeRepository } from '../../../adapters/repositories/resume/d1_resume_repository.js';
import jwt from '@tsndr/cloudflare-worker-jwt';

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
      async getAllTemplates() {
        return [
          { id: 'basic', name: 'Basic' },
          { id: 'modern', name: 'Modern' },
          { id: 'professional', name: 'Professional' }
        ];
      }
    })();

    // Mock AI adapter
    const mockAIAdapter = {
      generateJSON: vi.fn(),
    };

    const createResumeService = new CreateResumeService(resumeRepository, templateRepository);
    const listResumesService = new ListResumesService(resumeRepository);
    const deleteResumeService = new DeleteResumeService(resumeRepository);
    const updateResumeService = new UpdateResumeService(resumeRepository, templateRepository);
    const listTemplatesService = new ListTemplatesService(templateRepository);
    const generateFromJDService = new GenerateFromJDService(mockAIAdapter, resumeRepository, templateRepository);
    const improveTextService = new ImproveTextService(mockAIAdapter);

    // Mock adapters for export
    const mockPdfAdapter = {
      generateBuffer: vi.fn(),
    };
    const mockDocxAdapter = {
      generateBuffer: vi.fn(),
    };

    const exportResumeService = new ExportResumeService(resumeRepository, mockPdfAdapter, mockDocxAdapter);

    const deps = {
      createResumeService,
      listResumesService,
      deleteResumeService,
      updateResumeService,
      listTemplatesService,
      generateFromJDService,
      improveTextService,
      exportResumeService,
    };
    controller = new ResumeController(deps, 'test_jwt_secret');
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

  it('should create a resume and return 201 on success', async () => {
    // Create a test user
    const user = await factory.insert('user');
    const userId = user.id;
    const token = await createToken(userId);

    const title = 'My Integration Resume';

    const request = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
      },
      json: async () => ({
        title,
      }),
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
    const token = await createToken(userId);

    const title = 'My Template Resume';
    const templateId = 'basic';

    const request = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
      },
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
    const token = await createToken(userId);

    const request = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
      },
      json: async () => ({
        title: '', // Invalid: empty title
      }),
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
    const token = await createToken(userId);

    // Create a resume for the user
    await factory.insert('resume', { userId, title: 'Test Resume' });

    const request = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
      },
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
    const tokenB = await createToken(userB.id);

    // Create a resume for user A
    await factory.insert('resume', { userId: userA.id, title: 'User A Resume' });

    const request = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${tokenB}` : null,
      },
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
      const token = await createToken(userId);

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
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          jobDescription,
        }),
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
      const token = await createToken(userId);

      const request = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          jobDescription: '', // Invalid: empty string
        }),
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
      const token = await createToken(userId);

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
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          text: originalText,
        }),
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
      const token = await createToken(userId);

      const longText = 'a'.repeat(10001); // Too long

      const request = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          text: longText,
        }),
      };

      const response = await controller.improveText(request);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should export resume as PDF and return 200 with correct headers', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      // Create a resume using the controller
      const createRequest = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          title: 'Test Resume',
        }),
      };
      const createResponse = await controller.createResume(createRequest);
      expect(createResponse.status).toBe(201);
      const createResult = await createResponse.json();
      const resumeId = createResult.data.resume.id;

      const mockBuffer = new Uint8Array([37, 80, 68, 70]); // Mock PDF header

      // Mock the PDF adapter
      controller.exportResumeService.pdfAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const request = {
        url: `http://localhost/api/resumes/${resumeId}/export?format=pdf`,
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.exportResume(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toBe(`attachment; filename="Test_Resume.pdf"`);

      const buffer = await response.arrayBuffer();
      expect(new Uint8Array(buffer)).toEqual(mockBuffer);
    });

    it('should export resume as DOCX and return 200 with correct headers', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      // Create a resume using the controller
      const createRequest = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
        json: async () => ({
          title: 'Test Resume',
        }),
      };
      const createResponse = await controller.createResume(createRequest);
      expect(createResponse.status).toBe(201);
      const createResult = await createResponse.json();
      const resumeId = createResult.data.resume.id;

      const mockBuffer = new Uint8Array([80, 75, 3, 4]); // Mock DOCX header

      // Mock the DOCX adapter
      controller.exportResumeService.docxAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const request = {
        url: `http://localhost/api/resumes/${resumeId}/export?format=docx`,
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.exportResume(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(response.headers.get('Content-Disposition')).toBe(`attachment; filename="Test_Resume.docx"`);

      const buffer = await response.arrayBuffer();
      expect(new Uint8Array(buffer)).toEqual(mockBuffer);
    });

    it('should return 400 for invalid format', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const request = {
        url: `http://localhost/api/resumes/resume-123/export?format=txt`,
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.exportResume(request);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.error.code).toBe('INVALID_FORMAT');
    });

    it('should return 404 for non-existent resume', async () => {
      // Create a test user
      const user = await factory.insert('user');
      const userId = user.id;
      const token = await createToken(userId);

      const request = {
        url: `http://localhost/api/resumes/non-existent/export?format=pdf`,
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.exportResume(request);
      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.error.code).toBe('RESUME_NOT_FOUND');
    });

    it('should return 403 for resume belonging to another user', async () => {
      // Create two users
      const user1 = await factory.insert('user');
      const user2 = await factory.insert('user');
      const token2 = await createToken(user2.id);

      // Create resume for user1
      const resume = await factory.insert('resume', { userId: user1.id });

      const request = {
        url: `http://localhost/api/resumes/${resume.id}/export?format=pdf`,
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token2}` : null,
        },
      };

      const response = await controller.exportResume(request);
      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.error.code).toBe('ACCESS_DENIED');
    });

  });

  describe('deleteResume', () => {
    it('should delete a resume successfully', async () => {
      const user = await factory.insert('user');
      const token = await createToken(user.id);
      const resume = await factory.insert('resume', { userId: user.id });

      const request = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.deleteResume(request, resume.id);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(resume.id);
    });

    it('should return 401 when not authenticated', async () => {
      const request = {
        headers: {
          get: () => null,
        },
      };

      const response = await controller.deleteResume(request, 'some-id');
      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent resume', async () => {
      const user = await factory.insert('user');
      const token = await createToken(user.id);

      const request = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
        },
      };

      const response = await controller.deleteResume(request, 'non-existent-id');
      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.error.code).toBe('RESUME_NOT_FOUND');
    });

    it('should return 403 for resume belonging to another user', async () => {
      const user1 = await factory.insert('user');
      const user2 = await factory.insert('user');
      const token2 = await createToken(user2.id);
      const resume = await factory.insert('resume', { userId: user1.id });

      const request = {
        headers: {
          get: (header) => header === 'Authorization' ? `Bearer ${token2}` : null,
        },
      };

      const response = await controller.deleteResume(request, resume.id);
      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.error.code).toBe('ACCESS_DENIED');
    });

  });
});