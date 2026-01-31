import { describe, it, expect, vi } from 'vitest';
import { UpdateResumeService } from './update_resume_service.js';

describe('UpdateResumeService', () => {
  const mockResumeRepository = {
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn()
  };

  const mockTemplateRepository = {
    getSections: vi.fn()
  };

  const service = new UpdateResumeService(mockResumeRepository, mockTemplateRepository);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update resume template successfully', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: 'professional'
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'user-123',
      title: 'My Resume',
      templateId: null,
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockResumeRepository.findById.mockResolvedValue(mockResume);
    mockTemplateRepository.getSections.mockResolvedValue([{ type: 'contact', data: {} }]);
    mockResumeRepository.update.mockResolvedValue(mockResume);

    // Act
    const result = await service.execute(command);

    // Assert
    expect(mockResumeRepository.findById).toHaveBeenCalledWith('resume-123');
    expect(mockTemplateRepository.getSections).toHaveBeenCalledWith('professional');
    expect(mockResumeRepository.update).toHaveBeenCalledWith(mockResume);
    expect(result.templateId).toBe('professional');
  });

  it('should update resume title and sections successfully', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      title: 'New Title',
      sections: { firstName: 'Updated' }
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'user-123',
      title: 'Old Title',
      templateId: null,
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockResumeRepository.findById.mockResolvedValue(mockResume);
    mockResumeRepository.update.mockResolvedValue(mockResume);

    // Act
    const result = await service.execute(command);

    // Assert
    expect(mockResumeRepository.update).toHaveBeenCalledWith(mockResume);
    expect(result.title).toBe('New Title');
    expect(result.sections).toEqual({ firstName: 'Updated' });
  });

  it('should allow setting templateId to null', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: null
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'user-123',
      title: 'My Resume',
      templateId: 'basic',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockResumeRepository.findById.mockResolvedValue(mockResume);
    mockResumeRepository.update.mockResolvedValue(mockResume);

    // Act
    const result = await service.execute(command);

    // Assert
    expect(mockTemplateRepository.getSections).not.toHaveBeenCalled();
    expect(result.templateId).toBe(null);
  });

  it('should throw error if resumeId is missing', async () => {
    // Arrange
    const command = {
      userId: 'user-123',
      templateId: 'professional'
    };

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('resumeId is required');
  });

  it('should throw error if userId is missing', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      templateId: 'professional'
    };

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('userId is required');
  });

  it('should throw error if resume not found', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: 'professional'
    };

    mockResumeRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Resume not found');
  });

  it('should throw error if user does not own resume', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: 'professional'
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'different-user',
      title: 'My Resume',
      templateId: null,
      sections: []
    };

    mockResumeRepository.findById.mockResolvedValue(mockResume);

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Access denied');
  });

  it('should throw error if template does not exist', async () => {
    // Arrange
    const command = {
      resumeId: 'resume-123',
      userId: 'user-123',
      templateId: 'nonexistent'
    };

    const mockResume = {
      id: 'resume-123',
      userId: 'user-123',
      title: 'My Resume',
      templateId: null,
      sections: []
    };

    mockResumeRepository.findById.mockResolvedValue(mockResume);
    mockTemplateRepository.getSections.mockResolvedValue([]); // Empty array means template not found

    // Act & Assert
    await expect(service.execute(command)).rejects.toThrow('Invalid template ID');
  });
});