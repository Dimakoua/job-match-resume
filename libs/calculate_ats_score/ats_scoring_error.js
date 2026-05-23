// application/calculate_ats_score/ats_scoring_error.js

/**
 * Custom error class for ATS scoring operations
 */
export class AtsScoringError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AtsScoringError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static invalidInput(field, reason) {
    return new AtsScoringError(
      `Invalid input for ${field}: ${reason}`,
      'INVALID_INPUT',
      { field, reason }
    );
  }

  static textTooLong(field, length, maxLength) {
    return new AtsScoringError(
      `${field} exceeds maximum length of ${maxLength} characters (got ${length})`,
      'TEXT_TOO_LONG',
      { field, length, maxLength }
    );
  }
}
