export class Resume {
  constructor(id, userId, title, sections = [], templateId = null, createdAt = null, updatedAt = null) {
    this.validateId(id);
    this.validateUserId(userId);
    this.validateTitle(title);
    this.validateSections(sections);
    this.validateTemplateId(templateId);

    this.id = id;
    this.userId = userId;
    this.title = title.trim();
    this.sections = Array.isArray(sections) ? [...sections] : { ...sections };
    this.templateId = templateId;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  validateId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Resume ID must be a non-empty string');
    }
  }

  validateUserId(userId) {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID must be a non-empty string');
    }
  }

  validateTitle(title) {
    if (title == null || typeof title !== 'string') {
      throw new Error('Title is required');
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle === '') {
      throw new Error('Title cannot be empty');
    }
    if (trimmedTitle.length < 1) {
      throw new Error('Title must be at least 1 character long');
    }
  }

  validateSections(sections) {
    if (sections !== null && typeof sections !== 'object') {
      throw new Error('Sections must be an object or an array');
    }
  }

  validateTemplateId(templateId) {
    if (templateId != null && typeof templateId !== 'string') {
      throw new Error('Template ID must be a string or null');
    }
  }

  addSection(section) {
    if (!section || typeof section !== 'object') {
      throw new Error('Section must be an object');
    }
    if (!section.type || typeof section.type !== 'string') {
      throw new Error('Section must have a type');
    }
    // Check for duplicate types if needed, but for now allow multiples
    this.sections.push(section);
  }

  removeSection(type) {
    if (!type || typeof type !== 'string') {
      throw new Error('Type must be a non-empty string');
    }
    const index = this.sections.findIndex(section => section.type === type);
    if (index === -1) {
      throw new Error(`Section of type '${type}' not found`);
    }
    this.sections.splice(index, 1);
  }

  getSection(type) {
    return this.sections.find(section => section.type === type) || null;
  }
}