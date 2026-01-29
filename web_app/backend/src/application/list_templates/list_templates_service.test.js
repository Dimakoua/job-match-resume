import { describe, it, expect, vi } from 'vitest';
import { ListTemplatesService } from './list_templates_service.js';

describe('ListTemplatesService', () => {
  it('should return all available templates', async () => {
    // Arrange
    const mockTemplateRepository = {
      getAllTemplates: vi.fn().mockResolvedValue([
        { id: 'basic', name: 'Basic' },
        { id: 'modern', name: 'Modern' },
        { id: 'professional', name: 'Professional' }
      ])
    };

    const service = new ListTemplatesService(mockTemplateRepository);

    // Act
    const result = await service.execute();

    // Assert
    expect(mockTemplateRepository.getAllTemplates).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: 'basic', name: 'Basic' },
      { id: 'modern', name: 'Modern' },
      { id: 'professional', name: 'Professional' }
    ]);
  });

  it('should handle repository errors', async () => {
    // Arrange
    const mockTemplateRepository = {
      getAllTemplates: vi.fn().mockRejectedValue(new Error('Database error'))
    };

    const service = new ListTemplatesService(mockTemplateRepository);

    // Act & Assert
    await expect(service.execute()).rejects.toThrow('Database error');
  });
});