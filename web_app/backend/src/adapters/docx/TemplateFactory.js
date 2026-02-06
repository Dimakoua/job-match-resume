import { ModernTemplate } from './templates/ModernTemplate.js';
import { BasicTemplate } from './templates/BasicTemplate.js';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate.js';
import { AcademicTemplate } from './templates/AcademicTemplate.js';
import { ClassicTemplate } from './templates/ClassicTemplate.js';
import { CreativeTemplate } from './templates/CreativeTemplate.js';
import { MinimalTemplate } from './templates/MinimalTemplate.js';

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
        return new ModernTemplate();
      case 'professional':
        return new ProfessionalTemplate();
      case 'academic':
        return new AcademicTemplate();
      case 'classic':
        return new ClassicTemplate();
      case 'creative':
        return new CreativeTemplate();
      case 'minimal':
        return new MinimalTemplate();
      default:
        // For now, default to ModernTemplate for all until others are implemented
        return new ModernTemplate();
    }
  }
}
