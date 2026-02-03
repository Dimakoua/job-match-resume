import { describe, it, expect } from 'vitest';
import { JobSearchList } from './job_search_list.js';

describe('JobSearchList Entity', () => {
  it('should create a job search list with description', () => {
    const list = new JobSearchList('1', 'user1', 'My List', 'Description');
    expect(list.id).toBe('1');
    expect(list.userId).toBe('user1');
    expect(list.name).toBe('My List');
    expect(list.description).toBe('Description');
  });

  it('should create a job search list without description', () => {
    const list = new JobSearchList('1', 'user1', 'My List');
    expect(list.description).toBe(null);
  });

  it('should throw for invalid id', () => {
    expect(() => new JobSearchList('', 'user1', 'My List')).toThrow();
  });

  it('should throw for invalid userId', () => {
    expect(() => new JobSearchList('1', '', 'My List')).toThrow();
  });

  it('should throw for invalid name', () => {
    expect(() => new JobSearchList('1', 'user1', '')).toThrow();
    expect(() => new JobSearchList('1', 'user1', 'a'.repeat(101))).toThrow();
  });

  it('should throw for invalid description', () => {
    expect(() => new JobSearchList('1', 'user1', 'My List', 123)).toThrow();
    expect(() => new JobSearchList('1', 'user1', 'My List', 'a'.repeat(501))).toThrow();
  });

  it('should update name successfully', () => {
    const list = new JobSearchList('1', 'user1', 'Old Name');
    list.updateName('New Name');
    expect(list.name).toBe('New Name');
  });

  it('should throw for invalid name update', () => {
    const list = new JobSearchList('1', 'user1', 'Old Name');
    expect(() => list.updateName('')).toThrow();
    expect(list.name).toBe('Old Name'); // should not change
  });

  it('should update description successfully', () => {
    const list = new JobSearchList('1', 'user1', 'My List', 'Old Desc');
    list.updateDescription('New Desc');
    expect(list.description).toBe('New Desc');
  });

  it('should update description to null', () => {
    const list = new JobSearchList('1', 'user1', 'My List', 'Desc');
    list.updateDescription(null);
    expect(list.description).toBe(null);
  });

  it('should throw for invalid description update', () => {
    const list = new JobSearchList('1', 'user1', 'My List', 'Old Desc');
    expect(() => list.updateDescription(123)).toThrow();
    expect(list.description).toBe('Old Desc'); // should not change
  });
});