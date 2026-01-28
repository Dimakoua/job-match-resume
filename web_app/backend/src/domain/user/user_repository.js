// domain/user/user_repository.js
// Repository interface that delegates to an implementation
// Allows hiding DB details and swapping implementations

export class UserRepository {
  constructor(implementation) {
    this.impl = implementation;
  }

  /**
   * Saves a User entity to the repository.
   * @param {User} user - The user to save.
   * @returns {Promise<void>}
   */
  async save(user) {
    return this.impl.save(user);
  }

  /**
   * Finds a User by ID.
   * @param {string} id - The user ID.
   * @returns {Promise<User|null>} - The user or null if not found.
   */
  async findById(id) {
    return this.impl.findById(id);
  }

  /**
   * Finds a User by email.
   * @param {string} email - The user email.
   * @returns {Promise<User|null>} - The user or null if not found.
   */
  async findByEmail(email) {
    return this.impl.findByEmail(email);
  }

  /**
   * Finds a User by Google ID.
   * @param {string} googleId - The Google ID.
   * @returns {Promise<User|null>} - The user or null if not found.
   */
  async findByGoogleId(googleId) {
    return this.impl.findByGoogleId(googleId);
  }

  /**
   * Updates a User in the repository.
   * @param {User} user - The user to update.
   * @returns {Promise<void>}
   */
  async update(user) {
    return this.impl.update(user);
  }
}