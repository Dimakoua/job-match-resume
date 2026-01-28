export class ListResumesService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute(command) {
    if (!command.userId) {
      throw new Error('userId is required');
    }

    const resumes = await this.resumeRepository.findAllByUserId(command.userId);

    // Return headers for dashboard: id, title, updatedAt
    return resumes.map(resume => ({
      id: resume.id,
      title: resume.title,
      updatedAt: resume.updatedAt
    }));
  }
}