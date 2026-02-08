// application/job_application/archive_job_application_service.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from '../../factory.js';
import { ArchiveJobApplicationService } from './archive_job_application_service.js';

describe('ArchiveJobApplicationService Integration Tests', () => {
  let factory;
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    service = new ArchiveJobApplicationService(factory.jobApplicationRepo);

    // Clean the test database
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM JobSearchLists').run();
    await db.prepare('DELETE FROM Users').run();
  });

  it('should archive a job application', async () => {
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
      notes: 'Notes A',
      archived: false
    });

    // Archive the job application
    const result = await service.execute(app.id, user.id);

    expect(result).toEqual({
      success: true,
      message: 'Job application archived successfully'
    });

    // Verify the archive in database
    const archivedApp = await factory.jobApplicationRepo.findById(app.id);
    expect(archivedApp.archived).toBe(true);
  });

  it('should throw error when job application not found', async () => {
    await expect(service.execute('non-existent-id', 'user-123')).rejects.toThrow('Job application not found');
  });

  it('should throw error when user does not own the job application', async () => {
    // Create a user
    const user1 = await factory.insert('user', {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hash'
    });

    // Create another user
    const user2 = await factory.insert('user', {
      id: 'user-456',
      email: 'test2@example.com',
      name: 'Test User 2',
      passwordHash: 'hash'
    });

    // Create a job search list for user1
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-123',
      userId: user1.id,
      name: '2026 Job Hunt',
      description: 'My job search for 2026'
    });

    // Create a job application for user1
    const app = await factory.insert('jobApplication', {
      id: 'app-1',
      userId: user1.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company A',
      position: 'Position A',
      jobDescription: 'Description A',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes A',
      archived: false
    });

    // Try to archive as user2
    await expect(service.execute(app.id, user2.id)).rejects.toThrow('Access denied');
  });

  it('should throw error when archive operation fails', async () => {
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
      notes: 'Notes A',
      archived: false
    });

    // Mock the repository to return false
    const originalArchiveById = factory.jobApplicationRepo.archiveById;
    factory.jobApplicationRepo.archiveById = async () => false;

    await expect(service.execute(app.id, user.id)).rejects.toThrow('Failed to archive job application');

    // Restore original method
    factory.jobApplicationRepo.archiveById = originalArchiveById;
  });
});