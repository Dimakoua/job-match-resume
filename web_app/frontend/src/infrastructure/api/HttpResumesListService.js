/**
 * HttpResumesListService
 * Fetches the list of user's saved resumes from the backend API
 */
import { axios } from '../lib/axios.js'

export class HttpResumesListService {
  /**
   * Fetch all resumes for the authenticated user
   * @returns {Promise<Array>} Array of resume summaries: { id, title, updatedAt }
   */
  async listResumes() {
    const response = await axios.get('/api/resumes')
    return response.data?.data?.resumes || []
  }
}
