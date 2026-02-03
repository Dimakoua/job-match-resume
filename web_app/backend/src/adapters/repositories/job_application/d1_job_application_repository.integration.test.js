import { describe, it, expect, beforeEach } from "vitest";
import { D1JobApplicationRepository } from "./d1_job_application_repository.js";
import { JobApplication } from "../../../domain/job_application/job_application.js";
import { Factory } from "../../../factory.js";

describe("D1JobApplicationRepository Integration Tests", () => {
  let repo;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    repo = new D1JobApplicationRepository(db);
    factory = new Factory(db);

    // Clean the test database
    await db.prepare('DELETE FROM JobApplications').run();
    await db.prepare('DELETE FROM JobSearchLists').run();
    await db.prepare('DELETE FROM Resumes').run();
    await db.prepare('DELETE FROM Users').run();
  });

  it("should save and find a job application by id", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-456', email: 'test@example.com', name: 'Test User', passwordHash: 'hashed' });
    const resume = await factory.insert('resume', {
      id: 'resume-123',
      userId: 'user-456',
      title: 'Test Resume',
      sections: []
    });

    const jobApp = new JobApplication(
      'app-123',
      'user-456',
      null,
      'resume-123',
      'Tech Corp',
      'Senior Developer',
      'We are looking for a senior developer with React experience...'
    );

    // Save
    await repo.save(jobApp);

    // Find
    const found = await repo.findById('app-123');
    expect(found).toBeDefined();
    expect(found.id).toBe('app-123');
    expect(found.userId).toBe('user-456');
    expect(found.resumeId).toBe('resume-123');
    expect(found.company).toBe('Tech Corp');
    expect(found.position).toBe('Senior Developer');
    expect(found.status).toBe('saved');
    expect(found.appliedDate).toBeNull();
  });

  it("should find all job applications by user id", async () => {
    // Create dependencies
    const user1 = await factory.insert('user', { id: 'user-a', email: 'a@example.com', name: 'User A', passwordHash: 'hash' });
    const user2 = await factory.insert('user', { id: 'user-b', email: 'b@example.com', name: 'User B', passwordHash: 'hash' });
    const resume1 = await factory.insert('resume', { id: 'resume-a', userId: 'user-a', title: 'Resume A', sections: [] });
    const resume2 = await factory.insert('resume', { id: 'resume-b', userId: 'user-b', title: 'Resume B', sections: [] });

    // Create job applications
    const app1 = new JobApplication('app-1', 'user-a', null, 'resume-a', 'Company A', 'Position A', 'Desc A');
    const app2 = new JobApplication('app-2', 'user-a', null, 'resume-a', 'Company B', 'Position B', 'Desc B');
    const app3 = new JobApplication('app-3', 'user-b', null, 'resume-b', 'Company C', 'Position C', 'Desc C');

    await repo.save(app1);
    await repo.save(app2);
    await repo.save(app3);

    // Find by user
    const userAApps = await repo.findByUserId('user-a');
    expect(userAApps).toHaveLength(2);
    expect(userAApps.map(app => app.id).sort()).toEqual(['app-1', 'app-2']);

    const userBApps = await repo.findByUserId('user-b');
    expect(userBApps).toHaveLength(1);
    expect(userBApps[0].id).toBe('app-3');
  });

  it("should filter by status", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-filter', email: 'filter@example.com', name: 'Filter User', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-filter', userId: 'user-filter', title: 'Filter Resume', sections: [] });

    // Create applications with different statuses
    const app1 = new JobApplication('app-1', 'user-filter', null, 'resume-filter', 'Company 1', 'Position 1', 'Desc 1', 'saved');
    const app2 = new JobApplication('app-2', 'user-filter', null, 'resume-filter', 'Company 2', 'Position 2', 'Desc 2', 'applied');
    const app3 = new JobApplication('app-3', 'user-filter', null, 'resume-filter', 'Company 3', 'Position 3', 'Desc 3', 'applied');

    await repo.save(app1);
    await repo.save(app2);
    await repo.save(app3);

    // Filter by status
    const appliedApps = await repo.findByUserId('user-filter', { status: 'applied' });
    expect(appliedApps).toHaveLength(2);
    expect(appliedApps.map(app => app.id).sort()).toEqual(['app-2', 'app-3']);

    const savedApps = await repo.findByUserId('user-filter', { status: 'saved' });
    expect(savedApps).toHaveLength(1);
    expect(savedApps[0].id).toBe('app-1');
  });

  it("should filter by job search list", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-list', email: 'list@example.com', name: 'List User', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-list', userId: 'user-list', title: 'List Resume', sections: [] });
    const list1 = await factory.insert('job_search_list', { id: 'list-1', userId: 'user-list', name: 'Tech Jobs' });
    const list2 = await factory.insert('job_search_list', { id: 'list-2', userId: 'user-list', name: 'Design Jobs' });

    // Create applications in different lists
    const app1 = new JobApplication('app-1', 'user-list', 'list-1', 'resume-list', 'Tech Corp', 'Developer', 'Tech job desc');
    const app2 = new JobApplication('app-2', 'user-list', 'list-2', 'resume-list', 'Design Inc', 'Designer', 'Design job desc');
    const app3 = new JobApplication('app-3', 'user-list', null, 'resume-list', 'General Co', 'Manager', 'General job desc');

    await repo.save(app1);
    await repo.save(app2);
    await repo.save(app3);

    // Filter by list
    const list1Apps = await repo.findByUserId('user-list', { jobSearchListId: 'list-1' });
    expect(list1Apps).toHaveLength(1);
    expect(list1Apps[0].id).toBe('app-1');

    const unlistedApps = await repo.findByUserId('user-list', { jobSearchListId: null });
    expect(unlistedApps).toHaveLength(1);
    expect(unlistedApps[0].id).toBe('app-3');
  });

  it("should update a job application", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-update', email: 'update@example.com', name: 'Update User', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-update', userId: 'user-update', title: 'Update Resume', sections: [] });
    const list = await factory.insert('job_search_list', { id: 'list-update', userId: 'user-update', name: 'Update List' });

    const app = new JobApplication(
      'app-update',
      'user-update',
      null,
      'resume-update',
      'Original Company',
      'Original Position',
      'Original description'
    );

    await repo.save(app);

    // Update the application
    app.updateStatus('applied');
    app.updateAppliedDate(new Date('2024-01-15'));
    app.updateNotes('Updated notes');
    app.updateJobSearchList('list-update');

    await repo.update(app);

    // Verify update
    const updated = await repo.findById('app-update');
    expect(updated.status).toBe('applied');
    expect(updated.appliedDate).toEqual(new Date('2024-01-15'));
    expect(updated.notes).toBe('Updated notes');
    expect(updated.jobSearchListId).toBe('list-update');
  });

  it("should delete a job application", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-delete', email: 'delete@example.com', name: 'Delete User', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-delete', userId: 'user-delete', title: 'Delete Resume', sections: [] });

    const app = new JobApplication('app-delete', 'user-delete', null, 'resume-delete', 'Delete Company', 'Delete Position', 'Delete desc');
    await repo.save(app);

    // Verify it exists
    const found = await repo.findById('app-delete');
    expect(found).toBeDefined();

    // Delete it
    const deleted = await repo.deleteById('app-delete', 'user-delete');
    expect(deleted).toBe(true);

    // Verify it's gone
    const notFound = await repo.findById('app-delete');
    expect(notFound).toBeNull();
  });

  it("should not delete job application from different user", async () => {
    // Create dependencies
    const user1 = await factory.insert('user', { id: 'user-1', email: 'user1@example.com', name: 'User 1', passwordHash: 'hash' });
    const user2 = await factory.insert('user', { id: 'user-2', email: 'user2@example.com', name: 'User 2', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-shared', userId: 'user-1', title: 'Shared Resume', sections: [] });

    const app = new JobApplication('app-shared', 'user-1', null, 'resume-shared', 'Shared Company', 'Shared Position', 'Shared desc');
    await repo.save(app);

    // Try to delete as different user
    const deleted = await repo.deleteById('app-shared', 'user-2');
    expect(deleted).toBe(false);

    // Verify it still exists
    const stillExists = await repo.findById('app-shared');
    expect(stillExists).toBeDefined();
  });

  it("should count job applications", async () => {
    // Create dependencies
    const user = await factory.insert('user', { id: 'user-count', email: 'count@example.com', name: 'Count User', passwordHash: 'hash' });
    const resume = await factory.insert('resume', { id: 'resume-count', userId: 'user-count', title: 'Count Resume', sections: [] });

    // Create applications with different statuses
    const app1 = new JobApplication('app-1', 'user-count', null, 'resume-count', 'Company 1', 'Position 1', 'Desc 1', 'saved');
    const app2 = new JobApplication('app-2', 'user-count', null, 'resume-count', 'Company 2', 'Position 2', 'Desc 2', 'applied');
    const app3 = new JobApplication('app-3', 'user-count', null, 'resume-count', 'Company 3', 'Position 3', 'Desc 3', 'applied');

    await repo.save(app1);
    await repo.save(app2);
    await repo.save(app3);

    // Count all
    const totalCount = await repo.countByUserId('user-count');
    expect(totalCount).toBe(3);

    // Count by status
    const appliedCount = await repo.countByUserId('user-count', { status: 'applied' });
    expect(appliedCount).toBe(2);

    const savedCount = await repo.countByUserId('user-count', { status: 'saved' });
    expect(savedCount).toBe(1);
  });
});