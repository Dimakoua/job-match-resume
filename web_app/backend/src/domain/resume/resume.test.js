import { describe, it, expect } from "vitest";
import { Resume } from "./resume.js";

describe("Resume Entity", () => {
  const validId = "resume-123";
  const validUserId = "user-456";
  const validTitle = "Software Engineer Resume";

  describe("constructor", () => {
    it("should create a resume with valid parameters", () => {
      const resume = new Resume(validId, validUserId, validTitle);
      expect(resume.id).toBe(validId);
      expect(resume.userId).toBe(validUserId);
      expect(resume.title).toBe(validTitle);
      expect(resume.sections).toEqual([]);
    });

    it("should create a resume with initial sections", () => {
      const sections = [
        { type: "experience", data: { company: "ABC Corp" } },
        { type: "education", data: { degree: "BS" } }
      ];
      const resume = new Resume(validId, validUserId, validTitle, sections);
      expect(resume.sections).toEqual(sections);
    });

    it("should trim title", () => {
      const resume = new Resume(validId, validUserId, "  My Resume  ");
      expect(resume.title).toBe("My Resume");
    });

    it("should throw error for invalid id", () => {
      expect(() => new Resume("", validUserId, validTitle)).toThrow("Resume ID must be a non-empty string");
      expect(() => new Resume(null, validUserId, validTitle)).toThrow("Resume ID must be a non-empty string");
      expect(() => new Resume(123, validUserId, validTitle)).toThrow("Resume ID must be a non-empty string");
    });

    it("should throw error for invalid userId", () => {
      expect(() => new Resume(validId, "", validTitle)).toThrow("User ID must be a non-empty string");
      expect(() => new Resume(validId, null, validTitle)).toThrow("User ID must be a non-empty string");
      expect(() => new Resume(validId, 123, validTitle)).toThrow("User ID must be a non-empty string");
    });

    it("should throw error for invalid title", () => {
      expect(() => new Resume(validId, validUserId, "")).toThrow("Title cannot be empty");
      expect(() => new Resume(validId, validUserId, null)).toThrow("Title is required");
      expect(() => new Resume(validId, validUserId, 123)).toThrow("Title is required");
    });

    it("should throw error for invalid sections", () => {
      expect(() => new Resume(validId, validUserId, validTitle, "not array")).toThrow("Sections must be an array");
      expect(() => new Resume(validId, validUserId, validTitle, null)).toThrow("Sections must be an array");
    });
  });

  describe("addSection", () => {
    let resume;

    beforeEach(() => {
      resume = new Resume(validId, validUserId, validTitle);
    });

    it("should add a section", () => {
      const section = { type: "experience", data: { company: "ABC Corp" } };
      resume.addSection(section);
      expect(resume.sections).toEqual([section]);
    });

    it("should allow multiple sections", () => {
      const section1 = { type: "experience", data: { company: "ABC" } };
      const section2 = { type: "education", data: { degree: "BS" } };
      resume.addSection(section1);
      resume.addSection(section2);
      expect(resume.sections).toEqual([section1, section2]);
    });

    it("should throw error for invalid section", () => {
      expect(() => resume.addSection(null)).toThrow("Section must be an object");
      expect(() => resume.addSection("string")).toThrow("Section must be an object");
      expect(() => resume.addSection({})).toThrow("Section must have a type");
      expect(() => resume.addSection({ data: {} })).toThrow("Section must have a type");
      expect(() => resume.addSection({ type: 123, data: {} })).toThrow("Section must have a type");
    });
  });

  describe("removeSection", () => {
    let resume;

    beforeEach(() => {
      resume = new Resume(validId, validUserId, validTitle, [
        { type: "experience", data: { company: "ABC" } },
        { type: "education", data: { degree: "BS" } }
      ]);
    });

    it("should remove a section by type", () => {
      resume.removeSection("experience");
      expect(resume.sections).toEqual([{ type: "education", data: { degree: "BS" } }]);
    });

    it("should throw error if section not found", () => {
      expect(() => resume.removeSection("skills")).toThrow("Section of type 'skills' not found");
    });

    it("should throw error for invalid type", () => {
      expect(() => resume.removeSection("")).toThrow("Type must be a non-empty string");
      expect(() => resume.removeSection(null)).toThrow("Type must be a non-empty string");
      expect(() => resume.removeSection(123)).toThrow("Type must be a non-empty string");
    });
  });

  describe("getSection", () => {
    let resume;

    beforeEach(() => {
      resume = new Resume(validId, validUserId, validTitle, [
        { type: "experience", data: { company: "ABC" } },
        { type: "education", data: { degree: "BS" } }
      ]);
    });

    it("should return section by type", () => {
      const section = resume.getSection("experience");
      expect(section).toEqual({ type: "experience", data: { company: "ABC" } });
    });

    it("should return null if section not found", () => {
      const section = resume.getSection("skills");
      expect(section).toBeNull();
    });
  });
});