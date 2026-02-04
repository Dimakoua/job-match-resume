/**
 * UpdateJobApplicationUseCase
 *
 * Orchestrates updating a job application.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class UpdateJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  /**
   * Execute the update
   * @param {Object} command
   * @param {JobApplication} command.application - The application to update
   * @returns {Promise<JobApplication>} - The updated job application
   */
  async execute(command) {
    // Validate command
    if (!command.application) {
      throw new Error('application is required');
    }

    const application = command.application;

    // Find the existing application
    const existingApp = await this.jobApplicationRepository.findById(application.id);
    if (!existingApp) {
      throw new Error('Job application not found');
    }

    // Check ownership
    if (existingApp.userId !== application.userId) {
      throw new Error('Access denied');
    }

    // Save
    const updatedApplication = await this.jobApplicationRepository.update(application);

    return updatedApplication;
  }
}