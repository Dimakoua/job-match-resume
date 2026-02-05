import { describe, it, expect, beforeEach, vi } from "vitest";
import { GenerateSuggestionsService } from "./generate_suggestions_service.js";

// Mock the AI adapter to avoid real API calls
const mockAiAdapter = {
  generateJSON: vi.fn(),
};

describe("GenerateSuggestionsService Integration Tests", () => {
  let service;

  beforeEach(() => {
    service = new GenerateSuggestionsService(mockAiAdapter);
    vi.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should throw error for missing jobDescription", async () => {
      await expect(service.execute({ resumeText: "test resume" })).rejects.toThrow('jobDescription is required and must be a non-empty string');
    });

    it("should throw error for empty jobDescription", async () => {
      await expect(service.execute({ jobDescription: "", resumeText: "test resume" })).rejects.toThrow('jobDescription is required and must be a non-empty string');
    });

    it("should throw error for whitespace-only jobDescription", async () => {
      await expect(service.execute({ jobDescription: "   ", resumeText: "test resume" })).rejects.toThrow('jobDescription is required and must be a non-empty string');
    });

    it("should throw error for non-string jobDescription", async () => {
      await expect(service.execute({ jobDescription: 123, resumeText: "test resume" })).rejects.toThrow('jobDescription is required and must be a non-empty string');
    });

    it("should throw error for missing resumeText", async () => {
      await expect(service.execute({ jobDescription: "test job" })).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it("should throw error for empty resumeText", async () => {
      await expect(service.execute({ jobDescription: "test job", resumeText: "" })).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it("should throw error for whitespace-only resumeText", async () => {
      await expect(service.execute({ jobDescription: "test job", resumeText: "   " })).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it("should throw error for non-string resumeText", async () => {
      await expect(service.execute({ jobDescription: "test job", resumeText: 456 })).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it("should throw error for jobDescription over 10,000 characters", async () => {
      const longJobDesc = "a".repeat(10001);
      await expect(service.execute({ jobDescription: longJobDesc, resumeText: "test resume" })).rejects.toThrow('jobDescription must be less than 10,000 characters');
    });

    it("should throw error for resumeText over 10,000 characters", async () => {
      const longResume = "a".repeat(10001);
      await expect(service.execute({ jobDescription: "test job", resumeText: longResume })).rejects.toThrow('resumeText must be less than 10,000 characters');
    });
  });

  describe("Successful Execution", () => {
    it("should successfully generate suggestions and return filtered results", async () => {
      // Mock AI response with valid suggestions
      const mockAiResponse = {
        suggestions: [
          {
            category: "keywords",
            text: "Add these specific keywords to your resume: JavaScript, React, Node.js"
          },
          {
            category: "summary",
            text: "Strengthen your professional summary by highlighting your technical expertise"
          },
          {
            category: "experience",
            text: "Quantify your achievements with specific metrics and results"
          },
          {
            category: "skills",
            text: "Add relevant technical skills like Docker and AWS"
          },
          {
            category: "education",
            text: "Include relevant coursework or certifications"
          },
          {
            category: "quantify",
            text: "Add measurable achievements to your experience descriptions"
          },
          {
            category: "ats",
            text: "Use standard section headings that ATS systems can recognize"
          },
          {
            category: "impact",
            text: "Focus on the business impact of your work"
          }
        ]
      };

      mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

      const command = {
        jobDescription: "We are looking for a JavaScript developer with React experience...",
        resumeText: "I am a software developer with experience in web development..."
      };

      const result = await service.execute(command);

      // Verify AI adapter was called
      expect(mockAiAdapter.generateJSON).toHaveBeenCalledTimes(1);
      expect(mockAiAdapter.generateJSON).toHaveBeenCalledWith(
        expect.stringContaining("You are an expert resume consultant"),
        expect.stringContaining("JOB DESCRIPTION:")
      );

      // Verify result structure
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(8);

      // Verify each suggestion has correct structure
      result.forEach(suggestion => {
        expect(suggestion).toHaveProperty('category');
        expect(suggestion).toHaveProperty('text');
        expect(typeof suggestion.category).toBe('string');
        expect(typeof suggestion.text).toBe('string');
        expect(suggestion.text.trim().length).toBeGreaterThan(0);
      });

      // Verify categories are valid
      const validCategories = ['keywords', 'summary', 'experience', 'skills', 'education', 'quantify', 'ats', 'impact'];
      result.forEach(suggestion => {
        expect(validCategories).toContain(suggestion.category);
      });
    });

    it("should limit suggestions to 8 even if AI returns more", async () => {
      const mockSuggestions = Array.from({ length: 12 }, (_, i) => ({
        category: "keywords",
        text: `Suggestion ${i + 1}`
      }));

      mockAiAdapter.generateJSON.mockResolvedValue({
        suggestions: mockSuggestions
      });

      const result = await service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      });

      expect(result).toHaveLength(8);
    });

    it("should filter out invalid suggestions", async () => {
      const mockAiResponse = {
        suggestions: [
          {
            category: "keywords",
            text: "Valid suggestion"
          },
          {
            category: "invalid_category",
            text: "Invalid category"
          },
          {
            category: "summary",
            text: "" // Empty text
          },
          {
            category: "experience",
            text: "Another valid suggestion"
          },
          null, // Invalid object
          {
            category: "skills",
            text: "   " // Whitespace only
          }
        ]
      };

      mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

      const result = await service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      });

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('keywords');
      expect(result[0].text).toBe('Valid suggestion');
      expect(result[1].category).toBe('experience');
      expect(result[1].text).toBe('Another valid suggestion');
    });

    it("should trim whitespace from suggestion text", async () => {
      const mockAiResponse = {
        suggestions: [
          {
            category: "keywords",
            text: "  Add these keywords  "
          }
        ]
      };

      mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

      const result = await service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      });

      expect(result[0].text).toBe('Add these keywords');
    });

    it("should convert category to lowercase", async () => {
      const mockAiResponse = {
        suggestions: [
          {
            category: "KEYWORDS",
            text: "Add keywords"
          }
        ]
      };

      mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

      const result = await service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      });

      expect(result[0].category).toBe('keywords');
    });
  });

  describe("AI Response Validation", () => {
    it("should throw error for invalid AI response format", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue("invalid response");

      await expect(service.execute({
        jobDescription: "test",
        resumeText: "test"
      })).rejects.toThrow('Invalid AI response format');
    });

    it("should throw error for missing suggestions array", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue({ invalid: 'response' });

      await expect(service.execute({
        jobDescription: "test",
        resumeText: "test"
      })).rejects.toThrow('AI response must contain a suggestions array');
    });

    it("should throw error for non-array suggestions", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue({ suggestions: "not an array" });

      await expect(service.execute({
        jobDescription: "test",
        resumeText: "test"
      })).rejects.toThrow('AI response must contain a suggestions array');
    });

    it("should throw error when no valid suggestions remain after filtering", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue({
        suggestions: [
          { category: "invalid", text: "invalid" },
          { category: "keywords", text: "" },
          null
        ]
      });

      await expect(service.execute({
        jobDescription: "test",
        resumeText: "test"
      })).rejects.toThrow('No valid suggestions generated');
    });
  });

  describe("Error Handling", () => {
    it("should handle AI service errors gracefully", async () => {
      mockAiAdapter.generateJSON.mockRejectedValue(new Error('AI service temporarily unavailable'));

      await expect(service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      })).rejects.toThrow('AI service temporarily unavailable');
    });

    it("should handle malformed suggestion objects", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue({
        suggestions: [
          "string instead of object",
          { category: "keywords" }, // Missing text
          { text: "missing category" },
          { category: null, text: "null category" },
          { category: "keywords", text: "valid suggestion" }
        ]
      });

      const result = await service.execute({
        jobDescription: "test job",
        resumeText: "test resume"
      });

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('valid suggestion');
    });
  });

  describe("Prompt Construction", () => {
    it("should construct correct system and user prompts", async () => {
      mockAiAdapter.generateJSON.mockResolvedValue({
        suggestions: [{
          category: "keywords",
          text: "Add keywords"
        }]
      });

      const jobDescription = "Senior Developer position requiring React and Node.js";
      const resumeText = "Software developer with JavaScript experience";

      await service.execute({
        jobDescription,
        resumeText
      });

      expect(mockAiAdapter.generateJSON).toHaveBeenCalledWith(
        expect.stringContaining("You are an expert resume consultant"),
        expect.stringContaining(`JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT RESUME:\n${resumeText}`)
      );
    });
  });
});