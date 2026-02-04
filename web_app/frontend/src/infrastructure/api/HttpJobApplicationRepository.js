/**
 * HttpJobApplicationRepository
 *
 * HTTP implementation of the JobApplication repository.
 * Per technical_design.md §3.2C: "Adapters are injected dependencies."
 */
import { axios } from '../lib/axios.js';
import { JobApplication } from '../../core/domain/job_application/JobApplication.js';

export class HttpJobApplicationRepository {
  /**
   * Save a job application
   * @param {JobApplication} application - The application to save
   * @returns {Promise<JobApplication>} - The saved application with backend-generated ID
   */
  async save(application) {
    const response = await axios.post('/api/job-applications', {
      jobSearchListId: application.jobSearchListId,
      resumeId: application.resumeId,
      company: application.company,
      position: application.position,
      jobDescription: application.jobDescription,
      status: application.status,
      notes: application.notes
    });
    // Return the created application from backend response
    const data = response.data.data.jobApplication;
    return new JobApplication(
      data.id,
      data.userId,
      data.jobSearchListId,
      data.resumeId,
      data.company,
      data.position,
      data.jobDescription,
      data.status,
      data.appliedDate ? new Date(data.appliedDate) : null,
      data.notes
    );
  }

  /**
   * Find a job application by ID
   * @param {string} id - The application ID
   * @returns {Promise<JobApplication|null>} - The application or null
   */
  async findById(id) {
    try {
      const response = await axios.get(`/api/job-applications/${id}`);
      const data = response.data.data.jobApplication;
      return new JobApplication(
        data.id,
        data.userId,
        data.jobSearchListId,
        data.resumeId,
        data.company,
        data.position,
        data.jobDescription,
        data.status,
        data.appliedDate ? new Date(data.appliedDate) : null,
        data.notes
      );
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find all job applications for a job search list
   * @param {string} jobSearchListId - The job search list ID
   * @param {string} userId - The user ID (for authorization)
   * @returns {Promise<JobApplication[]>} - Array of applications
   */
  async findAllByJobSearchListId(jobSearchListId, userId) {
    const response = await axios.get(`/api/job-applications?jobSearchListId=${jobSearchListId}`);
    return response.data.data.jobApplications.map(app =>
      new JobApplication(
        app.id,
        app.userId,
        app.jobSearchListId,
        app.resumeId,
        app.company,
        app.position,
        app.jobDescription,
        app.status,
        app.appliedDate ? new Date(app.appliedDate) : null,
        app.notes
      )
    );
  }

  /**
   * Update a job application
   * @param {JobApplication} application - The application to update
   * @returns {Promise<JobApplication>} - The updated application
   */
  async update(application) {
    const response = await axios.put(`/api/job-applications/${application.id}`, {
      status: application.status,
      appliedDate: application.appliedDate,
      notes: application.notes
    });
    // Return the updated application from backend response
    const data = response.data.data.jobApplication;
    return new JobApplication(
      data.id,
      data.userId,
      data.jobSearchListId,
      data.resumeId,
      data.company,
      data.position,
      data.jobDescription,
      data.status,
      data.appliedDate ? new Date(data.appliedDate) : null,
      data.notes
    );
  }

  /**
   * Delete a job application by ID
   * @param {string} id - The application ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    await axios.delete(`/api/job-applications/${id}`);
  }
}