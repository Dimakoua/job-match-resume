// application/job_application/list_job_applications_service.integration.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { Factory } from '../../factory.js';
import { ListJobApplicationsService } from './list_job_applications_service.js';

describe('ListJobApplicationsService Integration Tests', () => {
  let factory;
  let service;
  let db;

  beforeEach(async () => {
    db = global.DB;
    factory = new Factory(db);
    service = new ListJobApplicationsService(factory.jobApplicationRepo);

    // Clean the test database
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM JobSearchLists').run();
    await db.prepare('DELETE FROM Users').run();
  });

  it('should list job applications for a specific job search list', async () => {
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

    // Create job applications
    const app1 = await factory.insert('jobApplication', {
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

    const app2 = await factory.insert('jobApplication', {
      id: 'app-2',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company B',
      position: 'Position B',
      jobDescription: 'Description B',
      status: 'applied',
      appliedDate: Date.now(),
      notes: 'Notes B'
    });

    // Create an application in a different list (should not be returned)
    await factory.insert('jobApplication', {
      id: 'app-3',
      userId: user.id,
      jobSearchListId: 'different-list',
      resumeId: null,
      company: 'Company C',
      position: 'Position C',
      jobDescription: 'Description C',
      status: 'saved',
      appliedDate: null,
      notes: 'Notes C'
    });

    const result = await service.execute(jobSearchList.id, user.id);

    expect(result.applications).toHaveLength(2);

    // Check first application
    expect(result.applications[0]).toMatchObject({
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

    // Check second application
    expect(result.applications[1]).toMatchObject({
      id: 'app-2',
      userId: user.id,
      jobSearchListId: jobSearchList.id,
      resumeId: null,
      company: 'Company B',
      position: 'Position B',
      jobDescription: 'Description B',
      status: 'applied',
      notes: 'Notes B'
    });
    expect(result.applications[1].appliedDate).toBeDefined();
  });

  it('should return empty array when no applications exist', async () => {
    const user = await factory.insert('user', {
      id: 'user-456',
      email: 'test2@example.com',
      name: 'Test User 2',
      passwordHash: 'hash'
    });

    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-456',
      userId: user.id,
      name: 'Empty List',
      description: 'No applications here'
    });

    const result = await service.execute(jobSearchList.id, user.id);

    expect(result.applications).toHaveLength(0);
  });

  it('should throw error for invalid jobSearchListId', async () => {
    const user = await factory.insert('user', {
      id: 'user-789',
      email: 'test3@example.com',
      name: 'Test User 3',
      passwordHash: 'hash'
    });

    await expect(service.execute(123, user.id)).rejects.toThrow('Invalid job search list ID');
  });

  it('should throw error for invalid userId', async () => {
    const jobSearchList = await factory.insert('jobSearchList', {
      id: 'list-789',
      userId: 'user-789',
      name: 'Test List',
      description: 'Test'
    });

    await expect(service.execute(jobSearchList.id, null)).rejects.toThrow('Invalid user ID');
  });
});