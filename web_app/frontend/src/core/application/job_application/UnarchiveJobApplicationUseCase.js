// core/application/job_application/UnarchiveJobApplicationUseCase.js
export class UnarchiveJobApplicationUseCase {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute({ id, userId }) {
    if (!id || !userId) {
      throw new Error('Job application ID and user ID are required');
    }

    return await this.jobApplicationRepository.unarchive(id, userId);
  }
}