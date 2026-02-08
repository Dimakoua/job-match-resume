// domain/job_application/job_application_repository.js
// Repository interface that delegates to an implementation
// Allows hiding DB details and swapping implementations

export class JobApplicationRepository {
  constructor(implementation) {
    this.impl = implementation;
  }

  /**
   * Save a job application
   * @param {JobApplication} jobApplication
   * @returns {Promise<void>}
   */
  async save(jobApplication) {
    return this.impl.save(jobApplication);
  }

  /**
   * Find a job application by ID
   * @param {string} id
   * @returns {Promise<JobApplication|null>}
   */
  async findById(id) {
    return this.impl.findById(id);
  }

  /**
   * Find all job applications for a user
   * @param {string} userId
   * @param {Object} options - Optional filters like status, jobSearchListId
   * @returns {Promise<JobApplication[]>}
   */
  async findByUserId(userId, options = {}) {
    return this.impl.findByUserId(userId, options);
  }

  /**
   * Update a job application
   * @param {JobApplication} jobApplication
   * @returns {Promise<void>}
   */
  async update(jobApplication) {
    return this.impl.update(jobApplication);
  }

  /**
   * Delete a job application by ID
   * @param {string} id
   * @param {string} userId - For ownership verification
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async deleteById(id, userId) {
    return this.impl.deleteById(id, userId);
  }

  /**
   * Count job applications for a user with optional filters
   * @param {string} userId
   * @param {Object} options - Optional filters
   * @returns {Promise<number>}
   */
  async countByUserId(userId, options = {}) {
    return this.impl.countByUserId(userId, options);
  }

  /**
   * Archive a job application by ID
   * @param {string} id
   * @param {string} userId - For ownership verification
   * @returns {Promise<boolean>} - True if archived, false if not found
   */
  async archiveById(id, userId) {
    return this.impl.archiveById(id, userId);
  }

  /**
   * Unarchive a job application by ID
   * @param {string} id
   * @param {string} userId - For ownership verification
   * @returns {Promise<boolean>} - True if unarchived, false if not found
   */
  async unarchiveById(id, userId) {
    return this.impl.unarchiveById(id, userId);
  }
}