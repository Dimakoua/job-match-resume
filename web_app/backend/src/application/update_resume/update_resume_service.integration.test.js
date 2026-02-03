import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateResumeService } from './update_resume_service.js';
import { ResumeRepository } from '../../domain/resume/resume_repository.js';
import { TemplateRepository } from '../../domain/template/template_repository.js';
import { D1ResumeRepository } from '../../adapters/repositories/resume/d1_resume_repository.js';
import { Factory } from '../../factory.js';
import { cleanTestDatabase } from '../../test_helpers.js';

describe('UpdateResumeService Integration Tests', () => {
  let service;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    const templateRepo = new TemplateRepository();
    service = new UpdateResumeService(resumeRepo, templateRepo);
    factory = new Factory(db);

    // Clean the test database
    await cleanTestDatabase(db);
  });

  it('should update resume template successfully', async () => {
    // Arrange
    await factory.insert('user', { id: 'user-123', email: 'test@example.com' });
    await factory.insert('resume', { 
      id: 'resume-123', 
      userId: 'user-123', 
      title: 'Original Title',
      templateId: null,
      sections: []
    });

    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: 'professional'
    };

    // Act
    const result = await service.execute(command);

    // Assert
    expect(result.templateId).toBe('professional');
    
    // Verify in DB
    const updated = await db.prepare('SELECT * FROM Resumes WHERE id = ?').bind('resume-123').first();
    expect(updated.template_id).toBe('professional');
  });

  it('should update resume title and sections successfully', async () => {
    // Arrange
    await factory.insert('user', { id: 'user-123', email: 'test-update@example.com' });
    await factory.insert('resume', { 
      id: 'resume-456', 
      userId: 'user-123', 
      title: 'Old Title',
      sections: []
    });

    const command = {
      resumeId: 'resume-456',
      userId: 'user-123',
      title: 'New Title',
      sections: { firstName: 'Updated' }
    };

    // Act
    const result = await service.execute(command);

    // Assert
    expect(result.title).toBe('New Title');
    expect(result.sections).toEqual({ firstName: 'Updated' });
    
    // Verify in DB
    const updated = await db.prepare('SELECT * FROM Resumes WHERE id = ?').bind('resume-456').first();
    expect(updated.title).toBe('New Title');
    expect(JSON.parse(updated.content)).toEqual({ firstName: 'Updated' });
  });

  it('should allow setting templateId to null', async () => {
    // Arrange
    await factory.insert('user', { id: 'user-123', email: 'test-null@example.com' });
    await factory.insert('resume', { 
      id: 'resume-789', 
      userId: 'user-123', 
      title: 'My Resume',
      templateId: 'basic',
      sections: []
    });

    const command = {
      resumeId: 'resume-789',
      userId: 'user-123',
      templateId: null
    };

    // Act
    const result = await service.execute(command);

    // Assert
    expect(result.templateId).toBe(null);
    
    // Verify in DB
    const updated = await db.prepare('SELECT * FROM Resumes WHERE id = ?').bind('resume-789').first();
    expect(updated.template_id).toBe(null);
  });

  it('should throw error if resumeId is missing', async () => {
    const command = {
      userId: 'user-123',
      templateId: 'professional'
    };
    await expect(service.execute(command)).rejects.toThrow('resumeId is required');
  });

  it('should throw error if userId is missing', async () => {
    const command = {
      resumeId: 'resume-123',
      templateId: 'professional'
    };
    await expect(service.execute(command)).rejects.toThrow('userId is required');
  });

  it('should throw error if resume not found', async () => {
    const command = {
      resumeId: 'nonexistent',
      userId: 'user-123',
      templateId: 'professional'
    };
    await expect(service.execute(command)).rejects.toThrow('Resume not found');
  });

  it('should throw error if user does not own resume', async () => {
    // Arrange
    await factory.insert('user', { id: 'user-1', email: 'user1@example.com' });
    await factory.insert('user', { id: 'user-2', email: 'user2@example.com' });
    await factory.insert('resume', { 
      id: 'resume-own', 
      userId: 'user-1', 
      title: 'User 1 Resume',
      sections: []
    });

    const command = {
      resumeId: 'resume-own',
      userId: 'user-2',
      templateId: 'professional'
    };

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Access denied');
  });

  it('should throw error if template does not exist', async () => {
    // Arrange
    await factory.insert('user', { id: 'user-123', email: 'test-template@example.com' });
    await factory.insert('resume', { 
      id: 'resume-template', 
      userId: 'user-123', 
      sections: []
    });

    const command = {
      resumeId: 'resume-template',
      userId: 'user-123',
      templateId: 'nonexistent'
    };

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Invalid template ID');
  });
});
