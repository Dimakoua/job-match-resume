/**
 * CreateJobApplicationUseCase
 *
 * Orchestrates creating a new job application.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
import { JobApplication } from '../../domain/job_application/JobApplication.js';

export class CreateJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  /**
   * Execute the creation
   * @param {Object} command
   * @param {string} command.userId - The user creating the application
   * @param {string} command.jobSearchListId - The job search list ID
   * @param {string} command.resumeId - The resume ID
   * @param {string} command.company - The company name
   * @param {string} command.position - The position title
   * @param {string} command.jobDescription - The job description
   * @param {string} [command.status] - The application status (default: 'saved')
   * @param {string} [command.notes] - Optional notes
   * @returns {Promise<JobApplication>} - The created job application
   */
  async execute(command) {
    // Validate command
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (!command.jobSearchListId) {
      throw new Error('jobSearchListId is required');
    }
    // resumeId is optional
    if (!command.company) {
      throw new Error('company is required');
    }
    if (!command.position) {
      throw new Error('position is required');
    }
    if (!command.jobDescription) {
      throw new Error('jobDescription is required');
    }

    // Generate ID
    const id = crypto.randomUUID();

    // Create application
    const application = new JobApplication(
      id,
      command.userId,
      command.jobSearchListId,
      command.resumeId || null,
      command.company,
      command.position,
      command.jobDescription,
      command.status || 'saved',
      command.appliedDate || null,
      command.notes || null
    );

    // Save
    const savedApplication = await this.jobApplicationRepository.save(application);

    return savedApplication;
  }
}