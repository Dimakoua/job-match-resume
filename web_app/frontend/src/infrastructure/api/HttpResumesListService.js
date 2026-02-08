/**
 * HttpResumesListService
 * Fetches the list of user's saved resumes from the backend API
 */
import { axios } from '../lib/axios.js'

export class HttpResumesListService {
  /**
   * Fetch resumes for the authenticated user with pagination
   * @param {Object} options - Pagination options
   * @param {number} options.page - Page number (1-based)
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<Object>} Object with resumes array and pagination info
   */
  async listResumes(options = {}) {
    const { page = 1, limit = 9 } = options;
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });

    const response = await axios.get(`/api/resumes?${params}`)
    return response.data?.data || { resumes: [], pagination: { page: 1, limit: 9, totalCount: 0, totalPages: 0, hasNext: false, hasPrev: false } }
  }
}
