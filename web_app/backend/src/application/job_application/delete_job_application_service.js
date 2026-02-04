// application/job_application/delete_job_application_service.js
import { z } from 'zod';

const deleteJobApplicationSchema = z.object({
  id: z.string().min(1, 'Invalid job application ID'),
  userId: z.string().min(1, 'Invalid user ID'),
});

export class DeleteJobApplicationService {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute(id, userId) {
    // Validate input
    const validationResult = deleteJobApplicationSchema.safeParse({ id, userId });
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Delete the application
    const deleted = await this.jobApplicationRepository.deleteById(id, userId);
    if (!deleted) {
      throw new Error('Job application not found or access denied');
    }

    return { success: true };
  }
}