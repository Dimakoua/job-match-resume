import { describe, it, expect, vi } from "vitest";
import { ExportResumeService } from "./export_resume_service.js";

describe("ExportResumeService", () => {
  const mockResumeRepository = {
    findById: vi.fn(),
  };

  const mockPdfAdapter = {
    generateBuffer: vi.fn(),
  };

  const mockDocxAdapter = {
    generateBuffer: vi.fn(),
  };

  const service = new ExportResumeService(
    mockResumeRepository,
    mockPdfAdapter,
    mockDocxAdapter
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("execute", () => {
    const validCommand = {
      resumeId: "resume-123",
      userId: "user-456",
      format: "pdf",
    };

    const mockResume = {
      id: "resume-123",
      userId: "user-456",
      title: "Software Engineer Resume",
      sections: [],
      templateId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBuffer = new Uint8Array([1, 2, 3, 4, 5]);

    it("should export resume as PDF successfully", async () => {
      mockResumeRepository.findById.mockResolvedValue(mockResume);
      mockPdfAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const result = await service.execute(validCommand);

      expect(mockResumeRepository.findById).toHaveBeenCalledWith("resume-123");
      expect(mockPdfAdapter.generateBuffer).toHaveBeenCalledWith(mockResume);
      expect(result).toEqual({
        buffer: mockBuffer,
        format: "pdf",
        filename: "Software_Engineer_Resume.pdf",
      });
    });

    it("should export resume as DOCX successfully", async () => {
      const docxCommand = { ...validCommand, format: "docx" };
      mockResumeRepository.findById.mockResolvedValue(mockResume);
      mockDocxAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const result = await service.execute(docxCommand);

      expect(mockResumeRepository.findById).toHaveBeenCalledWith("resume-123");
      expect(mockDocxAdapter.generateBuffer).toHaveBeenCalledWith(mockResume);
      expect(result).toEqual({
        buffer: mockBuffer,
        format: "docx",
        filename: "Software_Engineer_Resume.docx",
      });
    });

    it("should sanitize filename with special characters", async () => {
      const resumeWithSpecialChars = {
        ...mockResume,
        title: "Résumé & CV (2024) - @#$%",
      };
      mockResumeRepository.findById.mockResolvedValue(resumeWithSpecialChars);
      mockPdfAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const result = await service.execute(validCommand);

      expect(result.filename).toBe("Rsum_CV_2024_-_.pdf");
    });

    it("should truncate long filenames", async () => {
      const resumeWithLongTitle = {
        ...mockResume,
        title: "A".repeat(100),
      };
      mockResumeRepository.findById.mockResolvedValue(resumeWithLongTitle);
      mockPdfAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      const result = await service.execute(validCommand);

      expect(result.filename.length).toBeLessThanOrEqual(55); // 50 chars + .pdf
      expect(result.filename.endsWith(".pdf")).toBe(true);
    });

    it("should throw error for missing resumeId", async () => {
      await expect(service.execute({ userId: "user-456", format: "pdf" }))
        .rejects.toThrow("resumeId is required");
    });

    it("should throw error for missing userId", async () => {
      await expect(service.execute({ resumeId: "resume-123", format: "pdf" }))
        .rejects.toThrow("userId is required");
    });

    it("should throw error for invalid format", async () => {
      await expect(service.execute({ resumeId: "resume-123", userId: "user-456", format: "txt" }))
        .rejects.toThrow('format must be either "pdf" or "docx"');
    });

    it("should throw error for missing format", async () => {
      await expect(service.execute({ resumeId: "resume-123", userId: "user-456" }))
        .rejects.toThrow('format must be either "pdf" or "docx"');
    });

    it("should throw error when resume not found", async () => {
      mockResumeRepository.findById.mockResolvedValue(null);

      await expect(service.execute(validCommand))
        .rejects.toThrow("Resume not found");
    });

    it("should throw error when user does not own resume", async () => {
      const otherUserResume = { ...mockResume, userId: "other-user" };
      mockResumeRepository.findById.mockResolvedValue(otherUserResume);

      await expect(service.execute(validCommand))
        .rejects.toThrow("Access denied: resume does not belong to user");
    });

    it("should not export hidden standard sections", async () => {
      const resumeWithVisibility = {
        ...mockResume,
        sections: {
          firstName: "John",
          lastName: "Doe",
          summary: "Hidden summary",
          experience: [{ company: "ACME" }],
          skills: ["JavaScript"],
          layout: { template: "basic" },
          visibleSections: [
            { id: "personal", visible: true },
            { id: "summary", visible: false },
            { id: "experience", visible: true },
            { id: "skills", visible: false }
          ]
        }
      };

      mockResumeRepository.findById.mockResolvedValue(resumeWithVisibility);
      mockPdfAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      await service.execute(validCommand);

      expect(mockPdfAdapter.generateBuffer).toHaveBeenCalledWith(
        expect.objectContaining({
          sections: expect.objectContaining({
            firstName: "John",
            experience: [{ company: "ACME" }]
          })
        })
      );

      const exportedResume = mockPdfAdapter.generateBuffer.mock.calls[0][0];
      expect(exportedResume.sections.summary).toBeUndefined();
      expect(exportedResume.sections.skills).toBeUndefined();
    });

    it("should not export hidden personal and custom sections", async () => {
      const resumeWithVisibility = {
        ...mockResume,
        sections: {
          firstName: "John",
          lastName: "Doe",
          email: "john@doe.com",
          customSections: {
            publications: "Book chapter",
            volunteer: "Community mentor"
          },
          layout: { template: "basic" },
          visibleSections: [
            { id: "personal", visible: false },
            { id: "publications", visible: false },
            { id: "volunteer", visible: true }
          ]
        }
      };

      mockResumeRepository.findById.mockResolvedValue(resumeWithVisibility);
      mockDocxAdapter.generateBuffer.mockResolvedValue(mockBuffer);

      await service.execute({ ...validCommand, format: "docx" });

      const exportedResume = mockDocxAdapter.generateBuffer.mock.calls[0][0];
      expect(exportedResume.sections.firstName).toBeUndefined();
      expect(exportedResume.sections.lastName).toBeUndefined();
      expect(exportedResume.sections.email).toBeUndefined();
      expect(exportedResume.sections.customSections).toEqual({ volunteer: "Community mentor" });
    });
  });
});