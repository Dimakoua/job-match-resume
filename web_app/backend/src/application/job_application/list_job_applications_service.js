// application/job_application/list_job_applications_service.js
import { z } from 'zod';

const listJobApplicationsSchema = z.object({
  jobSearchListId: z.union([z.string().min(1, 'Invalid job search list ID'), z.undefined()]),
  userId: z.string().min(1, 'Invalid user ID'),
});

export class ListJobApplicationsService {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute(jobSearchListId, userId) {
    // Validate input
    const validationResult = listJobApplicationsSchema.safeParse({ jobSearchListId, userId });
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Get applications
    const applications = await this.jobApplicationRepository.findByUserId(userId, {
      jobSearchListId: jobSearchListId
    });

    return {
      applications: applications.map(app => ({
        id: app.id,
        userId: app.userId,
        jobSearchListId: app.jobSearchListId,
        resumeId: app.resumeId,
        company: app.company,
        position: app.position,
        jobDescription: app.jobDescription,
        status: app.status,
        appliedDate: app.appliedDate,
        notes: app.notes,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
      }))
    };
  }
}