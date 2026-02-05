import {
  ResumeTemplateBasic,
  ResumeTemplateClassic,
  ResumeTemplateModern,
  ResumeTemplateMinimal,
  ResumeTemplateProfessional
} from './index.js'

// Configuration: which backend templates have frontend components
const SUPPORTED_TEMPLATES = {
  'basic': ResumeTemplateBasic,
  'classic': ResumeTemplateClassic,
  'modern': ResumeTemplateModern,
  'minimal': ResumeTemplateMinimal,
  'professional': ResumeTemplateProfessional
}

/**
 * Factory function to get the appropriate resume template component
 * @param {string} template - The template ID from backend
 * @returns {Component} The Vue component for the specified template
 */
export function getResumeTemplate(template) {
  return SUPPORTED_TEMPLATES[template] || ResumeTemplateBasic
}

/**
 * Get all templates supported by the frontend
 * @returns {string[]} Array of supported template IDs
 */
export function getSupportedTemplateIds() {
  return Object.keys(SUPPORTED_TEMPLATES)
}

/**
 * Check if a template is supported by the frontend
 * @param {string} templateId - The template ID to check
 * @returns {boolean} True if the template has a frontend component
 */
export function isTemplateSupported(templateId) {
  return templateId in SUPPORTED_TEMPLATES
}

/**
 * Filter backend templates to only include supported ones
 * @param {Array} backendTemplates - Array of template objects from backend
 * @returns {Array} Filtered array of supported templates
 */
export function filterSupportedTemplates(backendTemplates) {
  return backendTemplates.filter(template => isTemplateSupported(template.id))
}