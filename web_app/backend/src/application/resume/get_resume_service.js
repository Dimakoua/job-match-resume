// application/resume/get_resume_service.js
export class GetResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute(resumeId, userId) {
    if (!resumeId) {
      throw new Error('Resume ID is required');
    }

    const resume = await this.resumeRepository.findById(resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Verify ownership - user can only access their own resumes
    if (resume.userId !== userId) {
      throw new Error('Unauthorized: You do not have permission to access this resume');
    }

    return {
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      sections: resume.sections,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    };
  }
}
