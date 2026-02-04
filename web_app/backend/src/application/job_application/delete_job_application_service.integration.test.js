// application/job_application/delete_job_application_service.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from '../../factory.js';
import { DeleteJobApplicationService } from './delete_job_application_service.js';
import { execute } from '../../adapters/infrastructure/database.js';

describe('DeleteJobApplicationService Integration Tests', () => {
  let factory;
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    service = new DeleteJobApplicationService(factory.jobApplicationRepo);

    // Clean the test database - delete in reverse dependency order
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM JobSearchLists').run();
    await db.prepare('DELETE FROM Users').run();
    await db.prepare('DELETE FROM Resumes').run();
  });

  it('should delete job application successfully', async () => {
    // Create a user
    const user = await factory.insert('user', {
      id: 'user-delete-123',
      email: 'test-delete-123@example.com',
      name: 'Test User Delete',
      passwordHash: 'hash'
    });

    // Create a job search list
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-delete-123',
      userId: user.id,
      name: '2026 Job Hunt',
      description: 'My job search for 2026'
    });

    // Create a job application
    const app = await factory.insert('jobApplication', {
      id: 'app-delete-1',
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

    // Verify it exists
    const existingApp = await factory.jobApplicationRepo.findById(app.id);
    expect(existingApp).toBeDefined();

    // Delete the application
    const result = await service.execute(app.id, 'user-delete-123');

    expect(result).toEqual({ success: true });

    // Verify it's deleted
    const deletedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(deletedApp).toBeNull();
  });

  it('should throw error when application not found', async () => {
    const user = await factory.insert('user', {
      id: 'user-notfound-123',
      email: 'test-notfound-123@example.com',
      name: 'Test User Not Found',
      passwordHash: 'hash'
    });

    await expect(service.execute('non-existent-id', user.id))
      .rejects.toThrow('Job application not found or access denied');
  });

  it('should throw error when trying to delete another user\'s application', async () => {
    // Create two users
    const user1 = await factory.insert('user', {
      id: 'user1-delete-access',
      email: 'user1-delete@example.com',
      name: 'User 1 Delete',
      passwordHash: 'hash'
    });

    const user2 = await factory.insert('user', {
      id: 'user2-delete-access',
      email: 'user2-delete@example.com',
      name: 'User 2 Delete',
      passwordHash: 'hash'
    });

    // Create a job search list for user1
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-delete-access',
      userId: user1.id,
      name: 'User1 List Delete',
      description: 'User1 job search delete'
    });

    // Create a job application for user1
    const app = await factory.insert('jobApplication', {
      id: 'app-delete-access',
      userId: user1.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company A',
      position: 'Position A',
      jobDescription: 'Description A',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes A'
    });

    // Try to delete as user2 (should fail)
    await expect(service.execute(app.id, user2.id))
      .rejects.toThrow('Job application not found or access denied');
  });

  it('should throw error for invalid id', async () => {
    const user = await factory.insert('user', {
      id: 'user-invalid-delete',
      email: 'test-invalid-delete@example.com',
      name: 'Test User Invalid Delete',
      passwordHash: 'hash'
    });

    await expect(service.execute(null, user.id))
      .rejects.toThrow('Invalid input: expected string, received null');
  });

  it('should throw error for invalid userId', async () => {
    await expect(service.execute('app-1', ''))
      .rejects.toThrow('Invalid user ID');
  });
});