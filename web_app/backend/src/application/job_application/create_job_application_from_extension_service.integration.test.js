// application/job_application/create_job_application_from_extension_service.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from '../../factory.js';
import { CreateJobApplicationFromExtensionService } from './create_job_application_from_extension_service.js';

describe('CreateJobApplicationFromExtensionService Integration Tests', () => {
  let factory;
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    service = new CreateJobApplicationFromExtensionService(
      factory.jobApplicationRepo,
      factory.userRepo,
      factory.jobSearchListRepo,
      factory.createJobSearchListService
    );

    // Clean the test database
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM Users').run();
  });

  it('should create a job application from extension data', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hash'
    });

    const jobData = {
      jobDescription: 'We are looking for a Senior Software Engineer with React experience...',
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      url: 'https://example.com/job/123'
    };

    const result = await service.execute(user.id, jobData);

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.userId).toBe(user.id);
    expect(result.jobSearchListId).toBeDefined(); // Should be set to current year list
    expect(result.resumeId).toBeNull();
    expect(result.company).toBe('Tech Corp');
    expect(result.position).toBe('Senior Software Engineer');
    expect(result.jobDescription).toBe(jobData.jobDescription);
    expect(result.status).toBe('saved');
    expect(result.appliedDate).toBeNull();
    expect(result.notes).toBe('https://example.com/job/123');

    // Verify it was saved
    const saved = await factory.jobApplicationRepo.findById(result.id);
    expect(saved).toBeDefined();
    expect(saved.company).toBe('Tech Corp');
  });

  it('should create job application with minimal data', async () => {
    const user = await factory.insert('user', {
      id: 'user-456',
      email: 'minimal@example.com',
      name: 'Minimal User',
      passwordHash: 'hash'
    });

    const jobData = {
      jobDescription: 'Looking for a developer...'
    };

    const result = await service.execute(user.id, jobData);

    expect(result.company).toBe('Unknown Company');
    expect(result.position).toBe('Unknown Position');
    expect(result.notes).toBeNull();
    expect(result.status).toBe('saved');
  });

  it('should trim whitespace from string fields', async () => {
    const user = await factory.insert('user', {
      id: 'user-789',
      email: 'trim@example.com',
      name: 'Trim User',
      passwordHash: 'hash'
    });

    const jobData = {
      jobDescription: '  Job description with spaces  ',
      company: '  Company Name  ',
      position: '  Position Title  ',
      url: '  https://example.com  '
    };

    const result = await service.execute(user.id, jobData);

    expect(result.jobDescription).toBe('Job description with spaces');
    expect(result.company).toBe('Company Name');
    expect(result.position).toBe('Position Title');
    expect(result.notes).toBe('https://example.com');
  });

  it('should throw error for invalid job description', async () => {
    const user = await factory.insert('user', {
      id: 'user-invalid',
      email: 'invalid@example.com',
      name: 'Invalid User',
      passwordHash: 'hash'
    });

    // Test empty job description
    await expect(service.execute(user.id, { jobDescription: '' }))
      .rejects.toThrow('Job description cannot be empty');

    // Test missing job description
    await expect(service.execute(user.id, {}))
      .rejects.toThrow('Job description is required');

    // Test non-string job description
    await expect(service.execute(user.id, { jobDescription: 123 }))
      .rejects.toThrow('Job description must be a string');

    // Test too long job description
    const longDescription = 'a'.repeat(10001);
    await expect(service.execute(user.id, { jobDescription: longDescription }))
      .rejects.toThrow('Job description is too long (maximum 10000 characters)');
  });

  it('should throw error for invalid optional fields', async () => {
    const user = await factory.insert('user', {
      id: 'user-fields',
      email: 'fields@example.com',
      name: 'Fields User',
      passwordHash: 'hash'
    });

    const validJobData = {
      jobDescription: 'Valid job description'
    };

    // Test invalid company
    await expect(service.execute(user.id, { ...validJobData, company: 123 }))
      .rejects.toThrow('Company must be a string with maximum 200 characters');

    await expect(service.execute(user.id, { ...validJobData, company: 'a'.repeat(201) }))
      .rejects.toThrow('Company must be a string with maximum 200 characters');

    // Test invalid position
    await expect(service.execute(user.id, { ...validJobData, position: 123 }))
      .rejects.toThrow('Position must be a string with maximum 200 characters');

    await expect(service.execute(user.id, { ...validJobData, position: 'a'.repeat(201) }))
      .rejects.toThrow('Position must be a string with maximum 200 characters');

    // Test invalid URL
    await expect(service.execute(user.id, { ...validJobData, url: 123 }))
      .rejects.toThrow('URL must be a string with maximum 1000 characters');

    await expect(service.execute(user.id, { ...validJobData, url: 'a'.repeat(1001) }))
      .rejects.toThrow('URL must be a string with maximum 1000 characters');
  });

  it('should throw error for non-existent user', async () => {
    const jobData = {
      jobDescription: 'Valid job description'
    };

    await expect(service.execute('non-existent-user', jobData))
      .rejects.toThrow('User not found');
  });
});