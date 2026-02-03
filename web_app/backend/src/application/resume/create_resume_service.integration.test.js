import { describe, it, expect, beforeEach } from "vitest";
import { CreateResumeService } from "./create_resume_service.js";
import { ListResumesService } from "./list_resumes_service.js";
import { ResumeRepository } from "../../domain/resume/resume_repository.js";
import { TemplateRepository } from "../../domain/template/template_repository.js";
import { D1ResumeRepository } from "../../adapters/repositories/resume/d1_resume_repository.js";
import { Factory } from "../../factory.js";
import { cleanTestDatabase } from "../../test_helpers.js";

describe("Resume Services Integration Tests", () => {
  let createService;
  let listService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    const templateRepo = new TemplateRepository();
    createService = new CreateResumeService(resumeRepo, templateRepo);
    listService = new ListResumesService(resumeRepo);
    factory = new Factory(db);

    // Clean the test database
    await cleanTestDatabase(db);
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
    const resume2 = await createService.execute({ userId: 'user-789', title: 'Resume 2' });

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

  it("should create a resume with template sections", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-template', email: 'template@example.com', name: 'Template User', passwordHash: 'hash' });

    // Create resume with basic template
    const resume = await createService.execute({ userId: 'user-template', title: 'Template Resume', templateId: 'basic' });

    expect(resume.sections).toHaveLength(5);
    expect(resume.sections[0].type).toBe('personal');
    expect(resume.sections[1].type).toBe('summary');
    expect(resume.sections[2].type).toBe('experience');
    expect(resume.sections[3].type).toBe('education');
    expect(resume.sections[4].type).toBe('skills');
  });

  it("should create a resume with provided sections (JSON content)", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-provided', email: 'provided@example.com', name: 'Provided User', passwordHash: 'hash' });

    const customSections = {
      firstName: 'John',
      lastName: 'Doe',
      experience: []
    };

    // Create resume with provided sections
    const resume = await createService.execute({ 
      userId: 'user-provided', 
      title: 'Provided Resume', 
      sections: customSections 
    });

    expect(resume.sections).toEqual(customSections);
  });

  it("should create a resume with professional template sections", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-professional', email: 'professional@example.com', name: 'Professional User', passwordHash: 'hash' });

    // Create resume with professional template
    const resume = await createService.execute({ userId: 'user-professional', title: 'Professional Template Resume', templateId: 'professional' });

    expect(resume.sections).toHaveLength(6);
    expect(resume.sections[0].type).toBe('contact');
    expect(resume.sections[1].type).toBe('professional_summary');
    expect(resume.sections[2].type).toBe('work_experience');
    expect(resume.sections[3].type).toBe('education');
    expect(resume.sections[4].type).toBe('certifications');
    expect(resume.sections[5].type).toBe('professional_development');
  });

  it("should create empty resume for unknown template", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-unknown-template', email: 'unknown@example.com', name: 'Unknown Template User', passwordHash: 'hash' });

    // Create resume with unknown template
    const resume = await createService.execute({ userId: 'user-unknown-template', title: 'Unknown Template Resume', templateId: 'unknown' });

    expect(resume.sections).toEqual([]);
  });
});