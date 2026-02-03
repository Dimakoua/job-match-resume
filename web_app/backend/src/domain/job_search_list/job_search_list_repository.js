// domain/job_search_list/job_search_list_repository.js
// Repository interface that delegates to an implementation
// Allows hiding DB details and swapping implementations

export class JobSearchListRepository {
  constructor(implementation) {
    this.impl = implementation;
  }

  /**
   * Saves a JobSearchList entity to the repository.
   * @param {JobSearchList} list - The list to save.
   * @returns {Promise<void>}
   */
  async save(list) {
    return this.impl.save(list);
  }

  /**
   * Finds a JobSearchList by ID.
   * @param {string} id - The list ID.
   * @returns {Promise<JobSearchList|null>} - The list or null if not found.
   */
  async findById(id) {
    return this.impl.findById(id);
  }

  /**
   * Finds all JobSearchLists for a user.
   * @param {string} userId - The user ID.
   * @returns {Promise<JobSearchList[]>} - Array of lists.
   */
  async findAllByUserId(userId) {
    return this.impl.findAllByUserId(userId);
  }

  /**
   * Finds a JobSearchList by name and user ID.
   * @param {string} name - The list name.
   * @param {string} userId - The user ID.
   * @returns {Promise<JobSearchList|null>} - The list or null if not found.
   */
  async findByNameAndUserId(name, userId) {
    return this.impl.findByNameAndUserId(name, userId);
  }

  /**
   * Updates a JobSearchList in the repository.
   * @param {JobSearchList} list - The list to update.
   * @returns {Promise<void>}
   */
  async update(list) {
    return this.impl.update(list);
  }

  /**
   * Deletes a JobSearchList by ID.
   * @param {string} id - The list ID.
   * @returns {Promise<void>}
   */
  async delete(id) {
    return this.impl.delete(id);
  }
}