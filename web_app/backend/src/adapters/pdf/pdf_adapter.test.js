import { describe, it, expect } from "vitest";
import { PdfAdapter } from "./pdf_adapter.js";

describe("PdfAdapter", () => {
  const adapter = new PdfAdapter();

  describe("generateBuffer", () => {
    it("should generate a PDF buffer for a valid resume", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Software Engineer Resume",
        sections: [
          {
            type: "personal_info",
            data: {
              name: "John Doe",
              email: "john@example.com",
              phone: "123-456-7890",
              location: "New York, NY"
            }
          },
          {
            type: "summary",
            data: {
              text: "Experienced software engineer with 5 years of experience in web development."
            }
          },
          {
            type: "experience",
            data: {
              position: "Senior Developer",
              company: "Tech Corp",
              startDate: "2020-01",
              endDate: "2023-12",
              description: "Led development of web applications using React and Node.js."
            }
          },
          {
            type: "education",
            data: {
              degree: "Bachelor of Science",
              institution: "University of Technology",
              graduationDate: "2019"
            }
          },
          {
            type: "skills",
            data: {
              skills: ["JavaScript", "React", "Node.js", "Python"]
            }
          }
        ],
        templateId: "professional",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const buffer = await adapter.generateBuffer(resume);

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);

      // PDF files start with %PDF-
      const pdfHeader = String.fromCharCode(...buffer.slice(0, 5));
      expect(pdfHeader).toBe("%PDF-");
    });

    it("should throw error for invalid resume data", async () => {
      await expect(adapter.generateBuffer(null)).rejects.toThrow("Resume data is required");
      await expect(adapter.generateBuffer({})).rejects.toThrow("Resume must have sections array");
      await expect(adapter.generateBuffer({ sections: null })).rejects.toThrow("Resume must have sections array");
    });

    it("should handle empty sections array", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Empty Resume",
        sections: []
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle sections with missing data", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Incomplete Resume",
        sections: [
          { type: "personal_info", data: null },
          { type: null, data: { text: "test" } },
          { type: "summary", data: { text: "Valid summary" } }
        ]
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle array-based experience data", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Array Experience",
        sections: [
          {
            type: "experience",
            data: [
              {
                position: "Developer",
                company: "Company A",
                startDate: "2020",
                endDate: "2021",
                description: "Worked on projects"
              },
              {
                position: "Senior Developer",
                company: "Company B",
                startDate: "2021",
                endDate: "2023",
                description: "Led team projects"
              }
            ]
          }
        ]
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle array-based education data", async () => {
      const resume = {
        id: "resume-123",
        userId: "user-456",
        title: "Resume with Array Education",
        sections: [
          {
            type: "education",
            data: [
              {
                degree: "Bachelor",
                institution: "University A",
                graduationDate: "2019"
              },
              {
                degree: "Master",
                institution: "University B",
                graduationDate: "2021"
              }
            ]
          }
        ]
      };

      const buffer = await adapter.generateBuffer(resume);
      expect(buffer).toBeInstanceOf(Uint8Array);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});