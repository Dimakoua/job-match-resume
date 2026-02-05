import {
  ResumeTemplateBasic,
  ResumeTemplateModern,
  ResumeTemplateMinimal,
  ResumeTemplateProfessional
} from './index.js'

/**
 * Factory function to get the appropriate resume template component
 * @param {string} template - The template name ('basic', 'modern', 'minimal', 'professional', 'classic')
 * @returns {Component} The Vue component for the specified template
 */
export function getResumeTemplate(template) {
  switch (template) {
    case 'basic':
    case 'classic':
      return ResumeTemplateBasic
    case 'modern':
      return ResumeTemplateModern
    case 'minimal':
      return ResumeTemplateMinimal
    case 'professional':
      return ResumeTemplateProfessional
    default:
      // Default to basic/classic template
      return ResumeTemplateBasic
  }
}

/**
 * Get all available template names
 * @returns {string[]} Array of available template names
 */
export function getAvailableTemplates() {
  return ['basic', 'classic', 'modern', 'minimal', 'professional']
}

/**
 * Check if a template is supported
 * @param {string} template - The template name to check
 * @returns {boolean} True if the template is supported
 */
export function isTemplateSupported(template) {
  return getAvailableTemplates().includes(template)
}