// adapters/repositories/job_search_list/d1_job_search_list_repository.js
import { JobSearchList } from '../../../domain/job_search_list/job_search_list.js';
import { query, execute } from '../../infrastructure/database.js';

export class D1JobSearchListRepository {
  constructor(database) {
    this.database = database;
  }

  async save(list) {
    const sql = 'INSERT INTO JobSearchLists (id, user_id, name, description) VALUES (?, ?, ?, ?)';
    try {
      await execute(this.database, sql, [list.id, list.userId, list.name, list.description]);
    } catch (error) {
      throw new Error(`Failed to save job search list: ${error.message}`);
    }
  }

  async findById(id) {
    const sql = 'SELECT id, user_id, name, description FROM JobSearchLists WHERE id = ?';
    try {
      const result = await query(this.database, sql, [id]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      return new JobSearchList(row.id, row.user_id, row.name, row.description);
    } catch (error) {
      throw new Error(`Failed to find job search list: ${error.message}`);
    }
  }

  async findAllByUserId(userId) {
    const sql = 'SELECT id, user_id, name, description FROM JobSearchLists WHERE user_id = ? ORDER BY created_at DESC';
    try {
      const result = await query(this.database, sql, [userId]);
      return result.results.map(row => new JobSearchList(row.id, row.user_id, row.name, row.description));
    } catch (error) {
      throw new Error(`Failed to find job search lists: ${error.message}`);
    }
  }

  async findByNameAndUserId(name, userId) {
    const sql = 'SELECT id, user_id, name, description FROM JobSearchLists WHERE name = ? AND user_id = ?';
    try {
      const result = await query(this.database, sql, [name, userId]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      return new JobSearchList(row.id, row.user_id, row.name, row.description);
    } catch (error) {
      throw new Error(`Failed to find job search list by name: ${error.message}`);
    }
  }

  async update(list) {
    const sql = 'UPDATE JobSearchLists SET name = ?, description = ? WHERE id = ?';
    try {
      await execute(this.database, sql, [list.name, list.description, list.id]);
    } catch (error) {
      throw new Error(`Failed to update job search list: ${error.message}`);
    }
  }

  async delete(id) {
    const sql = 'DELETE FROM JobSearchLists WHERE id = ?';
    try {
      await execute(this.database, sql, [id]);
    } catch (error) {
      throw new Error(`Failed to delete job search list: ${error.message}`);
    }
  }
}