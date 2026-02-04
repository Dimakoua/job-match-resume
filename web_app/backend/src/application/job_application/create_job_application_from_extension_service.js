// application/job_application/create_job_application_from_extension_service.js
import { JobApplication } from '../../domain/job_application/job_application.js';

export class CreateJobApplicationFromExtensionService {
  constructor(jobApplicationRepository, userRepository, jobSearchListRepository, createJobSearchListService) {
    this.jobApplicationRepository = jobApplicationRepository;
    this.userRepository = userRepository;
    this.jobSearchListRepository = jobSearchListRepository;
    this.createJobSearchListService = createJobSearchListService;
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

    // Get job search list - use provided or create current year's
    let jobSearchList;
    if (jobData.jobSearchListId) {
      // Verify the list exists and belongs to user
      jobSearchList = await this.jobSearchListRepository.findById(jobData.jobSearchListId);
      if (!jobSearchList || jobSearchList.userId !== userId) {
        throw new Error('Job search list not found or access denied');
      }
    } else {
      // Get or create current year's job search list
      const currentYear = new Date().getFullYear().toString();
      jobSearchList = await this.getOrCreateYearList(userId, currentYear);
    }

    // Create job application
    const jobApplication = new JobApplication(
      crypto.randomUUID(),
      userId,
      jobSearchList.id,
      jobData.resumeId || null,
      jobData.company?.trim() || 'Unknown Company',
      jobData.position?.trim() || 'Unknown Position',
      jobData.jobDescription.trim(),
      jobData.status || 'saved',
      jobData.appliedDate || null,
      jobData.notes?.trim() || jobData.url?.trim() || null
    );

    // Save to database
    await this.jobApplicationRepository.save(jobApplication);

    return jobApplication;
  }

  async getOrCreateYearList(userId, year) {
    // Try to find existing list for this year
    let list = await this.jobSearchListRepository.findByNameAndUserId(year, userId);

    if (!list) {
      // Create new list for this year
      list = await this.createJobSearchListService.execute({
        userId,
        name: year,
        description: `Job applications for ${year}`
      });
    }

    return list;
  }
}