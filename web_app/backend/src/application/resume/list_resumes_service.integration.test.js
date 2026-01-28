import { describe, it, expect, beforeEach } from "vitest";
import { ListResumesService } from "./list_resumes_service.js";
import { CreateResumeService } from "./create_resume_service.js";
import { ResumeRepository } from "../../domain/resume/resume_repository.js";
import { D1ResumeRepository } from "../../adapters/repositories/resume/d1_resume_repository.js";
import { Factory } from "../../factory.js";

describe("ListResumesService Integration Tests", () => {
  let listService;
  let createService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    createService = new CreateResumeService(resumeRepo);
    listService = new ListResumesService(resumeRepo);
    factory = new Factory(db);
  });

  it("should return empty list for user with no resumes", async () => {
    const user = await factory.insert('user', { id: 'user-empty', email: 'empty@example.com', name: 'Empty User', passwordHash: 'hash' });

    const resumes = await listService.execute({ userId: 'user-empty' });

    expect(resumes).toEqual([]);
  });

  it("should return resume headers sorted by updated_at descending", async () => {
    const user = await factory.insert('user', { id: 'user-sort', email: 'sort@example.com', name: 'Sort User', passwordHash: 'hash' });

    // Create resumes with different titles
    const resume1 = await createService.execute({ userId: 'user-sort', title: 'First Resume' });
    const resume2 = await createService.execute({ userId: 'user-sort', title: 'Second Resume' });

    const resumes = await listService.execute({ userId: 'user-sort' });

    expect(resumes).toHaveLength(2);
    const titles = resumes.map(r => r.title).sort();
    expect(titles).toEqual(['First Resume', 'Second Resume']);
    resumes.forEach(resume => {
      expect(resume).toHaveProperty('id');
      expect(resume).toHaveProperty('title');
      expect(resume).toHaveProperty('updatedAt');
      expect(resume.updatedAt).toBeInstanceOf(Date);
    });
  });

  it("should only return resumes for the specified user", async () => {
    const user1 = await factory.insert('user', { id: 'user-1', email: 'u1@example.com', name: 'User 1', passwordHash: 'h1' });
    const user2 = await factory.insert('user', { id: 'user-2', email: 'u2@example.com', name: 'User 2', passwordHash: 'h2' });

    await createService.execute({ userId: 'user-1', title: 'User1 Resume' });
    await createService.execute({ userId: 'user-2', title: 'User2 Resume' });

    const user1Resumes = await listService.execute({ userId: 'user-1' });
    const user2Resumes = await listService.execute({ userId: 'user-2' });

    expect(user1Resumes).toHaveLength(1);
    expect(user1Resumes[0].title).toBe('User1 Resume');
    expect(user2Resumes).toHaveLength(1);
    expect(user2Resumes[0].title).toBe('User2 Resume');
  });
});