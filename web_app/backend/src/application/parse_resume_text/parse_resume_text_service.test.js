import { ParseResumeTextService } from './parse_resume_text_service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ParseResumeTextService', () => {
  let mockAiAdapter;
  let service;

  beforeEach(() => {
    mockAiAdapter = {
      generateJSON: vi.fn()
    };
    service = new ParseResumeTextService(mockAiAdapter);
  });

  describe('execute', () => {
    it('should parse resume text successfully', async () => {
      const mockResponse = {
        firstName: 'John',
        lastName: 'Doe',
        title: 'Software Engineer',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        summary: 'Experienced software engineer...',
        experience: [
          {
            company: 'Tech Corp',
            title: 'Senior Developer',
            startDate: 'Jan 2020',
            endDate: 'Present',
            description: 'Led development of...'
          }
        ],
        education: [
          {
            institution: 'University of Tech',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2016',
            endDate: '2020'
          }
        ],
        skills: ['JavaScript', 'React', 'Node.js'],
        certifications: [],
        projects: []
      };

      mockAiAdapter.generateJSON.mockResolvedValue(mockResponse);

      const result = await service.execute({
        text: 'John Doe\nSoftware Engineer\n...',
        userId: 'user123'
      });

      expect(result).toEqual(mockResponse);
      expect(mockAiAdapter.generateJSON).toHaveBeenCalledWith(
        expect.stringContaining('You are an expert at parsing resume text'),
        expect.stringContaining('John Doe\nSoftware Engineer\n...')
      );
    });

    it('should validate input text', async () => {
      await expect(service.execute({ text: '', userId: 'user123' }))
        .rejects.toThrow('text is required and must be a non-empty string');

      await expect(service.execute({ text: '   ', userId: 'user123' }))
        .rejects.toThrow('text is required and must be a non-empty string');
    });

    it('should validate text length', async () => {
      const longText = 'a'.repeat(50001);
      await expect(service.execute({ text: longText, userId: 'user123' }))
        .rejects.toThrow('text must be less than 50,000 characters');
    });

    it('should handle AI adapter errors', async () => {
      mockAiAdapter.generateJSON.mockRejectedValue(new Error('AI service error'));

      await expect(service.execute({
        text: 'Valid resume text',
        userId: 'user123'
      })).rejects.toThrow('AI service error');
    });
  });

  describe('_validateAndTransformResponse', () => {
    it('should validate and transform AI response', () => {
      const aiResponse = {
        firstName: 'John',
        lastName: 'Doe',
        experience: [
          { company: 'Test Corp', title: 'Developer' } // Missing fields
        ],
        education: [],
        skills: ['JS'],
        certifications: [],
        projects: []
      };

      const result = service._validateAndTransformResponse(aiResponse);

      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.experience[0]).toEqual({
        company: 'Test Corp',
        title: 'Developer',
        startDate: '',
        endDate: '',
        description: ''
      });
      expect(result.skills).toEqual(['JS']);
    });

    it('should provide defaults for missing fields', () => {
      const aiResponse = {};

      const result = service._validateAndTransformResponse(aiResponse);

      expect(result.firstName).toBe('');
      expect(result.experience).toEqual([]);
      expect(result.education).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.certifications).toEqual([]);
      expect(result.projects).toEqual([]);
    });
  });
});