import { describe, it, expect, beforeEach, vi } from "vitest";
import { GenerateFromJDService } from "./generate_from_jd_service.js";
import { ResumeRepository } from "../../domain/resume/resume_repository.js";
import { TemplateRepository } from "../../domain/template/template_repository.js";
import { D1ResumeRepository } from "../../adapters/repositories/resume/d1_resume_repository.js";
import { Factory } from "../../factory.js";

// Mock the AI adapter to avoid real API calls
const mockAiAdapter = {
  generateJSON: vi.fn(),
};

describe("GenerateFromJDService Integration Tests", () => {
  let service;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    const templateRepo = new TemplateRepository();
    service = new GenerateFromJDService(mockAiAdapter, resumeRepo, templateRepo);
    factory = new Factory(db);

    // Reset mock
    vi.clearAllMocks();
  });

  it("should throw error for missing userId", async () => {
    await expect(service.execute({ jobDescription: "test job" })).rejects.toThrow('userId is required');
  });

  it("should throw error for missing jobDescription", async () => {
    await expect(service.execute({ userId: "test-user" })).rejects.toThrow('jobDescription is required');
  });

  it("should throw error for empty jobDescription", async () => {
    await expect(service.execute({ userId: "test-user", jobDescription: "" })).rejects.toThrow('jobDescription must be a non-empty string');
  });

  it("should throw error for invalid template", async () => {
    // Temporarily mock the template repository method
    const originalGetSections = service.templateRepository.getSections;
    service.templateRepository.getSections = vi.fn().mockRejectedValue(new Error('Template not found'));

    await expect(service.execute({
      userId: "test-user",
      jobDescription: "test job",
      templateId: "nonexistent"
    })).rejects.toThrow('Invalid template: nonexistent');

    // Restore original method
    service.templateRepository.getSections = originalGetSections;
  });

  it("should generate and save a resume from job description", async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-789',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed'
    });

    // Mock AI response
    const mockAiResponse = {
      sections: [
        {
          type: 'personal_info',
          title: 'Personal Information',
          content: {
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'https://linkedin.com/in/johndoe',
            website: 'https://johndoe.dev'
          }
        },
        {
          type: 'summary',
          title: 'Professional Summary',
          content: 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies.'
        },
        {
          type: 'experience',
          title: 'Work Experience',
          content: [
            {
              company: 'Tech Corp',
              position: 'Senior Software Engineer',
              location: 'San Francisco, CA',
              startDate: '01/2020',
              endDate: 'Present',
              achievements: [
                'Led development of microservices architecture serving 1M+ users',
                'Improved application performance by 40% through optimization',
                'Mentored junior developers and established coding standards'
              ]
            }
          ]
        },
        {
          type: 'education',
          title: 'Education',
          content: [
            {
              institution: 'University of California',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              location: 'Berkeley, CA',
              graduationDate: '05/2019',
              gpa: '3.8/4.0'
            }
          ]
        },
        {
          type: 'skills',
          title: 'Skills',
          content: {
            technical: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
            soft: ['Leadership', 'Communication', 'Problem Solving'],
            tools: ['Docker', 'Kubernetes', 'Git', 'Jenkins']
          }
        }
      ]
    };

    mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

    // Execute service
    const command = {
      userId: 'user-789',
      jobDescription: 'Senior Software Engineer position requiring 5+ years experience with React, Node.js, AWS, and microservices architecture.'
    };

    const result = await service.execute(command);

    // Verify AI adapter was called
    expect(mockAiAdapter.generateJSON).toHaveBeenCalledTimes(1);

    // Verify resume was created and saved
    expect(result).toBeDefined();
    expect(result.userId).toBe('user-789');
    expect(result.title).toBe('AI Generated Resume');
    
    // Verify sections contains flat Builder format
    expect(typeof result.sections).toBe('object');
    expect(result.sections).toHaveProperty('firstName');
    expect(result.sections).toHaveProperty('lastName');
    expect(result.sections).toHaveProperty('email');
    expect(result.sections).toHaveProperty('summary');
    expect(Array.isArray(result.sections.experience)).toBe(true);
    expect(Array.isArray(result.sections.education)).toBe(true);
    expect(Array.isArray(result.sections.skills)).toBe(true);
    expect(result.sections).toHaveProperty('layout');
    expect(result.sections).toHaveProperty('style');
    expect(result.sections).toHaveProperty('visibleSections');
    expect(result.templateId).toBe('professional');

    // Verify resume exists in database
    const savedResume = await db.prepare('SELECT * FROM resumes WHERE id = ?').bind(result.id).first();
    expect(savedResume).toBeDefined();
    expect(savedResume.user_id).toBe('user-789');
    expect(savedResume.title).toBe('AI Generated Resume');
    
    // Verify content is stored as flat Builder format
    const savedContent = JSON.parse(savedResume.content);
    expect(typeof savedContent).toBe('object');
    expect(savedContent).toHaveProperty('firstName');
    expect(savedContent).toHaveProperty('email');
    expect(savedContent).toHaveProperty('summary');
    expect(Array.isArray(savedContent.experience)).toBe(true);
    expect(savedContent).toHaveProperty('layout');
    expect(savedContent).toHaveProperty('style');
  });

  it("should generate and save a resume with specified template", async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-template',
      email: 'template@example.com',
      name: 'Template User',
      passwordHash: 'hashed'
    });

    // Mock AI response
    const mockAiResponse = {
      sections: [
        {
          type: 'personal_info',
          title: 'Personal Information',
          content: {
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '(555) 987-6543',
            location: 'New York, NY',
            linkedin: 'https://linkedin.com/in/janesmith',
            website: 'https://janesmith.dev'
          }
        },
        {
          type: 'summary',
          title: 'Professional Summary',
          content: 'Creative designer with 4+ years of experience in UX/UI design and branding.'
        },
        {
          type: 'experience',
          title: 'Work Experience',
          content: [
            {
              company: 'Design Studio',
              position: 'Senior UX Designer',
              location: 'New York, NY',
              startDate: '03/2021',
              endDate: 'Present',
              achievements: [
                'Led design for mobile app with 100K+ downloads',
                'Created design system used across 5 products',
                'Collaborated with engineering teams for seamless implementation'
              ]
            }
          ]
        },
        {
          type: 'education',
          title: 'Education',
          content: [
            {
              institution: 'Pratt Institute',
              degree: 'Bachelor of Fine Arts',
              field: 'Graphic Design',
              location: 'Brooklyn, NY',
              graduationDate: '05/2020',
              gpa: '3.7/4.0'
            }
          ]
        },
        {
          type: 'skills',
          title: 'Skills',
          content: {
            technical: ['Figma', 'Sketch', 'Adobe Creative Suite', 'InVision'],
            soft: ['Creativity', 'Communication', 'Attention to Detail'],
            tools: ['Miro', 'Notion', 'Slack', 'Trello']
          }
        }
      ]
    };

    mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

    // Execute service with specific template
    const command = {
      userId: 'user-template',
      jobDescription: 'UX Designer position requiring experience with Figma, user research, and design systems.',
      templateId: 'creative'
    };

    const result = await service.execute(command);

    // Verify AI adapter was called
    expect(mockAiAdapter.generateJSON).toHaveBeenCalledTimes(1);

    // Verify resume was created and saved with specified template
    expect(result).toBeDefined();
    expect(result.userId).toBe('user-template');
    expect(result.title).toBe('AI Generated Resume');
    expect(result.templateId).toBe('creative');
    
    // Verify sections contains flat Builder format
    expect(typeof result.sections).toBe('object');
    expect(result.sections).toHaveProperty('firstName');
    expect(result.sections).toHaveProperty('email');
    expect(result.sections).toHaveProperty('summary');
    expect(Array.isArray(result.sections.experience)).toBe(true);
    expect(result.sections).toHaveProperty('layout');
    expect(result.sections).toHaveProperty('style');
    expect(result.sections).toHaveProperty('visibleSections');

    // Verify resume exists in database with correct template
    const savedResume = await db.prepare('SELECT * FROM resumes WHERE id = ?').bind(result.id).first();
    expect(savedResume).toBeDefined();
    expect(savedResume.user_id).toBe('user-template');
    expect(savedResume.title).toBe('AI Generated Resume');
    expect(savedResume.template_id).toBe('creative');
    
    // Verify content is stored as flat Builder format
    const savedContent = JSON.parse(savedResume.content);
    expect(typeof savedContent).toBe('object');
    expect(savedContent).toHaveProperty('firstName');
    expect(savedContent).toHaveProperty('email');
    expect(savedContent).toHaveProperty('summary');
    expect(Array.isArray(savedContent.experience)).toBe(true);
  });

  it("should handle AI service errors gracefully", async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-999',
      email: 'error@example.com',
      name: 'Error User',
      passwordHash: 'hashed'
    });

    // Mock AI service error
    mockAiAdapter.generateJSON.mockRejectedValue(new Error('AI service temporarily unavailable'));

    const command = {
      userId: 'user-999',
      jobDescription: 'Test job description'
    };

    await expect(service.execute(command)).rejects.toThrow('AI service temporarily unavailable');

    // Verify no resume was created
    const resumes = await db.prepare('SELECT COUNT(*) as count FROM resumes WHERE user_id = ?').bind('user-999').first();
    expect(resumes.count).toBe(0);
  });

  it("should validate AI response structure", async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-888',
      email: 'validate@example.com',
      name: 'Validate User',
      passwordHash: 'hashed'
    });

    // Mock invalid AI response
    mockAiAdapter.generateJSON.mockResolvedValue({
      sections: [
        { type: 'personal_info', content: {} }
        // Missing required sections
      ]
    });

    const command = {
      userId: 'user-888',
      jobDescription: 'Test job description'
    };

    await expect(service.execute(command)).rejects.toThrow('AI response missing required section: summary');

    // Verify no resume was created
    const resumes = await db.prepare('SELECT COUNT(*) as count FROM resumes WHERE user_id = ?').bind('user-888').first();
    expect(resumes.count).toBe(0);
  });

  it("should generate unique resume IDs", async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-777',
      email: 'unique@example.com',
      name: 'Unique User',
      passwordHash: 'hashed'
    });

    // Mock AI response
    const mockAiResponse = {
      sections: [
        { type: 'personal_info', title: 'Personal Information', content: { name: 'Test' } },
        { type: 'summary', title: 'Professional Summary', content: 'Test summary' },
        { type: 'experience', title: 'Work Experience', content: [] },
        { type: 'education', title: 'Education', content: [] },
        { type: 'skills', title: 'Skills', content: { technical: [], soft: [], tools: [] } }
      ]
    };

    mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

    const command = {
      userId: 'user-777',
      jobDescription: 'Test job description'
    };

    // Generate two resumes
    const resume1 = await service.execute(command);
    const resume2 = await service.execute(command);

    // Verify IDs are different
    expect(resume1.id).not.toBe(resume2.id);

    // Verify both exist in database
    const count = await db.prepare('SELECT COUNT(*) as count FROM resumes WHERE user_id = ?').bind('user-777').first();
    expect(count.count).toBe(2);
  });
});