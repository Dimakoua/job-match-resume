/**
 * SaveResumeUseCase
 * Orchestrates saving a resume to the backend
 * Dependencies injected: resumeRepository
 */
export class SaveResumeUseCase {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository
  }

  async execute(resumeData, sections, layoutSettings, styleSettings, resumeId = null) {
    // Validate required fields
    if (!resumeData.firstName && !resumeData.lastName) {
      throw new Error('Resume must have at least a name')
    }

    const saveData = {
      title: this._generateTitle(resumeData),
      sections: {
        ...resumeData,
        visibleSections: sections,
        layout: layoutSettings,
        style: styleSettings
      }
    }

    // Create or update
    if (resumeId) {
      return await this.resumeRepository.update(resumeId, saveData)
    } else {
      return await this.resumeRepository.create(saveData)
    }
  }

  _generateTitle(resumeData) {
    if (resumeData.title) {
      return resumeData.title
    }
    if (resumeData.firstName || resumeData.lastName) {
      return `${resumeData.firstName} ${resumeData.lastName}`.trim() + "'s Resume"
    }
    return 'Untitled Resume'
  }
}
