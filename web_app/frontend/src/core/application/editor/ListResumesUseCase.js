/**
 * ListResumesUseCase
 * Orchestrates fetching the user's saved resumes from the backend
 * Dependencies injected: resumesListService
 */
export class ListResumesUseCase {
  constructor(resumesListService) {
    this.resumesListService = resumesListService
  }

  async execute() {
    try {
      const resumes = await this.resumesListService.listResumes()
      return resumes.map(resume => ({
        id: resume.id,
        title: resume.title || 'Untitled Resume',
        updatedAt: resume.updatedAt || new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
      throw error
    }
  }
}
