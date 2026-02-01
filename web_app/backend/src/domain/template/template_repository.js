// domain/template/template_repository.js
// Repository for template operations - returns static data

export class TemplateRepository {
  /**
   * Gets all available templates with their metadata.
   * @returns {Promise<Array>} - Array of template objects with id and name.
   */
  async getAllTemplates() {
    // Predefined templates metadata
    return [
      { id: 'basic', name: 'Basic' },
      { id: 'modern', name: 'Modern' },
      { id: 'professional', name: 'Professional' },
      { id: 'creative', name: 'Creative' },
      { id: 'technical', name: 'Technical' },
      { id: 'minimal', name: 'Minimal' },
      { id: 'academic', name: 'Academic' }
    ];
  }

  /**
   * Gets template sections by template ID.
   * @param {string} templateId - The template identifier.
   * @returns {Promise<Array>} - Array of section objects or empty array if not found.
   */
  async getSections(templateId) {
    // Predefined templates - static data
    const templates = {
      'basic': [
        { type: 'personal', data: { name: '', email: '', phone: '', location: '' } },
        { type: 'summary', data: { text: '' } },
        { type: 'experience', data: { company: '', position: '', startDate: '', endDate: '', description: '' } },
        { type: 'education', data: { school: '', degree: '', graduationDate: '' } },
        { type: 'skills', data: { skills: [] } }
      ],
      'modern': [
        { type: 'header', data: { name: '', title: '', email: '', phone: '', linkedin: '' } },
        { type: 'experience', data: { company: '', position: '', duration: '', achievements: [] } },
        { type: 'education', data: { school: '', degree: '', year: '' } },
        { type: 'projects', data: { name: '', description: '', technologies: [], link: '' } }
      ],
      'professional': [
        { type: 'contact', data: { name: '', email: '', phone: '', address: '', linkedin: '' } },
        { type: 'professional_summary', data: { text: '' } },
        { type: 'work_experience', data: { company: '', position: '', location: '', startDate: '', endDate: '', responsibilities: [] } },
        { type: 'education', data: { school: '', degree: '', location: '', graduationDate: '' } },
        { type: 'certifications', data: { certifications: [] } },
        { type: 'professional_development', data: { courses: [] } }
      ],
      'creative': [
        { type: 'profile', data: { name: '', tagline: '', email: '', phone: '', portfolio: '', social: [] } },
        { type: 'about', data: { text: '' } },
        { type: 'portfolio', data: { projects: [] } },
        { type: 'experience', data: { company: '', role: '', period: '', description: '', highlights: [] } },
        { type: 'skills', data: { technical: [], creative: [], soft: [] } },
        { type: 'education', data: { school: '', program: '', year: '' } }
      ],
      'technical': [
        { type: 'header', data: { name: '', title: '', email: '', phone: '', github: '', linkedin: '' } },
        { type: 'technical_skills', data: { languages: [], frameworks: [], tools: [], databases: [] } },
        { type: 'experience', data: { company: '', position: '', dates: '', technologies: [], achievements: [] } },
        { type: 'projects', data: { name: '', description: '', tech_stack: [], repository: '', demo: '' } },
        { type: 'education', data: { school: '', degree: '', field: '', graduation: '' } },
        { type: 'certifications', data: { name: '', issuer: '', date: '', credential_id: '' } }
      ],
      'minimal': [
        { type: 'name', data: { full_name: '', title: '' } },
        { type: 'contact', data: { email: '', phone: '', location: '' } },
        { type: 'experience', data: { role: '', company: '', period: '', description: '' } },
        { type: 'education', data: { degree: '', school: '', year: '' } },
        { type: 'skills', data: { skills: [] } }
      ],
      'academic': [
        { type: 'academic_profile', data: { name: '', title: '', school: '', department: '', email: '' } },
        { type: 'research_interests', data: { interests: [] } },
        { type: 'education', data: { degree: '', school: '', year: '', thesis: '' } },
        { type: 'publications', data: { papers: [] } },
        { type: 'teaching_experience', data: { courses: [] } },
        { type: 'grants_awards', data: { items: [] } },
        { type: 'professional_service', data: { activities: [] } }
      ]
    };

    return templates[templateId] || [];
  }
}