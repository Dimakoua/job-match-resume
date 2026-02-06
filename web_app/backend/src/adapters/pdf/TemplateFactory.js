import { ModernTemplate } from './templates/ModernTemplate.js';
import { BasicTemplate } from './templates/BasicTemplate.js';

export class TemplateFactory {
  /**
   * Creates a template instance based on the template ID
   * @param {string} templateId - The ID of the template (e.g., 'modern', 'basic')
   * @returns {Object} - The template instance
   */
  create(templateId) {
    // Normalize template ID
    const id = (templateId || 'modern').toLowerCase();

    switch (id) {
      case 'basic':
        return new BasicTemplate();
      case 'modern':
      case 'standard': // legacy fallback
      default:
        // For now, default to ModernTemplate for all until others are implemented
        return new ModernTemplate();
    }
  }
}
