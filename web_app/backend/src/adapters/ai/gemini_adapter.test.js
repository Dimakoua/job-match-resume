import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAdapter } from './gemini_adapter.js';

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(),
}));

describe('GeminiAdapter', () => {
  let adapter;
  let mockModel;
  let mockResult;
  let mockResponse;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock response with text method
    mockResponse = {
      text: vi.fn(),
    };

    mockResult = {
      response: mockResponse,
    };

    mockModel = {
      generateContent: vi.fn().mockResolvedValue(mockResult),
    };

    // Mock the SDK constructor and methods
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockReturnValue(mockModel),
    }));

    adapter = new GeminiAdapter('test-api-key');
  });

  it('should throw error if API key is not provided', () => {
    expect(() => new GeminiAdapter()).toThrow('Gemini API key is required');
    expect(() => new GeminiAdapter('')).toThrow('Gemini API key is required');
  });

  it('should successfully generate JSON response', async () => {
    mockResponse.text = vi.fn().mockReturnValue('{"name": "John Doe", "skills": ["JavaScript", "React"]}');

    const result = await adapter.generateJSON('You are a helpful assistant', 'Generate a person profile');

    expect(result).toEqual({
      name: 'John Doe',
      skills: ['JavaScript', 'React']
    });
    expect(mockModel.generateContent).toHaveBeenCalledWith('You are a helpful assistant\n\nGenerate a person profile');
  });

  it('should handle JSON wrapped in markdown code blocks', async () => {
    mockResponse.text = vi.fn().mockReturnValue('```json\n{"title": "Developer", "experience": 5}\n```');

    const result = await adapter.generateJSON('System prompt', 'User prompt');

    expect(result).toEqual({
      title: 'Developer',
      experience: 5
    });
  });

  it('should handle API key invalid error', async () => {
    const error = new Error('API_KEY_INVALID');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Authentication failed: Invalid API key');
  });

  it('should handle permission denied error', async () => {
    const error = new Error('PERMISSION_DENIED');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Access forbidden: Check API key permissions');
  });

  it('should handle rate limit error', async () => {
    const error = new Error('RESOURCE_EXHAUSTED');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Rate limit exceeded: Too many requests');
  });

  it('should handle safety filter blocking', async () => {
    const error = new Error('SAFETY');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Content blocked by Gemini safety filters');
  });

  it('should handle service unavailable error', async () => {
    const error = new Error('SERVICE_UNAVAILABLE');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Gemini service temporarily unavailable');
  });

  it('should handle invalid JSON response', async () => {
    mockResponse.text = vi.fn().mockReturnValue('This is not valid JSON');

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Failed to parse JSON response from Gemini');
  });

  it('should handle empty response', async () => {
    mockResponse.text = vi.fn().mockReturnValue('');

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Empty response from Gemini API');
  });

  it('should handle network errors', async () => {
    const error = new TypeError('Failed to fetch');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Network error: Unable to connect to Gemini API');
  });

  it('should handle generic SDK errors', async () => {
    const error = new Error('Some unknown error occurred');
    mockModel.generateContent.mockRejectedValue(error);

    await expect(adapter.generateJSON('System', 'User')).rejects.toThrow('Gemini API error: Some unknown error occurred');
  });
});