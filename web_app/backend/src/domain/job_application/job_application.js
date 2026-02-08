export class JobApplication {
  constructor(
    id,
    userId,
    jobSearchListId,
    resumeId,
    company,
    position,
    jobDescription,
    status = 'saved',
    appliedDate = null,
    notes = null,
    archived = false
  ) {
    this.validateId(id);
    this.validateUserId(userId);
    this.validateJobSearchListId(jobSearchListId);
    this.validateResumeId(resumeId);
    this.validateCompany(company);
    this.validatePosition(position);
    this.validateJobDescription(jobDescription);
    this.validateStatus(status);
    this.validateAppliedDate(appliedDate);
    this.validateNotes(notes);
    this.validateArchived(archived);

    this.id = id;
    this.userId = userId;
    this.jobSearchListId = jobSearchListId;
    this.resumeId = resumeId;
    this.company = company.trim();
    this.position = position.trim();
    this.jobDescription = jobDescription.trim();
    this.status = status;
    this.appliedDate = appliedDate;
    this.notes = notes ? notes.trim() : null;
    this.archived = archived;
  }

  validateId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('JobApplication ID must be a non-empty string');
    }
  }

  validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
  }

  validateJobSearchListId(jobSearchListId) {
    if (jobSearchListId != null && typeof jobSearchListId !== 'string') {
      throw new Error('JobSearchList ID must be a string or null');
    }
  }

  validateResumeId(resumeId) {
    if (resumeId != null && typeof resumeId !== 'string') {
      throw new Error('Resume ID must be a string or null');
    }
  }

  validateCompany(company) {
    if (typeof company !== 'string') {
      throw new Error('Company must be a string');
    }
    const trimmedCompany = company.trim();
    if (trimmedCompany === '') {
      throw new Error('Company cannot be empty');
    }
    if (trimmedCompany.length > 100) {
      throw new Error('Company must be 100 characters or less');
    }
  }

  validatePosition(position) {
    if (typeof position !== 'string') {
      throw new Error('Position must be a string');
    }
    const trimmedPosition = position.trim();
    if (trimmedPosition === '') {
      throw new Error('Position cannot be empty');
    }
    if (trimmedPosition.length > 100) {
      throw new Error('Position must be 100 characters or less');
    }
  }

  validateJobDescription(jobDescription) {
    if (jobDescription == null || typeof jobDescription !== 'string') {
      throw new Error('Job description is required');
    }
    const trimmedDescription = jobDescription.trim();
    if (trimmedDescription === '') {
      throw new Error('Job description cannot be empty');
    }
    if (trimmedDescription.length > 10000) {
      throw new Error('Job description must be 10000 characters or less');
    }
  }

  validateStatus(status) {
    const validStatuses = ['saved', 'applied', 'interviewing', 'rejected', 'accepted', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  validateAppliedDate(appliedDate) {
    if (appliedDate != null && !(appliedDate instanceof Date)) {
      throw new Error('Applied date must be a Date object or null');
    }
  }

  validateNotes(notes) {
    if (notes != null && typeof notes !== 'string') {
      throw new Error('Notes must be a string or null');
    }
    if (notes && notes.length > 2000) {
      throw new Error('Notes must be 2000 characters or less');
    }
  }

  validateArchived(archived) {
    if (typeof archived !== 'boolean') {
      throw new Error('Archived must be a boolean');
    }
  }

  updateStatus(newStatus) {
    this.validateStatus(newStatus);
    this.status = newStatus;
  }

  updateAppliedDate(newAppliedDate) {
    this.validateAppliedDate(newAppliedDate);
    this.appliedDate = newAppliedDate;
  }

  updateNotes(newNotes) {
    this.validateNotes(newNotes);
    this.notes = newNotes ? newNotes.trim() : null;
  }

  updateCompany(newCompany) {
    this.validateCompany(newCompany);
    this.company = newCompany.trim();
  }

  updatePosition(newPosition) {
    this.validatePosition(newPosition);
    this.position = newPosition.trim();
  }

  updateJobDescription(newJobDescription) {
    this.validateJobDescription(newJobDescription);
    this.jobDescription = newJobDescription.trim();
  }

  updateJobSearchList(newJobSearchListId) {
    this.validateJobSearchListId(newJobSearchListId);
    this.jobSearchListId = newJobSearchListId;
  }

  updateResumeId(newResumeId) {
    this.validateResumeId(newResumeId);
    this.resumeId = newResumeId;
  }

  updateArchived(newArchived) {
    this.validateArchived(newArchived);
    this.archived = newArchived;
  }
}