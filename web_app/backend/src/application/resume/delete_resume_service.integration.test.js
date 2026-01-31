import { describe, it, expect, beforeEach } from "vitest";
import { DeleteResumeService } from "./delete_resume_service.js";
import { CreateResumeService } from "./create_resume_service.js";
import { ListResumesService } from "./list_resumes_service.js";
import { ResumeRepository } from "../../domain/resume/resume_repository.js";
import { TemplateRepository } from "../../domain/template/template_repository.js";
import { D1ResumeRepository } from "../../adapters/repositories/resume/d1_resume_repository.js";
import { Factory } from "../../factory.js";

describe("DeleteResumeService Integration Tests", () => {
  let deleteService;
  let createService;
  let listService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    const templateRepo = new TemplateRepository();
    deleteService = new DeleteResumeService(resumeRepo);
    createService = new CreateResumeService(resumeRepo, templateRepo);
    listService = new ListResumesService(resumeRepo);
    factory = new Factory(db);
  });

  it("should delete a resume successfully", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-delete-1', email: 'delete@example.com', name: 'Delete Test', passwordHash: 'hashed' });

    // Create a resume
    const resume = await createService.execute({ userId: 'user-delete-1', title: 'Resume to Delete' });

    // Verify it exists
    const resumesBefore = await listService.execute({ userId: 'user-delete-1' });
    expect(resumesBefore).toHaveLength(1);

    // Delete the resume
    const result = await deleteService.execute({ resumeId: resume.id, userId: 'user-delete-1' });

    expect(result.success).toBe(true);
    expect(result.id).toBe(resume.id);

    // Verify it's gone
    const resumesAfter = await listService.execute({ userId: 'user-delete-1' });
    expect(resumesAfter).toHaveLength(0);
  });

  it("should reject deletion of non-existent resume", async () => {
    // Create a user
    const user = await factory.insert('user', { id: 'user-delete-2', email: 'delete2@example.com', name: 'Delete Test 2', passwordHash: 'hashed' });

    // Try to delete non-existent resume
    try {
      await deleteService.execute({ resumeId: 'non-existent-id', userId: 'user-delete-2' });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Resume not found');
    }
  });

  it("should reject deletion by different user", async () => {
    // Create two users
    const user1 = await factory.insert('user', { id: 'user-delete-3', email: 'delete3@example.com', name: 'Delete Test 3', passwordHash: 'hashed' });
    const user2 = await factory.insert('user', { id: 'user-delete-4', email: 'delete4@example.com', name: 'Delete Test 4', passwordHash: 'hashed' });

    // Create resume for user1
    const resume = await createService.execute({ userId: 'user-delete-3', title: 'Private Resume' });

    // Try to delete with user2
    try {
      await deleteService.execute({ resumeId: resume.id, userId: 'user-delete-4' });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('Access denied');
    }

    // Verify resume still exists
    const resumes = await listService.execute({ userId: 'user-delete-3' });
    expect(resumes).toHaveLength(1);
  });

  it("should handle missing userId", async () => {
    try {
      await deleteService.execute({ resumeId: 'some-id' });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('userId is required');
    }
  });

  it("should handle missing resumeId", async () => {
    try {
      await deleteService.execute({ userId: 'user-delete-5' });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).toBe('resumeId is required');
    }
  });
});
