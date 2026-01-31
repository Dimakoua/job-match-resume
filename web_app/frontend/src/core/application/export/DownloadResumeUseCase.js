/**
 * DownloadResumeUseCase
 * 
 * Orchestrates the download of a resume in PDF or DOCX format.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class DownloadResumeUseCase {
  constructor(exportService) {
    this.exportService = exportService;
  }

  /**
   * Execute the download
   * @param {Object} command
   * @param {string} command.resumeId - The resume to download
   * @param {string} command.format - 'pdf' or 'docx'
   * @returns {Promise<void>} - Triggers download in the browser
   */
  async execute(command) {
    const { resumeId, format } = command;

    // Validate input
    if (!resumeId || !format) {
      throw new Error('Resume ID and format are required');
    }

    if (!['pdf', 'docx'].includes(format)) {
      throw new Error('Format must be either "pdf" or "docx"');
    }

    // Delegate to service
    return this.exportService.downloadResume(resumeId, format);
  }
}
