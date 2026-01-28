import { describe, it, expect, beforeEach } from "vitest";
import { D1ResumeRepository } from "./d1_resume_repository.js";
import { D1UserRepository } from "../user/d1_user_repository.js";
import { Resume } from "../../../domain/resume/resume.js";
import { User } from "../../../domain/user/user.js";
import { Factory } from "../../../factory.js";

describe("D1ResumeRepository Integration Tests", () => {
  let repo;
  let userRepo;
  let db;
  let factory;

  beforeEach(async () => {
    db = global.DB;
    repo = new D1ResumeRepository(db);
    userRepo = new D1UserRepository(db);
    factory = new Factory(db);
  });

  it("should save and find a resume by id", async () => {
    // Create a user first
    const user = await factory.insert('user', {id: 'user-456', email: 'test@example.com', name: 'Test User', passwordHash: 'hashedpassword'});

    const resume = await factory.insert('resume', {
      id: "resume-123",
      userId: "user-456",
      title: "My Resume",
      sections: [
        { type: "experience", data: { company: "ABC Corp" } },
        { type: "education", data: { degree: "BS" } }
      ],
      templateId: "template-789"
    });

    const found = await repo.findById("resume-123");

    expect(found).toBeDefined();
    expect(found.id).toBe("resume-123");
    expect(found.userId).toBe("user-456");
    expect(found.title).toBe("My Resume");
    expect(found.sections).toEqual(resume.sections);
    expect(found.templateId).toBe("template-789");
  });

  it("should return null for non-existent resume", async () => {
    const found = await repo.findById("non-existent");
    expect(found).toBeNull();
  });

  it("should find all resumes by user id", async () => {
    // Create users
    const user1 = await factory.insert('user', {id: 'user-1', email: 'user1@example.com', name: 'User 1', passwordHash: 'pass1'});
    const user2 = await factory.insert('user', {id: 'user-2', email: 'user2@example.com', name: 'User 2', passwordHash: 'pass2'});

    const resume1 = await factory.insert('resume', {id: "resume-1", userId: "user-1", title: "Resume 1", sections: [{ type: "experience", data: {} }]});
    const resume2 = await factory.insert('resume', {id: "resume-2", userId: "user-1", title: "Resume 2", sections: [{ type: "education", data: {} }]});
    const resume3 = await factory.insert('resume', {id: "resume-3", userId: "user-2", title: "Resume 3", sections: [{ type: "skills", data: {} }]});

    const user1Resumes = await repo.findAllByUserId("user-1");
    expect(user1Resumes).toHaveLength(2);
    expect(user1Resumes.map(r => r.id)).toEqual(["resume-1", "resume-2"]); // Assuming order by created_at

    const user2Resumes = await repo.findAllByUserId("user-2");
    expect(user2Resumes).toHaveLength(1);
    expect(user2Resumes[0].id).toBe("resume-3");

    const user3Resumes = await repo.findAllByUserId("user-3");
    expect(user3Resumes).toHaveLength(0);
  });

  it("should handle resumes without templateId", async () => {
    // Create a user
    const user = await factory.insert('user', {id: 'user-456', email: 'test@example.com', name: 'Test User', passwordHash: 'hashedpassword'});

    const resume = await factory.insert('resume', {id: "resume-no-template", userId: "user-456", title: "No Template Resume", sections: []});
    const found = await repo.findById("resume-no-template");
    expect(found.templateId).toBeNull();
  });
});