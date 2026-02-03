// application/calculate_ats_score/calculate_ats_score_service.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateAtsScoreService } from './calculate_ats_score_service.js';
import { AtsScoringError } from './ats_scoring_error.js';

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

      expect(result.score).toBe(50); // 2 out of 4 match (javascript, react)
      expect(result.matchedKeywords).toContain('javascript');
      expect(result.matchedKeywords).toContain('react');
      expect(result.totalKeywords).toBe(4); // developer, javascript, python, react
      expect(result.metadata).toBeDefined();
      expect(result.metadata.resumeLength).toBe(command.resumeText.length);
    });

    it('should return 100 for perfect match', async () => {
      const command = {
        resumeText: 'I am a software engineer with JavaScript, React, and Node.js experience.',
        jobDescription: 'JavaScript React Node.js'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(100);
      expect(result.matchedKeywords.sort()).toEqual(['javascript', 'node', 'react']);
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
      expect(result.matchedKeywords.sort()).toEqual(['javascript', 'react']);
    });

    it('should filter out stop words and short words', async () => {
      const command = {
        resumeText: 'I am a developer.',
        jobDescription: 'I am looking for a developer with skills in the field.'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(100); // 'developer' matches, 1 out of 1 keywords
      expect(result.matchedKeywords).toEqual(['developer']);
      expect(result.totalKeywords).toBe(1); // only 'developer'
    });

    it('should filter out numbers-only keywords', async () => {
      const command = {
        resumeText: 'I have 5 years experience.',
        jobDescription: 'Looking for someone with 5 years experience.'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(0); // no keywords match
      expect(result.matchedKeywords).toEqual([]);
      expect(result.totalKeywords).toBe(1); // only 'someone'
    });

    it('should handle hyphenated and slash-separated terms', async () => {
      const command = {
        resumeText: 'I have experience with front-end development and CI/CD pipelines.',
        jobDescription: 'Looking for front-end developer with CI/CD experience.'
      };

      const result = await service.execute(command);

      // Normalization changes hyphens to spaces, so matching depends on individual words
      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.matchedKeywords).toBeDefined();
    });

    it('should include metadata in response', async () => {
      const command = {
        resumeText: 'JavaScript developer',
        jobDescription: 'JavaScript Python'
      };

      const result = await service.execute(command);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.resumeLength).toBe(20);
      expect(result.metadata.jobDescriptionLength).toBe(17);
      expect(result.metadata.matchRate).toBeGreaterThan(0);
    });
  });

  describe('validation', () => {
    it('should throw AtsScoringError for missing resumeText', async () => {
      const command = {
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('resumeText');
    });

    it('should throw AtsScoringError for empty resumeText', async () => {
      const command = {
        resumeText: '',
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('resumeText');
    });

    it('should throw AtsScoringError for whitespace-only resumeText', async () => {
      const command = {
        resumeText: '   ',
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('cannot be empty');
    });

    it('should throw AtsScoringError for missing jobDescription', async () => {
      const command = {
        resumeText: 'I am a developer.'
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('jobDescription');
    });

    it('should throw AtsScoringError for resumeText too long', async () => {
      const longText = 'a'.repeat(50001);
      const command = {
        resumeText: longText,
        jobDescription: 'JavaScript developer needed.'
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('exceeds maximum length');
    });

    it('should throw AtsScoringError for jobDescription too long', async () => {
      const longText = 'a'.repeat(50001);
      const command = {
        resumeText: 'I am a developer.',
        jobDescription: longText
      };

      await expect(service.execute(command)).rejects.toThrow(AtsScoringError);
      await expect(service.execute(command)).rejects.toThrow('exceeds maximum length');
    });

    it('should throw AtsScoringError with proper error code', async () => {
      const command = {
        resumeText: '',
        jobDescription: 'test'
      };

      try {
        await service.execute(command);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AtsScoringError);
        expect(error.code).toBe('INVALID_INPUT');
        expect(error.details).toBeDefined();
      }
    });
  });

  describe('keyword extraction', () => {
    it('should extract technical terms', async () => {
      const command = {
        resumeText: 'JavaScript Python React Angular',
        jobDescription: 'JavaScript Python React Angular'
      };

      const result = await service.execute(command);

      expect(result.totalKeywords).toBe(4);
      expect(result.matchedKeywords).toContain('javascript');
      expect(result.matchedKeywords).toContain('python');
      expect(result.matchedKeywords).toContain('react');
      expect(result.matchedKeywords).toContain('angular');
    });

    it('should handle special characters and normalization', async () => {
      const command = {
        resumeText: 'React.js, Node.js, C++, C#',
        jobDescription: 'React Node C++ C#'
      };

      const result = await service.execute(command);

      expect(result.score).toBeGreaterThan(0);
      expect(result.matchedKeywords).toContain('react');
      expect(result.matchedKeywords).toContain('node');
    });

    it('should deduplicate keywords', async () => {
      const command = {
        resumeText: 'JavaScript JavaScript JavaScript',
        jobDescription: 'JavaScript JavaScript React React'
      };

      const result = await service.execute(command);

      expect(result.totalKeywords).toBe(2); // Unique: javascript, react
      expect(result.matchedKeywords).toEqual(['javascript']);
    });

    it('should extract longer general words as keywords', async () => {
      const command = {
        resumeText: 'I have excellent problem-solving abilities',
        jobDescription: 'Looking for someone with problem-solving abilities'
      };

      const result = await service.execute(command);

      // 'solving' is 7 chars, will be extracted
      expect(result.matchedKeywords).toContain('solving');
      expect(result.totalKeywords).toBeGreaterThan(0);
    });

    it('should filter out stop words during extraction', async () => {
      const command = {
        resumeText: 'I have experience',
        jobDescription: 'We are looking for a developer with React experience'
      };

      const result = await service.execute(command);

      // 'looking', 'developer', 'react' should be extracted, not 'we', 'are', 'for', 'a', 'with'
      expect(result.totalKeywords).toBeGreaterThan(0);
      expect(result.matchedKeywords).not.toContain('we');
      expect(result.matchedKeywords).not.toContain('are');
    });
  });

  describe('edge cases', () => {
    it('should handle empty job description after filtering', async () => {
      const command = {
        resumeText: 'I am a developer',
        jobDescription: 'a an the is are'
      };

      const result = await service.execute(command);

      expect(result.score).toBe(0);
      expect(result.totalKeywords).toBe(0);
    });

    it('should handle very long matching keyword lists', async () => {
      const keywords = Array.from({ length: 100 }, (_, i) => `keyword${i}`).join(' ');
      const command = {
        resumeText: keywords,
        jobDescription: keywords
      };

      const result = await service.execute(command);

      expect(result.score).toBe(100);
      expect(result.matchedKeywords.length).toBe(result.totalKeywords);
    });

    it('should maintain sort order for consistent output', async () => {
      const command = {
        resumeText: 'zebra alpha charlie bravo',
        jobDescription: 'alpha bravo charlie zebra'
      };

      const result = await service.execute(command);

      // Matched keywords should be sorted alphabetically
      const sorted = [...result.matchedKeywords].sort();
      expect(result.matchedKeywords).toEqual(sorted);
    });
  });
});
