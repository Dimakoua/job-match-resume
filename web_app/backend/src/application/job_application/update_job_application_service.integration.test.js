// application/job_application/update_job_application_service.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from '../../factory.js';
import { UpdateJobApplicationService } from './update_job_application_service.js';

describe('UpdateJobApplicationService Integration Tests', () => {
  let factory;
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    service = new UpdateJobApplicationService(factory.jobApplicationRepo);

    // Clean the test database
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM JobSearchLists').run();
    await db.prepare('DELETE FROM Users').run();
  });

  it('should update job application status', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hash'
    });

    // Create a job search list
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-123',
      userId: user.id,
      name: '2026 Job Hunt',
      description: 'My job search for 2026'
    });

    // Create a job application
    const app = await factory.insert('jobApplication', {
      id: 'app-1',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company A',
      position: 'Position A',
      jobDescription: 'Description A',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes A'
    });

    // Update the status
    const result = await service.execute(app.id, user.id, { status: 'applied' });

    expect(result.jobApplication).toMatchObject({
      id: app.id,
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      company: 'Company A',
      position: 'Position A',
      status: 'applied',
      notes: 'Notes A'
    });

    // Verify the update in database
    const updatedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(updatedApp.status).toBe('applied');
  });

  it('should update applied date', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-456',
      email: 'test2@example.com',
      name: 'Test User 2',
      passwordHash: 'hash'
    });

    // Create a job search list
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-456',
      userId: user.id,
      name: '2026 Job Hunt 2',
      description: 'My job search for 2026'
    });

    // Create a job application
    const app = await factory.insert('jobApplication', {
      id: 'app-2',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company B',
      position: 'Position B',
      jobDescription: 'Description B',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes B'
    });

    // Update the applied date
    const appliedDate = '2026-02-03T10:00:00.000Z';
    const result = await service.execute(app.id, user.id, { appliedDate });

    expect(result.jobApplication.appliedDate).toEqual(new Date(appliedDate));

    // Verify the update in database
    const updatedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(updatedApp.appliedDate).toEqual(new Date(appliedDate));
  });

  it('should update notes', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-789',
      email: 'test3@example.com',
      name: 'Test User 3',
      passwordHash: 'hash'
    });

    // Create a job search list
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-789',
      userId: user.id,
      name: '2026 Job Hunt 3',
      description: 'My job search for 2026'
    });

    // Create a job application
    const app = await factory.insert('jobApplication', {
      id: 'app-3',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company C',
      position: 'Position C',
      jobDescription: 'Description C',
      status: 'saved',
      appliedDate: null,
      notes: 'Original notes'
    });

    // Update the notes
    const result = await service.execute(app.id, user.id, { notes: 'Updated notes' });

    expect(result.jobApplication.notes).toBe('Updated notes');

    // Verify the update in database
    const updatedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(updatedApp.notes).toBe('Updated notes');
  });

  it('should update multiple fields at once', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-multi',
      email: 'test-multi@example.com',
      name: 'Test User Multi',
      passwordHash: 'hash'
    });

    // Create a job search list
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-multi',
      userId: user.id,
      name: '2026 Job Hunt Multi',
      description: 'My job search for 2026'
    });

    // Create a job application
    const app = await factory.insert('jobApplication', {
      id: 'app-multi',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company Multi',
      position: 'Position Multi',
      jobDescription: 'Description Multi',
      status: 'saved',
      appliedDate: null,
      notes: 'Original notes'
    });

    // Update multiple fields
    const appliedDate = '2026-02-03T15:30:00.000Z';
    const updates = {
      status: 'interviewing',
      appliedDate,
      notes: 'Multiple updates'
    };

    const result = await service.execute(app.id, user.id, updates);

    expect(result.jobApplication).toMatchObject({
      id: app.id,
      status: 'interviewing',
      notes: 'Multiple updates'
    });
    expect(result.jobApplication.appliedDate).toEqual(new Date(appliedDate));

    // Verify the updates in database
    const updatedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(updatedApp.status).toBe('interviewing');
    expect(updatedApp.appliedDate).toEqual(new Date(appliedDate));
    expect(updatedApp.notes).toBe('Multiple updates');
  });

  it('should throw error when application not found', async () => {
    const user = await factory.insert('user', {
      id: 'user-notfound',
      email: 'test-notfound@example.com',
      name: 'Test User Not Found',
      passwordHash: 'hash'
    });

    await expect(service.execute('non-existent-id', user.id, { status: 'applied' }))
      .rejects.toThrow('Job application not found');
  });

  it('should throw error for invalid id', async () => {
    const user = await factory.insert('user', {
      id: 'user-invalid',
      email: 'test-invalid@example.com',
      name: 'Test User Invalid',
      passwordHash: 'hash'
    });

    await expect(service.execute('', user.id, { status: 'applied' }))
      .rejects.toThrow('Invalid job application ID');
  });

  it('should throw error for invalid userId', async () => {
    await expect(service.execute('app-1', 123, { status: 'applied' }))
      .rejects.toThrow('Invalid input: expected string, received number');
  });

  it('should throw error for invalid status', async () => {
    const user = await factory.insert('user', {
      id: 'user-invalid-status',
      email: 'test-invalid-status@example.com',
      name: 'Test User Invalid Status',
      passwordHash: 'hash'
    });

    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-invalid-status',
      userId: user.id,
      name: 'Test List',
      description: 'Test'
    });

    const app = await factory.insert('jobApplication', {
      id: 'app-invalid-status',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company',
      position: 'Position',
      jobDescription: 'Description',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes'
    });

    await expect(service.execute(app.id, user.id, { status: 'invalid_status' }))
      .rejects.toThrow('Validation failed');
  });
});