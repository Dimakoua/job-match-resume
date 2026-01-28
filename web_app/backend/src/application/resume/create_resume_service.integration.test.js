import { describe, it, expect, beforeEach } from "vitest";
import { CreateResumeService } from "./create_resume_service.js";
import { ListResumesService } from "./list_resumes_service.js";
import { ResumeRepository } from "../../domain/resume/resume_repository.js";
import { D1ResumeRepository } from "../../adapters/repositories/resume/d1_resume_repository.js";
import { Factory } from "../../factory.js";

describe("Resume Services Integration Tests", () => {
  let createService;
  let listService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    createService = new CreateResumeService(resumeRepo);
    listService = new ListResumesService(resumeRepo);
    factory = new Factory(db);
  });

  it("should create a resume and list it", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-456', email: 'test@example.com', name: 'Test User', passwordHash: 'hashed' });

    // Create a resume
    const createCommand = {
      userId: 'user-456',
      title: 'My Integration Resume'
    };
    const createdResume = await createService.execute(createCommand);

    expect(createdResume).toBeDefined();
    expect(createdResume.userId).toBe('user-456');
    expect(createdResume.title).toBe('My Integration Resume');

    // List resumes
    const listCommand = {
      userId: 'user-456'
    };
    const resumes = await listService.execute(listCommand);

    expect(resumes).toHaveLength(1);
    expect(resumes[0].id).toBe(createdResume.id);
    expect(resumes[0].title).toBe('My Integration Resume');
    expect(resumes[0].updatedAt).toBeInstanceOf(Date);
  });

  it("should create multiple resumes and list them", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-789', email: 'test2@example.com', name: 'Test User 2', passwordHash: 'hashed' });

    // Create multiple resumes
    const resume1 = await createService.execute({ userId: 'user-789', title: 'Resume 1' });
    const resume2 = await createService.execute({ userId: 'user-789', title: 'Resume 2', templateId: 'template-123' });

    // List resumes
    const resumes = await listService.execute({ userId: 'user-789' });

    expect(resumes).toHaveLength(2);
    const titles = resumes.map(r => r.title).sort();
    expect(titles).toEqual(['Resume 1', 'Resume 2']);
  });

  it("should not list resumes from other users", async () => {
    // Create two users
    const user1 = await factory.insert('user', { id: 'user-a', email: 'a@example.com', name: 'User A', passwordHash: 'hash' });
    const user2 = await factory.insert('user', { id: 'user-b', email: 'b@example.com', name: 'User B', passwordHash: 'hash' });

    // Create resume for user1
    await createService.execute({ userId: 'user-a', title: 'User A Resume' });

    // List for user2 should be empty
    const user2Resumes = await listService.execute({ userId: 'user-b' });
    expect(user2Resumes).toHaveLength(0);

    // List for user1 should have 1
    const user1Resumes = await listService.execute({ userId: 'user-a' });
    expect(user1Resumes).toHaveLength(1);
  });
});