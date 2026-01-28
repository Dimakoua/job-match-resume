import { describe, it, expect, vi } from 'vitest';
import { fakeTemplate } from './template_factory.js';
import { Template } from './template.js';

describe('fakeTemplate', () => {
  it('should create a template with defaults', async () => {
    const mockRepo = { save: vi.fn() };
    const template = await fakeTemplate(mockRepo, {});
    expect(template).toBeInstanceOf(Template);
    expect(template.id).toBeDefined();
    expect(template.name).toBeDefined();
    expect(Array.isArray(template.structure)).toBe(true);
    expect(template.structure).toHaveLength(3);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should create a template with provided opts', async () => {
    const mockRepo = { save: vi.fn() };
    const opts = {
      id: 'custom-template-id',
      name: 'Custom Template',
      structure: [
        { type: 'header', data: { name: '', title: '' } },
        { type: 'summary', data: { text: '' } }
      ]
    };
    const template = await fakeTemplate(mockRepo, opts);
    expect(template.id).toBe('custom-template-id');
    expect(template.name).toBe('Custom Template');
    expect(template.structure).toHaveLength(2);
    expect(template.structure[0].type).toBe('header');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should save the template if persisted is true', async () => {
    const mockRepo = { save: vi.fn().mockResolvedValue() };
    const opts = { persisted: true };
    const template = await fakeTemplate(mockRepo, opts);
    expect(template).toBeInstanceOf(Template);
    expect(mockRepo.save).toHaveBeenCalledWith(template);
  });

  it('should not save if persisted is false', async () => {
    const mockRepo = { save: vi.fn() };
    const opts = { persisted: false };
    const template = await fakeTemplate(mockRepo, opts);
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});