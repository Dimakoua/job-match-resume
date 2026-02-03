// application/calculate_ats_score/calculate_ats_score_service.test.js
import { describe, it, expect } from 'vitest';
import { CalculateAtsScoreService } from './calculate_ats_score_service.js';

describe('CalculateAtsScoreService', () => {
  let service;

  beforeEach(() => {
    service = new CalculateAtsScoreService();
  });

  describe('execute', () => {
    it('should calculate ATS score for matching keywords', async () => {
      const command = {
        resumeText: 'I have experience with JavaScript, React, and Node.js development.',
        jobDescription: 'We are looking for a developer with JavaScript, React, and Python skills.'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(40); // 2 out of 5 keywords match (javascript, react)
      expect(result.matchedKeywords).toEqual(['javascript', 'react']);
      expect(result.totalKeywords).toBe(5); // developer, javascript, react, python, skills
    });

    it('should return 100 for perfect match', async () => {
      const command = {
        resumeText: 'I am a software engineer with JavaScript, React, and Node.js experience.',
        jobDescription: 'JavaScript React Node.js'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(100);
      expect(result.matchedKeywords).toEqual(['javascript', 'react', 'node']);
      expect(result.totalKeywords).toBe(3);
    });

    it('should return 0 for no matches', async () => {
      const command = {
        resumeText: 'I am a chef with cooking experience.',
        jobDescription: 'JavaScript React Node.js'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(0);
      expect(result.matchedKeywords).toEqual([]);
      expect(result.totalKeywords).toBe(3);
    });

    it('should handle case insensitive matching', async () => {
      const command = {
        resumeText: 'I know JAVASCRIPT and react.',
        jobDescription: 'JavaScript REACT Python'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(67); // 2 out of 3 match
      expect(result.matchedKeywords).toEqual(['javascript', 'react']);
    });

    it('should filter out stop words and short words', async () => {
      const command = {
        resumeText: 'I am a developer.',
        jobDescription: 'I am looking for a developer with skills in the field.'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(50); // 'developer' matches, 1 out of 2 keywords ('developer', 'skills')
      expect(result.matchedKeywords).toEqual(['developer']);
      expect(result.totalKeywords).toBe(2); // 'developer' and 'skills' (field is too short and not technical)
    });

    it('should filter out numbers-only keywords', async () => {
      const command = {
        resumeText: 'I have 5 years experience.',
        jobDescription: 'Looking for someone with 5 years experience.'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(50); // 'experience' matches, 1 out of 2 keywords
      expect(result.matchedKeywords).toEqual(['experience']);
      expect(result.totalKeywords).toBe(2); // 'someone' and 'experience' are valid keywords
    });

    it('should throw error for missing resumeText', async () => {
      const command = {
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it('should throw error for empty resumeText', async () => {
      const command = {
        resumeText: '',
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow('resumeText is required and must be a non-empty string');
    });

    it('should throw error for missing jobDescription', async () => {
      const command = {
        resumeText: 'I am a developer.'
      };

      await expect(service.execute(command)).rejects.toThrow('jobDescription is required and must be a non-empty string');
    });

    it('should throw error for resumeText too long', async () => {
      const longText = 'a'.repeat(50001);
      const command = {
        resumeText: longText,
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow('resumeText must be less than 50,000 characters');
    });

    it('should throw error for jobDescription too long', async () => {
      const longText = 'a'.repeat(50001);
      const command = {
        resumeText: 'I am a developer.',
        jobDescription: longText
      };

      await expect(service.execute(command)).rejects.toThrow('jobDescription must be less than 50,000 characters');
    });
  });

  describe('_extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const text = 'We are looking for a JavaScript developer with React experience.';
      const keywords = service._extractKeywords(text);

      expect(keywords).toContain('javascript');
      expect(keywords).toContain('developer');
      expect(keywords).toContain('react');
      expect(keywords).toContain('experience');
      expect(keywords).not.toContain('we');
      expect(keywords).not.toContain('are');
      expect(keywords).not.toContain('for');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('with');
    });

    it('should remove duplicates', () => {
      const text = 'JavaScript JavaScript React React';
      const keywords = service._extractKeywords(text);

      expect(keywords).toEqual(['javascript', 'react']);
    });
  });

  describe('_containsKeyword', () => {
    it('should find exact word matches', () => {
      expect(service._containsKeyword('I know JavaScript', 'javascript')).toBe(true);
      expect(service._containsKeyword('I know JavaScript', 'python')).toBe(false);
    });

    it('should match word boundaries', () => {
      expect(service._containsKeyword('JavaScript is great', 'script')).toBe(false);
      expect(service._containsKeyword('JavaScript is great', 'javascript')).toBe(true);
    });
  });
});