import { describe, it, expect } from 'vitest';
import { query, execute } from './database.js';

describe('Database Helper Integration Tests', () => {
  const db = global.DB;

  it('should execute a simple SELECT query', async () => {
    if (!db) return; // Skip if DB not available in test environment
    const result = await query(db, 'SELECT 1 as test_value');
    expect(result.results).toBeDefined();
    expect(result.results[0].test_value).toBe(1);
  });

  it('should handle parameterized queries', async () => {
    if (!db) return;
    const result = await query(db, 'SELECT ? as param', [42]);
    expect(result.results[0].param).toBe(42);
  });

  it('should throw wrapped error on invalid SQL', async () => {
    if (!db) return;
    await expect(query(db, 'INVALID SQL')).rejects.toThrow('Database query failed');
  });
});