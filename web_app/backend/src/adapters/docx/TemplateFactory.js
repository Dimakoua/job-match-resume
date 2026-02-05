import { ModernTemplate } from './templates/ModernTemplate.js';

export class TemplateFactory {
  /**
   * Creates a template instance based on the template ID
   * @param {string} templateId - The ID of the template (e.g., 'modern', 'classic')
   * @returns {Object} - The template instance
   */
  create(templateId) {
    // Normalize template ID
    const id = (templateId || 'modern').toLowerCase();

    switch (id) {
      case 'modern':
      case 'standard': // legacy fallback
      default:
        // For now, default to ModernTemplate for all until others are implemented
        return new ModernTemplate();
    }
  }
}
