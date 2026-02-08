// application/job_application/archive_job_application_service.js
export class ArchiveJobApplicationService {
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

    // Archive the job application
    const success = await this.jobApplicationRepository.archiveById(id, userId);
    if (!success) {
      throw new Error('Failed to archive job application');
    }

    return { success: true, message: 'Job application archived successfully' };
  }
}