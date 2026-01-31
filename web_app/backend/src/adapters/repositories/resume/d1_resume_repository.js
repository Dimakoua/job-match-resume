// adapters/repositories/resume/d1_resume_repository.js
import { Resume } from '../../../domain/resume/resume.js';
import { query, execute } from '../../infrastructure/database.js';

export class D1ResumeRepository {
  constructor(database) {
    this.database = database;
  }

  async save(resume) {
    const contentJson = JSON.stringify(resume.sections);
    const sql = 'INSERT INTO Resumes (id, user_id, title, content, template_id) VALUES (?, ?, ?, ?, ?)';
    try {
      await execute(this.database, sql, [resume.id, resume.userId, resume.title, contentJson, resume.templateId || null]);
    } catch (error) {
      throw new Error(`Failed to save resume: ${error.message}`);
    }
  }

  async update(resume) {
    const contentJson = JSON.stringify(resume.sections);
    const sql = 'UPDATE Resumes SET title = ?, content = ?, template_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?';
    try {
      await execute(this.database, sql, [
        resume.title,
        contentJson,
        resume.templateId || null,
        resume.id,
        resume.userId
      ]);
    } catch (error) {
      throw new Error(`Failed to update resume: ${error.message}`);
    }
  }

  async findById(id) {
    const sql = 'SELECT id, user_id, title, content, template_id, created_at, updated_at FROM Resumes WHERE id = ?';
    try {
      const result = await query(this.database, sql, [id]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      const sections = JSON.parse(row.content);
      return new Resume(row.id, row.user_id, row.title, sections, row.template_id, new Date(row.created_at), new Date(row.updated_at));
    } catch (error) {
      throw new Error(`Failed to find resume: ${error.message}`);
    }
  }

  async findAllByUserId(userId) {
    const sql = 'SELECT id, user_id, title, content, template_id, created_at, updated_at FROM Resumes WHERE user_id = ? ORDER BY created_at DESC';
    try {
      const result = await query(this.database, sql, [userId]);
      return result.results.map(row => {
        const sections = JSON.parse(row.content);
        return new Resume(row.id, row.user_id, row.title, sections, row.template_id, new Date(row.created_at), new Date(row.updated_at));
      });
    } catch (error) {
      throw new Error(`Failed to find resumes: ${error.message}`);
    }
  }

  async delete(id) {
    const sql = 'DELETE FROM Resumes WHERE id = ?';
    try {
      await execute(this.database, sql, [id]);
    } catch (error) {
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }
}