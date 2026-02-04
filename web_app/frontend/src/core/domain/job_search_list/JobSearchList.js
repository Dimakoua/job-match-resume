/**
 * JobSearchList (Domain Entity)
 *
 * Represents a job search list in the domain layer.
 * Per technical_design.md §3.1: "Pure data structures and logic (e.g., Resume class)."
 */
export class JobSearchList {
  constructor(id, userId, name, description = null) {
    this.validateId(id);
    this.validateUserId(userId);
    this.validateName(name);
    this.validateDescription(description);

    this.id = id;
    this.userId = userId;
    this.name = name.trim();
    this.description = description ? description.trim() : null;
  }

  validateId(id) {
    if (id !== null && (!id || typeof id !== 'string')) {
      throw new Error('JobSearchList ID must be a non-empty string or null');
    }
  }

  validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
  }

  validateName(name) {
    if (name == null || typeof name !== 'string') {
      throw new Error('Name is required');
    }
    const trimmedName = name.trim();
    if (trimmedName === '') {
      throw new Error('Name cannot be empty');
    }
    if (trimmedName.length > 100) {
      throw new Error('Name must be 100 characters or less');
    }
  }

  validateDescription(description) {
    if (description != null && typeof description !== 'string') {
      throw new Error('Description must be a string or null');
    }
    if (description && description.length > 500) {
      throw new Error('Description must be 500 characters or less');
    }
  }

  updateName(newName) {
    this.validateName(newName);
    this.name = newName.trim();
  }

  updateDescription(newDescription) {
    this.validateDescription(newDescription);
    this.description = newDescription ? newDescription.trim() : null;
  }
}