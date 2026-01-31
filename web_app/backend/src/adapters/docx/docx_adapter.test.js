import { describe, it, expect } from "vitest";
import { DocxAdapter } from "./docx_adapter.js";

describe("DocxAdapter", () => {
  const adapter = new DocxAdapter();

  describe("generateBuffer", () => {
    it("should generate a DOCX buffer for a valid resume with object sections", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Software Engineer Resume",
        sections: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "123-456-7890",
          location: "New York, NY",
          linkedin: "https://linkedin.com/in/johndoe",
          summary: "Experienced software engineer with 5 years of experience in web development.",
          experience: [
            {
              position: "Senior Developer",
              company: "Tech Corp",
              duration: "2020-01 to 2023-12",
              location: "San Francisco, CA",
              achievements: ["Led development of web applications", "Mentored junior developers"]
            },
            {
              position: "Developer",
              company: "Startup Inc",
              duration: "2019-01 to 2020-12",
              location: "Remote",
              achievements: ["Built REST APIs", "Implemented CI/CD pipelines"]
            }
          ],
          education: [
            {
              degree: "Bachelor of Science in Computer Science",
              university: "University of Technology",
              years: "2015-2019"
            }
          ],
          skills: ["JavaScript", "React", "Node.js", "Python", "AWS"]
        },
        templateId: "professional",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const buffer = await adapter.generateBuffer(resume);

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      // DOCX files are ZIP archives, so they start with PK
      const docxHeader = String.fromCharCode(...buffer.slice(0, 2));
      expect(docxHeader).toBe("PK");
    });

    it("should throw error for invalid resume data", async () => {
      await expect(adapter.generateBuffer(null)).rejects.toThrow("Resume data is required");
      await expect(adapter.generateBuffer({})).rejects.toThrow("Resume must have sections object");
      await expect(adapter.generateBuffer({ sections: null })).rejects.toThrow("Resume must have sections object");
    });

    it("should handle minimal resume with only personal info", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Basic Resume",
        sections: {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@example.com"
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      const docxHeader = String.fromCharCode(...buffer.slice(0, 2));
      expect(docxHeader).toBe("PK");
    });

    it("should handle resume without optional fields", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Incomplete Resume",
        sections: {
          firstName: "Bob",
          lastName: "Johnson"
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays in sections", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Empty Arrays",
        sections: {
          firstName: "Alice",
          lastName: "Brown",
          experience: [],
          education: [],
          skills: []
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple experience entries", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Multiple Jobs",
        sections: {
          firstName: "Charlie",
          lastName: "Davis",
          experience: [
            {
              position: "Senior Developer",
              company: "Company A",
              duration: "2022-01 to Present",
              achievements: ["Achievement 1", "Achievement 2"]
            },
            {
              position: "Developer",
              company: "Company B",
              duration: "2020-01 to 2022-12",
              achievements: ["Achievement 3"]
            },
            {
              position: "Junior Developer",
              company: "Company C",
              duration: "2019-01 to 2020-12",
              achievements: ["Started learning"]
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle multiple education entries", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Multiple Degrees",
        sections: {
          firstName: "Diana",
          lastName: "Evans",
          education: [
            {
              degree: "Master of Science in Computer Science",
              university: "MIT",
              years: "2021-2023"
            },
            {
              degree: "Bachelor of Science in Computer Science",
              university: "Stanford",
              years: "2017-2021"
            }
          ]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle skills as array", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Skills",
        sections: {
          firstName: "Eve",
          lastName: "Frank",
          skills: ["JavaScript", "TypeScript", "React", "Vue.js", "Python", "Java", "C++"]
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle summary section", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Summary",
        sections: {
          firstName: "Frank",
          lastName: "Garcia",
          summary: "Passionate developer with expertise in full-stack development and cloud architecture."
        }
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});