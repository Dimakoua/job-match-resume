import { TemplateFactory } from './TemplateFactory.js';

export class DocxAdapter {
  constructor() {
    this.factory = new TemplateFactory();
  }

  /**
   * Generates a DOCX buffer from resume data
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generateBuffer(resume) {
    if (!resume) throw new Error('Resume data is required');
    if (!resume.sections) throw new Error('Resume must have sections object');
    const templateId = resume.sections.layout.template || 'modern';
    const template = this.factory.create(templateId);
    return template.generate(resume);
  }
}
