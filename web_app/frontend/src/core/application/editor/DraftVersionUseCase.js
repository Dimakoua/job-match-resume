/**
 * DraftVersionUseCase
 * Manages local version snapshots for resumes in localStorage
 */
export class DraftVersionUseCase {
  constructor(storageKey = 'resume_versions_history', maxVersionsPerResume = 10) {
    this.storageKey = storageKey
    this.maxVersionsPerResume = maxVersionsPerResume
  }

  /**
   * Add a new snapshot to history
   * @param {string} resumeId 
   * @param {string} name - Display name for this version
   * @param {object} data - The resume data state
   */
  saveSnapshot(resumeId, name, data) {
    if (!resumeId) return null

    const history = this._getRawHistory()
    
    if (!history[resumeId]) {
      history[resumeId] = []
    }

    const snapshot = {
      id: crypto.randomUUID(),
      name,
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)) // Deep clone to ensure snapshot integrity
    }

    // Add to start of array
    history[resumeId].unshift(snapshot)

    // Limit number of versions
    if (history[resumeId].length > this.maxVersionsPerResume) {
      history[resumeId] = history[resumeId].slice(0, this.maxVersionsPerResume)
    }

    localStorage.setItem(this.storageKey, JSON.stringify(history))
    return snapshot
  }

  /**
   * Get all version snapshots for a specific resume
   * @param {string} resumeId 
   * @returns {Array}
   */
  getHistory(resumeId) {
    if (!resumeId) return []
    const history = this._getRawHistory()
    return history[resumeId] || []
  }

  /**
   * Delete a specific version
   * @param {string} resumeId 
   * @param {string} versionId 
   */
  deleteVersion(resumeId, versionId) {
    const history = this._getRawHistory()
    if (history[resumeId]) {
      history[resumeId] = history[resumeId].filter(v => v.id !== versionId)
      localStorage.setItem(this.storageKey, JSON.stringify(history))
    }
  }

  /**
   * Clear all versions for a specific resume
   * @param {string} resumeId 
   */
  clearHistory(resumeId) {
    const history = this._getRawHistory()
    delete history[resumeId]
    localStorage.setItem(this.storageKey, JSON.stringify(history))
  }

  /**
   * Internal helper to get parsed history object
   */
  _getRawHistory() {
    try {
      const saved = localStorage.getItem(this.storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch (e) {
      console.error('Failed to parse version history:', e)
      return {}
    }
  }
}
