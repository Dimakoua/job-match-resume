// application/job_application/unarchive_job_application_service.js
export class UnarchiveJobApplicationService {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute(id, userId) {
    // Verify the job application exists and belongs to the user
    const jobApplication = await this.jobApplicationRepository.findById(id);
    if (!jobApplication) {
      throw new Error('Job application not found');
    }
    if (jobApplication.userId !== userId) {
      throw new Error('Access denied');
    }

    // Unarchive the job application
    const success = await this.jobApplicationRepository.unarchiveById(id, userId);
    if (!success) {
      throw new Error('Failed to unarchive job application');
    }

    return { success: true, message: 'Job application unarchived successfully' };
  }
}