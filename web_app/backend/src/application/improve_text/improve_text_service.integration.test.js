import { describe, it, expect, beforeEach, vi } from "vitest";
import { ImproveTextService } from "./improve_text_service.js";

// Mock the AI adapter to avoid real API calls
const mockAiAdapter = {
  generateJSON: vi.fn(),
};

describe("ImproveTextService Integration Tests", () => {
  let service;

  beforeEach(() => {
    service = new ImproveTextService(mockAiAdapter);
    vi.clearAllMocks();
  });

  it("should throw error for missing text", async () => {
    await expect(service.execute({})).rejects.toThrow('text is required and must be a non-empty string');
  });

  it("should throw error for empty text", async () => {
    await expect(service.execute({ text: "" })).rejects.toThrow('text is required and must be a non-empty string');
  });

  it("should throw error for whitespace-only text", async () => {
    await expect(service.execute({ text: "   " })).rejects.toThrow('text is required and must be a non-empty string');
  });

  it("should throw error for non-string text", async () => {
    await expect(service.execute({ text: 123 })).rejects.toThrow('text is required and must be a non-empty string');
  });

  it("should throw error for text over 10,000 characters", async () => {
    const longText = "a".repeat(10001);
    await expect(service.execute({ text: longText })).rejects.toThrow('text must be less than 10,000 characters');
  });

  it("should successfully improve text and return 3 variations", async () => {
    // Mock AI response
    const mockAiResponse = {
      variations: [
        "Led cross-functional team of 5 developers in delivering enterprise software solutions, resulting in 30% improvement in system performance.",
        "Directed development team of 5 members to deliver enterprise software solutions, achieving 30% performance enhancement.",
        "Managed 5-person development team in enterprise software delivery, improving system performance by 30%."
      ]
    };

    mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

    const command = {
      text: "I worked on a team of 5 people to make software better and improved performance by 30%"
    };

    const result = await service.execute(command);

    // Verify AI adapter was called
    expect(mockAiAdapter.generateJSON).toHaveBeenCalledTimes(1);

    // Verify result structure
    expect(result).toEqual({
      originalText: command.text,
      variations: mockAiResponse.variations
    });

    // Verify exactly 3 variations
    expect(result.variations).toHaveLength(3);
    expect(result.variations[0]).toBe(mockAiResponse.variations[0]);
    expect(result.variations[1]).toBe(mockAiResponse.variations[1]);
    expect(result.variations[2]).toBe(mockAiResponse.variations[2]);
  });

  it("should handle AI service errors gracefully", async () => {
    mockAiAdapter.generateJSON.mockRejectedValue(new Error('AI service temporarily unavailable'));

    const command = {
      text: "Test resume text to improve"
    };

    await expect(service.execute(command)).rejects.toThrow('AI service temporarily unavailable');
  });

  it("should validate AI response structure", async () => {
    // Test missing variations array
    mockAiAdapter.generateJSON.mockResolvedValue({ invalid: 'response' });

    const command = { text: "Test text" };

    await expect(service.execute(command)).rejects.toThrow('AI response must contain a variations array');
  });

  it("should validate exactly 3 variations", async () => {
    // Test wrong number of variations
    mockAiAdapter.generateJSON.mockResolvedValue({
      variations: ["Only one variation"]
    });

    const command = { text: "Test text" };

    await expect(service.execute(command)).rejects.toThrow('AI response must contain exactly 3 variations');
  });

  it("should validate variation content", async () => {
    // Test empty variation
    mockAiAdapter.generateJSON.mockResolvedValue({
      variations: [
        "Valid variation 1",
        "", // Empty string
        "Valid variation 3"
      ]
    });

    const command = { text: "Test text" };

    await expect(service.execute(command)).rejects.toThrow('Variation 2 must be a non-empty string');
  });

  it("should validate variation length", async () => {
    // Test variation too long
    const longVariation = "a".repeat(2001);
    mockAiAdapter.generateJSON.mockResolvedValue({
      variations: [
        "Valid variation 1",
        longVariation,
        "Valid variation 3"
      ]
    });

    const command = { text: "Test text" };

    await expect(service.execute(command)).rejects.toThrow('Variation 2 must be less than 2,000 characters');
  });

  it("should handle various text types", async () => {
    const mockAiResponse = {
      variations: [
        "Enhanced professional summary highlighting leadership skills.",
        "Improved resume summary emphasizing management experience.",
        "Polished professional statement focusing on achievements."
      ]
    };

    mockAiAdapter.generateJSON.mockResolvedValue(mockAiResponse);

    const testCases = [
      "worked as a manager",
      "I am a software engineer with 5 years experience",
      "• Bullet point 1\n• Bullet point 2\n• Bullet point 3",
      "Responsible for team leadership and project management in fast-paced environment."
    ];

    for (const testText of testCases) {
      const result = await service.execute({ text: testText });
      expect(result.originalText).toBe(testText);
      expect(result.variations).toHaveLength(3);
    }

    // Verify AI was called for each test case
    expect(mockAiAdapter.generateJSON).toHaveBeenCalledTimes(testCases.length);
  });
});