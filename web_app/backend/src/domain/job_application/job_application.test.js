import { describe, it, expect } from 'vitest';
import { JobApplication } from './job_application.js';

describe('JobApplication Domain Entity', () => {
  describe('constructor', () => {
    it('should create a valid job application', () => {
      const app = new JobApplication(
        'app-123',
        'user-456',
        'list-789',
        'resume-101',
        'Tech Corp',
        'Senior Developer',
        'We are looking for a senior developer...',
        'applied',
        new Date('2024-01-15'),
        'Excited about this opportunity!'
      );

      expect(app.id).toBe('app-123');
      expect(app.userId).toBe('user-456');
      expect(app.jobSearchListId).toBe('list-789');
      expect(app.resumeId).toBe('resume-101');
      expect(app.company).toBe('Tech Corp');
      expect(app.position).toBe('Senior Developer');
      expect(app.jobDescription).toBe('We are looking for a senior developer...');
      expect(app.status).toBe('applied');
      expect(app.appliedDate).toEqual(new Date('2024-01-15'));
      expect(app.notes).toBe('Excited about this opportunity!');
    });

    it('should create with default values', () => {
      const app = new JobApplication(
        'app-123',
        'user-456',
        null,
        'resume-101',
        'Tech Corp',
        'Developer',
        'Job description here'
      );

      expect(app.status).toBe('saved');
      expect(app.appliedDate).toBeNull();
      expect(app.notes).toBeNull();
    });

    it('should trim string fields', () => {
      const app = new JobApplication(
        'app-123',
        'user-456',
        null,
        'resume-101',
        '  Tech Corp  ',
        '  Developer  ',
        '  Job desc  '
      );

      expect(app.company).toBe('Tech Corp');
      expect(app.position).toBe('Developer');
      expect(app.jobDescription).toBe('Job desc');
    });
  });

  describe('validation', () => {
    it('should throw error for invalid id', () => {
      expect(() => new JobApplication(null, 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc')).toThrow('JobApplication ID must be a non-empty string');
      expect(() => new JobApplication('', 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc')).toThrow('JobApplication ID must be a non-empty string');
    });

    it('should throw error for invalid userId', () => {
      expect(() => new JobApplication('app-123', null, null, 'resume-101', 'Company', 'Position', 'Desc')).toThrow('User ID must be a non-empty string');
    });

    it('should throw error for invalid resumeId', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, null, 'Company', 'Position', 'Desc')).toThrow('Resume ID must be a non-empty string');
    });

    it('should throw error for invalid company', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', '', 'Position', 'Desc')).toThrow('Company cannot be empty');
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'a'.repeat(101), 'Position', 'Desc')).toThrow('Company must be 100 characters or less');
    });

    it('should throw error for invalid position', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', '', 'Desc')).toThrow('Position cannot be empty');
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'a'.repeat(101), 'Desc')).toThrow('Position must be 100 characters or less');
    });

    it('should throw error for invalid job description', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', '')).toThrow('Job description cannot be empty');
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', 'a'.repeat(10001))).toThrow('Job description must be 10000 characters or less');
    });

    it('should throw error for invalid status', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc', 'invalid')).toThrow('Status must be one of: saved, applied, interviewing, rejected, accepted, withdrawn');
    });

    it('should throw error for invalid applied date', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc', 'saved', 'invalid')).toThrow('Applied date must be a Date object or null');
    });

    it('should throw error for invalid notes', () => {
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc', 'saved', null, 123)).toThrow('Notes must be a string or null');
      expect(() => new JobApplication('app-123', 'user-456', null, 'resume-101', 'Company', 'Position', 'Desc', 'saved', null, 'a'.repeat(2001))).toThrow('Notes must be 2000 characters or less');
    });
  });

  describe('update methods', () => {
    let app;

    beforeEach(() => {
      app = new JobApplication(
        'app-123',
        'user-456',
        null,
        'resume-101',
        'Tech Corp',
        'Developer',
        'Job description'
      );
    });

    it('should update status', () => {
      app.updateStatus('applied');
      expect(app.status).toBe('applied');
    });

    it('should update applied date', () => {
      const date = new Date();
      app.updateAppliedDate(date);
      expect(app.appliedDate).toBe(date);
    });

    it('should update notes', () => {
      app.updateNotes('New notes');
      expect(app.notes).toBe('New notes');
    });

    it('should update job search list', () => {
      app.updateJobSearchList('list-789');
      expect(app.jobSearchListId).toBe('list-789');
    });

    it('should validate updates', () => {
      expect(() => app.updateStatus('invalid')).toThrow();
      expect(() => app.updateNotes('a'.repeat(2001))).toThrow();
    });
  });
});