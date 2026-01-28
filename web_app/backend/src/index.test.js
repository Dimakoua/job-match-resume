import { describe, it, expect } from 'vitest';
import app from './index.js';

describe('Hello World', () => {
  it('should return Hello World', async () => {
    const res = await app.request('http://localhost/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello World from Resume Builder Backend!');
  });
});