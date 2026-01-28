export class User {
  constructor(id, email, name, passwordHash, googleId = null) {
    this.validateId(id);
    this.validateEmail(email);
    this.validateName(name);
    this.validatePasswordHash(passwordHash);
    this.validateGoogleId(googleId);

    this.id = id;
    this.email = email.toLowerCase().trim();
    this.name = name.trim();
    this.passwordHash = passwordHash;
    this.googleId = googleId;
  }

  validateId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
  }

  validateEmail(email) {
    if (email == null || typeof email !== 'string') {
      throw new Error('Email is required');
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail === '') {
      throw new Error('Email cannot be empty');
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      throw new Error('Invalid email format');
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
    if (trimmedName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
  }

  validatePasswordHash(passwordHash) {
    if (passwordHash != null && typeof passwordHash !== 'string') {
      throw new Error('Password hash must be a string or null');
    }
  }

  validateGoogleId(googleId) {
    if (googleId != null && typeof googleId !== 'string') {
      throw new Error('Google ID must be a string or null');
    }
  }

  updateName(newName) {
    this.validateName(newName);
    this.name = newName.trim();
  }

  updatePassword(newPasswordHash) {
    this.validatePasswordHash(newPasswordHash);
    this.passwordHash = newPasswordHash;
  }

  updateEmail(newEmail) {
    this.validateEmail(newEmail);
    this.email = newEmail.toLowerCase().trim();
  }
}