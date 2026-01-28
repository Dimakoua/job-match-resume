export class Template {
  constructor(id, name, structure) {
    this.validateId(id);
    this.validateName(name);
    this.validateStructure(structure);

    this.id = id;
    this.name = name;
    this.structure = structure; // Array of section objects
  }

  validateId(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Template ID must be a non-empty string');
    }
  }

  validateName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Template name must be a non-empty string');
    }
  }

  validateStructure(structure) {
    if (!Array.isArray(structure)) {
      throw new Error('Template structure must be an array');
    }
  }
}