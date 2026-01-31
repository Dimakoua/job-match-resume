// domain/resume/resume_repository.js
// Repository interface that delegates to an implementation
// Allows hiding DB details and swapping implementations

export class ResumeRepository {
  constructor(implementation) {
    this.impl = implementation;
  }

  /**
   * Saves a Resume entity to the repository.
   * @param {Resume} resume - The resume to save.
   * @returns {Promise<void>}
   */
  async save(resume) {
    return this.impl.save(resume);
  }

  /**
   * Updates an existing Resume entity in the repository.
   * @param {Resume} resume - The resume to update.
   * @returns {Promise<void>}
   */
  async update(resume) {
    return this.impl.update(resume);
  }

  /**
   * Finds a Resume by ID.
   * @param {string} id - The resume ID.
   * @returns {Promise<Resume|null>} The resume or null if not found.
   */
  async findById(id) {
    return this.impl.findById(id);
  }

  /**
   * Finds all Resumes by user ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<Resume[]>} Array of resumes for the user.
   */
  async findAllByUserId(userId) {
    return this.impl.findAllByUserId(userId);
  }

  /**
   * Deletes a Resume by ID.
   * @param {string} id - The resume ID.
   * @returns {Promise<void>}
   */
  async delete(id) {
    return this.impl.delete(id);
  }
}