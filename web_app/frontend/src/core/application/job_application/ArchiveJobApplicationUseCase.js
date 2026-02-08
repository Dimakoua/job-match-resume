// core/application/job_application/ArchiveJobApplicationUseCase.js
export class ArchiveJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute({ id, userId }) {
    if (!id || !userId) {
      throw new Error('Job application ID and user ID are required');
    }

    return await this.jobApplicationRepository.archive(id, userId);
  }
}