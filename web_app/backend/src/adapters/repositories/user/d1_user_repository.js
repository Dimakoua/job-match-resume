// adapters/repositories/user/d1_user_repository.js
import { User } from '../../../domain/user/user.js';
import { query, execute } from '../../infrastructure/database.js';

export class D1UserRepository {
  constructor(database) {
    this.database = database;
  }

  async save(user) {
    const sql = 'INSERT INTO Users (id, email, name, password_hash, google_id) VALUES (?, ?, ?, ?, ?)';
    try {
      await execute(this.database, sql, [user.id, user.email, user.name, user.passwordHash, user.googleId]);
    } catch (error) {
      // Wrap D1 errors
      throw new Error(`Failed to save user: ${error.message}`);
    }
  }

  async findById(id) {
    const sql = 'SELECT id, email, name, password_hash, google_id FROM Users WHERE id = ?';
    try {
      const result = await query(this.database, sql, [id]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      return new User(row.id, row.email, row.name, row.password_hash, row.google_id);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findByEmail(email) {
    const sql = 'SELECT id, email, name, password_hash, google_id FROM Users WHERE email = ?';
    try {
      const result = await query(this.database, sql, [email]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      return new User(row.id, row.email, row.name, row.password_hash, row.google_id);
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  async findByGoogleId(googleId) {
    const sql = 'SELECT id, email, name, password_hash, google_id FROM Users WHERE google_id = ?';
    try {
      const result = await query(this.database, sql, [googleId]);
      if (result.results.length === 0) {
        return null;
      }
      const row = result.results[0];
      return new User(row.id, row.email, row.name, row.password_hash, row.google_id);
    } catch (error) {
      throw new Error(`Failed to find user by Google ID: ${error.message}`);
    }
  }

  async update(user) {
    const sql = 'UPDATE Users SET name = ?, password_hash = ?, google_id = ? WHERE id = ?';
    try {
      await execute(this.database, sql, [user.name, user.passwordHash, user.googleId, user.id]);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}