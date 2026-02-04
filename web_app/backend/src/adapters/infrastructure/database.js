/**
 * Database helper for D1 queries
 * Provides a simple wrapper around D1 prepare/bind/execute
 */

import { logger } from '../../utils/logger.js';

/**
 * Executes a raw SQL query against the D1 database
 * @param {D1Database} db - The D1 database instance
 * @param {string} sql - The SQL query string
 * @param {Array} params - Array of parameters to bind
 * @returns {Promise<Object>} - Result object with results array
 */
export async function query(db, sql, params = []) {
  try {
    logger.debug('Database query executed', { sql, paramsCount: params.length });
    const stmt = db.prepare(sql);
    let boundStmt = stmt;
    if (params.length > 0) {
      boundStmt = stmt.bind(...params);
    }
    const result = await boundStmt.all();
    logger.debug('Database query completed', { resultCount: result.results?.length || 0 });
    return result;
  } catch (error) {
    // Wrap D1-specific errors for consistent error handling
    logger.error('Database query failed', { error: error.message, sql });
    throw new Error(`Database query failed: ${error.message}`);
  }
}

/**
 * Executes a SQL statement that doesn't return rows (INSERT, UPDATE, DELETE)
 * @param {D1Database} db - The D1 database instance
 * @param {string} sql - The SQL query string
 * @param {Array} params - Array of parameters to bind
 * @returns {Promise<Object>} - Result object with meta information
 */
export async function execute(db, sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    let boundStmt = stmt;
    if (params.length > 0) {
      boundStmt = stmt.bind(...params);
    }
    const result = await boundStmt.run();
    return result;
  } catch (error) {
    // Wrap D1-specific errors
    throw new Error(`Database execution failed: ${error.message}`);
  }
}