/**
 * DraftStorageUseCase
 * Manages persisting resume drafts to localStorage
 * No dependencies - pure storage operations
 */
export class DraftStorageUseCase {
  constructor(storageKey = 'resume_builder_draft', autoSaveDelay = 1000) {
    this.storageKey = storageKey
    this.autoSaveDelay = autoSaveDelay
    this.autoSaveTimeout = null
  }

  /**
   * Save draft to localStorage
   */
  saveDraft(resumeData, sections, layoutSettings, styleSettings, resumeId = null) {
    const draft = {
      resumeData,
      sections,
      layoutSettings,
      styleSettings,
      resumeId,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(this.storageKey, JSON.stringify(draft))
  }

  /**
   * Load draft from localStorage
   * @param {string} resumeId - Optional: only load if matching this resume ID
   * @returns {object|null}
   */
  loadDraft(resumeId = null) {
    try {
      const saved = localStorage.getItem(this.storageKey)
      if (!saved) return null

      const draft = JSON.parse(saved)
      
      // If checking for specific resume, verify match
      if (resumeId && draft.resumeId !== resumeId) {
        return null
      }

      return draft
    } catch (e) {
      console.error('Failed to load draft from localStorage:', e)
      return null
    }
  }

  /**
   * Clear draft from localStorage
   */
  clearDraft() {
    localStorage.removeItem(this.storageKey)
  }

  /**
   * Schedule auto-save with debounce
   */
  scheduleAutoSave(callback) {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      callback()
    }, this.autoSaveDelay)
  }

  /**
   * Cancel pending auto-save
   */
  cancelAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
      this.autoSaveTimeout = null
    }
  }
}
