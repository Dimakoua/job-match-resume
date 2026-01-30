/**
 * LoadResumeUseCase
 * Orchestrates loading a resume from the backend or draft storage
 * Dependencies injected: resumeRepository, draftStorageUseCase
 */
export class LoadResumeUseCase {
  constructor(resumeRepository, draftStorageUseCase) {
    this.resumeRepository = resumeRepository
    this.draftStorageUseCase = draftStorageUseCase
  }

  async execute(resumeId) {
    try {
      // Load from backend
      const resume = await this.resumeRepository.get(resumeId)
      
      // Clear any stale draft
      this.draftStorageUseCase.clearDraft()
      
      // Parse sections if needed
      if (resume.sections) {
        const { visibleSections, layout, style, ...content } = resume.sections
        return {
          resumeData: content,
          sections: visibleSections,
          layoutSettings: layout,
          styleSettings: style,
          resumeId: resume.id,
          source: 'backend'
        }
      }
      
      return { ...resume, source: 'backend' }
    } catch (error) {
      console.error('Failed to load resume from backend:', error)
      
      // Fallback to draft storage
      const draft = this.draftStorageUseCase.loadDraft(resumeId)
      if (draft) {
        console.log('Loaded draft from localStorage as fallback')
        return { ...draft, source: 'draft' }
      }
      
      throw error
    }
  }

  loadFromDraftOrNew() {
    const draft = this.draftStorageUseCase.loadDraft()
    if (draft) {
      console.log('Restored unsaved draft from localStorage')
      return { ...draft, source: 'draft', isUnsaved: true }
    }
    return null
  }
}
