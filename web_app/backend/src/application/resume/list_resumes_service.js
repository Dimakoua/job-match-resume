export class ListResumesService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute(command) {
    if (!command.userId) {
      throw new Error('userId is required');
    }

    const { page = 1, limit = 9 } = command;
    const offset = (page - 1) * limit;

    // Get paginated resumes and total count
    const [resumes, totalCount] = await Promise.all([
      this.resumeRepository.findAllByUserId(command.userId, { limit, offset }),
      this.resumeRepository.countByUserId(command.userId)
    ]);

    // Return headers for dashboard: id, title, updatedAt
    const resumeHeaders = resumes.map(resume => ({
      id: resume.id,
      title: resume.title,
      updatedAt: resume.updatedAt
    }));

    return {
      resumes: resumeHeaders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };
  }
}