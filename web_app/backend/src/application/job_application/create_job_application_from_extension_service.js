// application/job_application/create_job_application_from_extension_service.js
import { JobApplication } from '../../domain/job_application/job_application.js';

export class CreateJobApplicationFromExtensionService {
  constructor(jobApplicationRepository, userRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
    this.userRepository = userRepository;
  }

  async execute(userId, jobData) {
    // Validate input
    if (!jobData || typeof jobData !== 'object') {
      throw new Error('Job data is required');
    }

    if (!('jobDescription' in jobData) || jobData.jobDescription === null || jobData.jobDescription === undefined) {
      throw new Error('Job description is required');
    }

    if (typeof jobData.jobDescription !== 'string') {
      throw new Error('Job description must be a string');
    }

    if (jobData.jobDescription.trim().length === 0) {
      throw new Error('Job description cannot be empty');
    }

    if (jobData.jobDescription.length > 10000) {
      throw new Error('Job description is too long (maximum 10000 characters)');
    }

    // Validate optional fields
    if (jobData.company && (typeof jobData.company !== 'string' || jobData.company.length > 200)) {
      throw new Error('Company must be a string with maximum 200 characters');
    }

    if (jobData.position && (typeof jobData.position !== 'string' || jobData.position.length > 200)) {
      throw new Error('Position must be a string with maximum 200 characters');
    }

    if (jobData.url && (typeof jobData.url !== 'string' || jobData.url.length > 1000)) {
      throw new Error('URL must be a string with maximum 1000 characters');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create job application
    const jobApplication = new JobApplication(
      crypto.randomUUID(),
      userId,
      null, // jobSearchListId - can be set later
      null, // resumeId - can be linked later
      jobData.company?.trim() || null,
      jobData.position?.trim() || null,
      jobData.jobDescription.trim(),
      'saved', // status - always start as saved
      null, // appliedDate - not applied yet
      jobData.url?.trim() || null // notes field can store the URL
    );

    // Save to database
    await this.jobApplicationRepository.save(jobApplication);

    return jobApplication;
  }
}