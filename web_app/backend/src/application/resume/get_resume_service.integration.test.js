import { describe, it, expect, beforeEach } from 'vitest';
import { GetResumeService } from './get_resume_service.js';
import { CreateResumeService } from './create_resume_service.js';
import { ResumeRepository } from '../../domain/resume/resume_repository.js';
import { D1ResumeRepository } from '../../adapters/repositories/resume/d1_resume_repository.js';
import { Factory } from '../../factory.js';

describe('GetResumeService Integration Tests', () => {
  let getService;
  let createService;
  let factory;
  let db;

  beforeEach(async () => {
    db = global.DB;
    const resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    createService = new CreateResumeService(resumeRepo);
    getService = new GetResumeService(resumeRepo);
    factory = new Factory(db);
  });

  describe('execute', () => {
    it('should throw error when resumeId is not provided', async () => {
      const user = await factory.insert('user');

      await expect(getService.execute(null, user.id)).rejects.toThrow('Resume ID is required');
      await expect(getService.execute(undefined, user.id)).rejects.toThrow('Resume ID is required');
      await expect(getService.execute('', user.id)).rejects.toThrow('Resume ID is required');
    });

    it('should throw error when resume is not found', async () => {
      const user = await factory.insert('user');

      await expect(getService.execute('non-existent-id', user.id)).rejects.toThrow('Resume not found');
    });

    it('should throw error when user does not own the resume', async () => {
      // Create two users
      const user1 = await factory.insert('user', { id: 'user-1', email: 'user1@example.com', name: 'User 1' });
      const user2 = await factory.insert('user', { id: 'user-2', email: 'user2@example.com', name: 'User 2' });

      // Create resume for user1
      const resume = await createService.execute({
        userId: user1.id,
        title: 'User 1 Resume',
        sections: { summary: 'Test summary' }
      });

      // Try to access it as user2
      await expect(getService.execute(resume.id, user2.id)).rejects.toThrow('Unauthorized: You do not have permission to access this resume');
    });

    it('should return resume data when user owns the resume', async () => {
      const user = await factory.insert('user', { id: 'user-test', email: 'test@example.com', name: 'Test User' });

      const sections = {
        summary: 'Professional summary',
        experience: ['Job 1', 'Job 2'],
        skills: ['JavaScript', 'React']
      };

      const createdResume = await createService.execute({
        userId: user.id,
        title: 'My Test Resume',
        sections,
        templateId: 'template-123'
      });

      const result = await getService.execute(createdResume.id, user.id);

      expect(result).toEqual({
        id: createdResume.id,
        title: 'My Test Resume',
        templateId: 'template-123',
        sections,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return resume data with null templateId', async () => {
      const user = await factory.insert('user', { id: 'user-no-template', email: 'notemplate@example.com', name: 'No Template User' });

      const sections = { summary: 'Resume without template' };

      const createdResume = await createService.execute({
        userId: user.id,
        title: 'Resume Without Template',
        sections
      });

      const result = await getService.execute(createdResume.id, user.id);

      expect(result.templateId).toBeNull();
      expect(result.title).toBe('Resume Without Template');
      expect(result.sections).toEqual(sections);
    });
  });
});