import { describe, it, expect, beforeEach } from 'vitest';
import { D1JobSearchListRepository } from './d1_job_search_list_repository.js';
import { JobSearchList } from '../../../domain/job_search_list/job_search_list.js';
import { newUUID, fakeEmail, Factory } from '../../../factory.js';

describe('D1JobSearchListRepository Integration Tests', () => {
  let db;
  let repo;
  let factory;

  beforeEach(() => {
    db = global.DB;
    if (!db) {
      repo = null;
      factory = null;
      return;
    }
    repo = new D1JobSearchListRepository(db);
    factory = new Factory(db);
  });

  it('should save and find a job search list by ID', async () => {
    // Create a user first
    const user = await factory.insert('user', {id: newUUID(), email: fakeEmail(), name: 'Test User', passwordHash: 'hashedpass'});
    const listId = newUUID();
    const name = 'My Job List';
    const description = 'A list for job hunting';
    const list = new JobSearchList(listId, user.id, name, description);

    // Save the list
    await repo.save(list);

    // Find the list
    const foundList = await repo.findById(listId);

    expect(foundList).not.toBeNull();
    expect(foundList.id).toBe(listId);
    expect(foundList.userId).toBe(user.id);
    expect(foundList.name).toBe(name);
    expect(foundList.description).toBe(description);
  });

  it('should return null for non-existent list', async () => {
    const nonExistentId = newUUID();
    const foundList = await repo.findById(nonExistentId);
    expect(foundList).toBeNull();
  });

  it('should find all lists for a user', async () => {
    // Create a user first
    const user = await factory.insert('user', {id: newUUID(), email: fakeEmail(), name: 'Test User', passwordHash: 'hashedpass'});
    const list1Id = newUUID();
    const list2Id = newUUID();

    const list1 = new JobSearchList(list1Id, user.id, 'List 1', 'Desc 1');
    const list2 = new JobSearchList(list2Id, user.id, 'List 2', null);

    await repo.save(list1);
    await repo.save(list2);

    const lists = await repo.findAllByUserId(user.id);

    expect(lists).toHaveLength(2);
    expect(lists.map(l => l.id)).toContain(list1Id);
    expect(lists.map(l => l.id)).toContain(list2Id);
  });

  it('should return empty array for user with no lists', async () => {
    const userId = newUUID();
    const lists = await repo.findAllByUserId(userId);
    expect(lists).toEqual([]);
  });

  it('should update list name and description', async () => {
    // Create a user first
    const user = await factory.insert('user', {id: newUUID(), email: fakeEmail(), name: 'Test User', passwordHash: 'hashedpass'});
    const listId = newUUID();
    const list = new JobSearchList(listId, user.id, 'Original Name', 'Original Desc');

    // Save the list
    await repo.save(list);

    // Update name and description
    list.updateName('Updated Name');
    list.updateDescription('Updated Desc');
    await repo.update(list);

    // Find and verify
    const updatedList = await repo.findById(listId);
    expect(updatedList).not.toBeNull();
    expect(updatedList.id).toBe(listId);
    expect(updatedList.userId).toBe(user.id);
    expect(updatedList.name).toBe('Updated Name');
    expect(updatedList.description).toBe('Updated Desc');
  });

  it('should delete a list', async () => {
    // Create a user first
    const user = await factory.insert('user', {id: newUUID(), email: fakeEmail(), name: 'Test User', passwordHash: 'hashedpass'});
    const listId = newUUID();
    const list = new JobSearchList(listId, user.id, 'List to Delete');

    await repo.save(list);

    // Verify it exists
    const foundBefore = await repo.findById(listId);
    expect(foundBefore).not.toBeNull();

    // Delete it
    await repo.delete(listId);

    // Verify it's gone
    const foundAfter = await repo.findById(listId);
    expect(foundAfter).toBeNull();
  });

  it('should throw error on save with invalid data', async () => {
    // Create a user first
    const user = await factory.insert('user', {id: newUUID(), email: fakeEmail(), name: 'Test User', passwordHash: 'hashedpass'});
    const listId = newUUID();
    const list = new JobSearchList(listId, user.id, 'Test List');

    await repo.save(list);
    // Saving again should fail due to unique constraint on id
    await expect(repo.save(list)).rejects.toThrow('Failed to save job search list');
  });
});