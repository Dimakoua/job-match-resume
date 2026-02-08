/**
 * ListResumesUseCase
 * Orchestrates fetching the user's saved resumes from the backend
 * Dependencies injected: resumesListService
 */
export class ListResumesUseCase {
  constructor(resumesListService) {
    this.resumesListService = resumesListService
  }

  async execute(options = {}) {
    try {
      const result = await this.resumesListService.listResumes(options)
      return {
        resumes: (result.resumes || []).map(resume => ({
          id: resume.id,
          title: resume.title || 'Untitled Resume',
          updatedAt: resume.updatedAt || new Date().toISOString()
        })),
        pagination: result.pagination || {
          page: 1,
          limit: 9,
          totalCount: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
      throw error
    }
  }
}
