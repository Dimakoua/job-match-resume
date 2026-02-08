// adapters/repositories/job_application/d1_job_application_repository.js
import { JobApplication } from '../../../domain/job_application/job_application.js';
import { query, execute } from '../../infrastructure/database.js';

export class D1JobApplicationRepository {
  constructor(database) {
    this.database = database;
  }

  async save(jobApplication) {
    const sql = `
      INSERT INTO JobApplications (
        id, user_id, job_search_list_id, resume_id, company, position,
        job_description, status, applied_date, notes, archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const appliedDate = jobApplication.appliedDate ? jobApplication.appliedDate.getTime() : null;
    const now = Date.now();

    try {
      await execute(this.database, sql, [
        jobApplication.id,
        jobApplication.userId,
        jobApplication.jobSearchListId,
        jobApplication.resumeId,
        jobApplication.company,
        jobApplication.position,
        jobApplication.jobDescription,
        jobApplication.status,
        appliedDate,
        jobApplication.notes,
        jobApplication.archived ? 1 : 0,
        now,
        now
      ]);
    } catch (error) {
      throw new Error(`Failed to save job application: ${error.message}`);
    }
  }

  async findById(id) {
    const sql = `
      SELECT id, user_id, job_search_list_id, resume_id, company, position,
             job_description, status, applied_date, notes, archived, created_at, updated_at
      FROM JobApplications
      WHERE id = ?
    `;

    try {
      const result = await query(this.database, sql, [id]);
      if (result.results.length === 0) {
        return null;
      }

      const row = result.results[0];
      return this.mapRowToJobApplication(row);
    } catch (error) {
      throw new Error(`Failed to find job application: ${error.message}`);
    }
  }

  async findByUserId(userId, options = {}) {
    let sql = `
      SELECT id, user_id, job_search_list_id, resume_id, company, position,
             job_description, status, applied_date, notes, archived, created_at, updated_at
      FROM JobApplications
      WHERE user_id = ?
    `;

    const params = [userId];

    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    if (options.jobSearchListId !== undefined) {
      if (options.jobSearchListId === null) {
        sql += ' AND job_search_list_id IS NULL';
      } else {
        sql += ' AND job_search_list_id = ?';
        params.push(options.jobSearchListId);
      }
    }

    // By default, exclude archived applications unless explicitly requested
    if (options.includeArchived !== true) {
      sql += ' AND archived = 0';
    }

    sql += ' ORDER BY created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    try {
      const results = await query(this.database, sql, params);
      return results.results.map(row => this.mapRowToJobApplication(row));
    } catch (error) {
      throw new Error(`Failed to find job applications: ${error.message}`);
    }
  }

  async update(jobApplication) {
    const sql = `
      UPDATE JobApplications
      SET resume_id = ?, company = ?, position = ?, job_description = ?, job_search_list_id = ?, status = ?, applied_date = ?, notes = ?, archived = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `;

    const appliedDate = jobApplication.appliedDate ? jobApplication.appliedDate.getTime() : null;
    const now = Date.now();

    try {
      const result = await execute(this.database, sql, [
        jobApplication.resumeId,
        jobApplication.company,
        jobApplication.position,
        jobApplication.jobDescription,
        jobApplication.jobSearchListId,
        jobApplication.status,
        appliedDate,
        jobApplication.notes,
        jobApplication.archived ? 1 : 0,
        now,
        jobApplication.id,
        jobApplication.userId
      ]);

      if (result.meta.changes === 0) {
        throw new Error('Job application not found or access denied');
      }
    } catch (error) {
      throw new Error(`Failed to update job application: ${error.message}`);
    }
  }

  async deleteById(id, userId) {
    const sql = 'DELETE FROM JobApplications WHERE id = ? AND user_id = ?';

    try {
      const result = await execute(this.database, sql, [id, userId]);
      return result.meta.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete job application: ${error.message}`);
    }
  }

  async countByUserId(userId, options = {}) {
    let sql = 'SELECT COUNT(*) as count FROM JobApplications WHERE user_id = ?';
    const params = [userId];

    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    if (options.jobSearchListId !== undefined) {
      if (options.jobSearchListId === null) {
        sql += ' AND job_search_list_id IS NULL';
      } else {
        sql += ' AND job_search_list_id = ?';
        params.push(options.jobSearchListId);
      }
    }

    // By default, exclude archived applications unless explicitly requested
    if (options.includeArchived !== true) {
      sql += ' AND archived = 0';
    }

    try {
      const result = await query(this.database, sql, params);
      return result.results[0].count;
    } catch (error) {
      throw new Error(`Failed to count job applications: ${error.message}`);
    }
  }

  async archiveById(id, userId) {
    const sql = 'UPDATE JobApplications SET archived = 1, updated_at = ? WHERE id = ? AND user_id = ?';

    try {
      const result = await execute(this.database, sql, [Date.now(), id, userId]);
      return result.meta.changes > 0;
    } catch (error) {
      throw new Error(`Failed to archive job application: ${error.message}`);
    }
  }

  async unarchiveById(id, userId) {
    const sql = 'UPDATE JobApplications SET archived = 0, updated_at = ? WHERE id = ? AND user_id = ?';

    try {
      const result = await execute(this.database, sql, [Date.now(), id, userId]);
      return result.meta.changes > 0;
    } catch (error) {
      throw new Error(`Failed to unarchive job application: ${error.message}`);
    }
  }

  mapRowToJobApplication(row) {
    return new JobApplication(
      row.id,
      row.user_id,
      row.job_search_list_id,
      row.resume_id,
      row.company,
      row.position,
      row.job_description,
      row.status,
      row.applied_date ? new Date(row.applied_date) : null,
      row.notes,
      row.archived === 1
    );
  }
}