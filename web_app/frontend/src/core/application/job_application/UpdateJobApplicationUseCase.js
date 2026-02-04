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
   * @param {string} command.id - The application ID to update
   * @param {string} command.userId - The user making the update
   * @param {string} [command.status] - New status
   * @param {Date} [command.appliedDate] - New applied date
   * @param {string} [command.notes] - New notes
   * @returns {Promise<JobApplication>} - The updated job application
   */
  async execute(command) {
    // Validate command
    if (!command.id) {
      throw new Error('id is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }

    // Find the application
    const application = await this.jobApplicationRepository.findById(command.id);
    if (!application) {
      throw new Error('Job application not found');
    }

    // Check ownership
    if (application.userId !== command.userId) {
      throw new Error('Access denied');
    }

    // Update fields if provided
    if (command.status !== undefined) {
      application.updateStatus(command.status);
    }
    if (command.appliedDate !== undefined) {
      application.updateAppliedDate(command.appliedDate);
    }
    if (command.notes !== undefined) {
      application.updateNotes(command.notes);
    }

    // Save
    const updatedApplication = await this.jobApplicationRepository.update(application);

    return updatedApplication;
  }
}