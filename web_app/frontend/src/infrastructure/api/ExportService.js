/**
 * ExportService
 * 
 * Handles API communication for exporting/downloading resumes.
 * Per technical_design.md §3.2C: "Adapters are injected dependencies."
 */
import { axios } from '../lib/axios.js';

export class ExportService {
  /**
   * Download a resume in PDF or DOCX format
   * @param {string} resumeId - The resume ID to download
   * @param {string} format - 'pdf' or 'docx'
   * @returns {Promise<void>} - Triggers browser download
   * @throws {Error} - On API failure or network error
   */
  async downloadResume(resumeId, format) {
    try {
      // Request binary data from backend
      const response = await axios.get(`/api/resumes/${resumeId}/export?format=${format}`, {
        responseType: 'blob', // Critical: tell axios to return binary data
      });

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = this._extractFilename(contentDisposition, format);

      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      // Create temporary URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download resume:', error);
      throw new Error(
        error.response?.status === 404
          ? 'Resume not found'
          : error.response?.status === 403
            ? 'You do not have access to this resume'
            : 'Failed to download resume. Please try again.'
      );
    }
  }

  /**
   * Extract filename from Content-Disposition header
   * @private
   * @param {string} contentDisposition - The header value
   * @param {string} format - The format ('pdf' or 'docx')
   * @returns {string} - The filename
   */
  _extractFilename(contentDisposition, format) {
    if (!contentDisposition) {
      return `resume.${format}`;
    }

    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    return filenameMatch && filenameMatch[1] ? filenameMatch[1] : `resume.${format}`;
  }
}
