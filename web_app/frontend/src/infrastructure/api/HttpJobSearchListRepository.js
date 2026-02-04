/**
 * HttpJobSearchListRepository
 *
 * HTTP implementation of the JobSearchList repository.
 * Per technical_design.md §3.2C: "Adapters are injected dependencies."
 */
import { axios } from '../lib/axios.js';
import { JobSearchList } from '../../core/domain/job_search_list/JobSearchList.js';

export class HttpJobSearchListRepository {
  /**
   * Save a job search list
   * @param {JobSearchList} list - The list to save
   * @returns {Promise<JobSearchList>} - The saved list with backend-generated ID
   */
  async save(list) {
    const response = await axios.post('/api/lists', {
      name: list.name,
      description: list.description
    });
    // Return the created list from backend response
    const data = response.data.data.list;
    return new JobSearchList(data.id, data.userId || list.userId, data.name, data.description, data.applicationCount || 0);
  }

  /**
   * Find a job search list by ID
   * @param {string} id - The list ID
   * @returns {Promise<JobSearchList|null>} - The list or null
   */
  async findById(id) {
    try {
      const response = await axios.get(`/api/lists/${id}`);
      const data = response.data.data.list;
      return new JobSearchList(data.id, data.userId, data.name, data.description, data.applicationCount || 0);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find all job search lists for a user
   * @param {string} userId - The user ID
   * @returns {Promise<JobSearchList[]>} - Array of lists
   */
  async findAllByUserId(userId) {
    const response = await axios.get('/api/lists');
    return response.data.data.lists.map(list => 
      new JobSearchList(list.id, list.userId, list.name, list.description, list.applicationCount || 0)
    );
  }

  /**
   * Find a job search list by name and user ID
   * @param {string} name - The list name
   * @param {string} userId - The user ID
   * @returns {Promise<JobSearchList|null>} - The list or null
   */
  async findByNameAndUserId(name, userId) {
    // This might not be needed for the frontend, but implementing for completeness
    const lists = await this.findAllByUserId(userId);
    return lists.find(list => list.name === name) || null;
  }

  /**
   * Update a job search list
   * @param {JobSearchList} list - The list to update
   * @returns {Promise<JobSearchList>} - The updated list
   */
  async update(list) {
    const response = await axios.put(`/api/lists/${list.id}`, {
      name: list.name,
      description: list.description
    });
    // Return the updated list from backend response
    const data = response.data.data.list;
    return new JobSearchList(data.id, data.userId || list.userId, data.name, data.description, data.applicationCount || 0);
  }

  /**
   * Delete a job search list by ID
   * @param {string} id - The list ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await axios.delete(`/api/lists/${id}`);
  }
}