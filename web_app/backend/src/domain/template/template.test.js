import { describe, it, expect } from 'vitest';
import { Template } from './template.js';

describe('Template Entity', () => {
  const validStructure = [
    { id: 'personal', name: 'Personal Information', required: true },
    { id: 'experience', name: 'Work Experience', required: true }
  ];

  it('should create a template with valid data', () => {
    const template = new Template('basic', 'Basic Template', validStructure);
    expect(template.id).toBe('basic');
    expect(template.name).toBe('Basic Template');
    expect(template.structure).toEqual(validStructure);
  });

  it('should throw for invalid id - empty string', () => {
    expect(() => new Template('', 'Basic Template', validStructure)).toThrow('Template ID must be a non-empty string');
  });

  it('should throw for invalid id - non-string', () => {
    expect(() => new Template(123, 'Basic Template', validStructure)).toThrow('Template ID must be a non-empty string');
  });

  it('should throw for invalid id - null', () => {
    expect(() => new Template(null, 'Basic Template', validStructure)).toThrow('Template ID must be a non-empty string');
  });

  it('should throw for invalid name - empty string', () => {
    expect(() => new Template('basic', '', validStructure)).toThrow('Template name must be a non-empty string');
  });

  it('should throw for invalid name - non-string', () => {
    expect(() => new Template('basic', 123, validStructure)).toThrow('Template name must be a non-empty string');
  });

  it('should throw for invalid name - null', () => {
    expect(() => new Template('basic', null, validStructure)).toThrow('Template name must be a non-empty string');
  });

  it('should throw for invalid structure - non-array', () => {
    expect(() => new Template('basic', 'Basic Template', 'not an array')).toThrow('Template structure must be an array');
  });

  it('should throw for invalid structure - null', () => {
    expect(() => new Template('basic', 'Basic Template', null)).toThrow('Template structure must be an array');
  });

  it('should throw for invalid structure - undefined', () => {
    expect(() => new Template('basic', 'Basic Template', undefined)).toThrow('Template structure must be an array');
  });
});