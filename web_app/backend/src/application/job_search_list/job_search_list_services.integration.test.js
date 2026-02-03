import { describe, it, expect, beforeEach } from 'vitest';
import { CreateJobSearchListService } from './create_job_search_list_service.js';
import { ListJobSearchListsService } from './list_job_search_lists_service.js';
import { UpdateJobSearchListService } from './update_job_search_list_service.js';
import { DeleteJobSearchListService } from './delete_job_search_list_service.js';
import { JobSearchListRepository } from '../../domain/job_search_list/job_search_list_repository.js';
import { D1JobSearchListRepository } from '../../adapters/repositories/job_search_list/d1_job_search_list_repository.js';
import { Factory, fakeEmail, newUUID } from '../../factory.js';

describe('Job Search List Services Integration Tests', () => {
  let createService;
  let listService;
  let updateService;
  let deleteService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const jobSearchListRepo = new JobSearchListRepository(new D1JobSearchListRepository(db));
    createService = new CreateJobSearchListService(jobSearchListRepo);
    listService = new ListJobSearchListsService(jobSearchListRepo);
    updateService = new UpdateJobSearchListService(jobSearchListRepo);
    deleteService = new DeleteJobSearchListService(jobSearchListRepo);
    factory = new Factory(db);
  });

  it('should create a job search list and list it', async () => {
    // Create a user
    const userId = newUUID();
    const user = await factory.insert('user', { id: userId, email: fakeEmail(), name: 'Test User', passwordHash: 'hashed' });

    // Create a list
    const createCommand = {
      userId: userId,
      name: 'My Job List',
      description: 'A list for job hunting'
    };
    const createdList = await createService.execute(createCommand);

    expect(createdList).toBeDefined();
    expect(createdList.userId).toBe(userId);
    expect(createdList.name).toBe('My Job List');
    expect(createdList.description).toBe('A list for job hunting');

    // List lists
    const listCommand = {
      userId: userId
    };
    const lists = await listService.execute(listCommand);

    expect(lists).toHaveLength(1);
    expect(lists[0].id).toBe(createdList.id);
    expect(lists[0].name).toBe('My Job List');
  });

  it('should update a job search list', async () => {
    // Create a user
    const userId = newUUID();
    const user = await factory.insert('user', { id: userId, email: fakeEmail(), name: 'Update User', passwordHash: 'hashed' });

    // Create a list
    const createCommand = {
      userId: userId,
      name: 'Original Name',
      description: 'Original Desc'
    };
    const createdList = await createService.execute(createCommand);

    // Update the list
    const updateCommand = {
      id: createdList.id,
      userId: userId,
      name: 'Updated Name',
      description: 'Updated Desc'
    };
    const updatedList = await updateService.execute(updateCommand);

    expect(updatedList.name).toBe('Updated Name');
    expect(updatedList.description).toBe('Updated Desc');
  });

  it('should delete a job search list', async () => {
    // Create a user
    const userId = newUUID();
    const user = await factory.insert('user', { id: userId, email: fakeEmail(), name: 'Delete User', passwordHash: 'hashed' });

    // Create a list
    const createCommand = {
      userId: userId,
      name: 'List to Delete'
    };
    const createdList = await createService.execute(createCommand);

    // Delete the list
    const deleteCommand = {
      id: createdList.id,
      userId: userId
    };
    const result = await deleteService.execute(deleteCommand);
    expect(result.success).toBe(true);

    // Verify it's gone
    const listCommand = {
      userId: userId
    };
    const lists = await listService.execute(listCommand);
    expect(lists).toHaveLength(0);
  });

  it('should throw error for unauthorized update', async () => {
    // Create two users
    const user1Id = newUUID();
    const user2Id = newUUID();
    const user1 = await factory.insert('user', { id: user1Id, email: fakeEmail(), name: 'User 1', passwordHash: 'hashed' });
    const user2 = await factory.insert('user', { id: user2Id, email: fakeEmail(), name: 'User 2', passwordHash: 'hashed' });

    // Create a list for user1
    const createCommand = {
      userId: user1Id,
      name: 'User1 List'
    };
    const createdList = await createService.execute(createCommand);

    // Try to update as user2
    const updateCommand = {
      id: createdList.id,
      userId: user2Id,
      name: 'Hacked Name'
    };
    await expect(updateService.execute(updateCommand)).rejects.toThrow('Access denied');
  });

  it('should throw error for unauthorized delete', async () => {
    // Create two users
    const user1Id = newUUID();
    const user2Id = newUUID();
    const user1 = await factory.insert('user', { id: user1Id, email: fakeEmail(), name: 'User 3', passwordHash: 'hashed' });
    const user2 = await factory.insert('user', { id: user2Id, email: fakeEmail(), name: 'User 4', passwordHash: 'hashed' });

    // Create a list for user1
    const createCommand = {
      userId: user1Id,
      name: 'User3 List'
    };
    const createdList = await createService.execute(createCommand);

    // Try to delete as user2
    const deleteCommand = {
      id: createdList.id,
      userId: user2Id
    };
    await expect(deleteService.execute(deleteCommand)).rejects.toThrow('Access denied');
  });
});