// adapters/controllers/job_application/job_application_controller.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { JobApplicationController } from './job_application_controller.js';
import { Factory } from '../../../factory.js';
import jwt from '@tsndr/cloudflare-worker-jwt';

describe('JobApplicationController Integration Tests', () => {
  let factory;
  let controller;
  let db;
  let mockJwtSecret = 'test-secret';

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    await factory.db.exec('DELETE FROM JobApplications');
    await factory.db.exec('DELETE FROM Users');
    await factory.db.exec('DELETE FROM JobSearchLists');

    const deps = {
      createJobApplicationFromExtensionService: factory.createJobApplicationFromExtensionService
    };

    controller = new JobApplicationController(deps, mockJwtSecret);
  });

  it('should create job application from extension with valid data', async () => {
    // Create a user and get JWT token
    const user = await factory.insert('user', {
      id: 'user-test',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hash'
    });

    const token = await jwt.sign({ userId: user.id }, mockJwtSecret);

    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobDescription: 'We are looking for a Senior Software Engineer...',
        company: 'Tech Corp',
        position: 'Senior Software Engineer',
        url: 'https://example.com/job/123'
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.jobApplication).toBeDefined();
    expect(result.data.jobApplication.company).toBe('Tech Corp');
    expect(result.data.jobApplication.position).toBe('Senior Software Engineer');
    expect(result.data.jobApplication.jobDescription).toBe('We are looking for a Senior Software Engineer...');
    expect(result.data.jobApplication.status).toBe('saved');
    expect(result.data.jobApplication.notes).toBe('https://example.com/job/123');
    
    // Verify that a year-based job search list was created and assigned
    expect(result.data.jobApplication.jobSearchListId).toBeDefined();
    expect(result.data.jobApplication.jobSearchListId).not.toBeNull();
    
    // Verify the year list exists in the database
    const yearList = await db.prepare('SELECT * FROM JobSearchLists WHERE id = ?').bind(result.data.jobApplication.jobSearchListId).first();
    expect(yearList).toBeDefined();
    expect(yearList.name).toBe('2026');
    expect(yearList.user_id).toBe(user.id);
  });

  it('should create job application with minimal data', async () => {
    const user = await factory.insert('user', {
      id: 'user-minimal',
      email: 'minimal@example.com',
      name: 'Minimal User',
      passwordHash: 'hash'
    });

    const token = await jwt.sign({ userId: user.id }, mockJwtSecret);

    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobDescription: 'Looking for a developer...'
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.jobApplication.company).toBe('Unknown Company');
    expect(result.data.jobApplication.position).toBe('Unknown Position');
    expect(result.data.jobApplication.notes).toBeNull();
    
    // Verify that a year-based job search list was created and assigned
    expect(result.data.jobApplication.jobSearchListId).toBeDefined();
    expect(result.data.jobApplication.jobSearchListId).not.toBeNull();
  });

  it('should return 401 for missing authentication', async () => {
    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobDescription: 'Test job...'
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error.code).toBe('Unauthorized');
  });

  it('should return 401 for invalid JWT token', async () => {
    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        jobDescription: 'Test job...'
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error.code).toBe('Unauthorized');
  });

  it('should return 400 for missing job description', async () => {
    const user = await factory.insert('user', {
      id: 'user-validation',
      email: 'validation@example.com',
      name: 'Validation User',
      passwordHash: 'hash'
    });

    const token = await jwt.sign({ userId: user.id }, mockJwtSecret);

    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        company: 'Test Company'
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid field lengths', async () => {
    const user = await factory.insert('user', {
      id: 'user-length',
      email: 'length@example.com',
      name: 'Length User',
      passwordHash: 'hash'
    });

    const token = await jwt.sign({ userId: user.id }, mockJwtSecret);

    const request = new Request('http://localhost/api/job-applications/from-extension', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobDescription: 'Valid description',
        company: 'a'.repeat(201), // Too long
        position: 'a'.repeat(201), // Too long
        url: 'a'.repeat(1001) // Too long
      })
    });

    const response = await controller.createFromExtension(request);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });
});