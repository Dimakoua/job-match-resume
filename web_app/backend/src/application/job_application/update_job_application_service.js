// application/job_application/update_job_application_service.js
import { z } from 'zod';

const updateJobApplicationSchema = z.object({
  id: z.string().min(1, 'Invalid job application ID'),
  userId: z.string().min(1, 'Invalid user ID'),
  status: z.enum(['saved', 'applied', 'interviewing', 'rejected', 'accepted', 'withdrawn']).optional(),
  appliedDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

export class UpdateJobApplicationService {
  constructor(jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  async execute(id, userId, updates) {
    // Validate input
    const validationResult = updateJobApplicationSchema.safeParse({ id, userId, ...updates });
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`);
    }

    // Find the application
    const application = await this.jobApplicationRepository.findById(id);
    if (!application) {
      throw new Error('Job application not found');
    }

    // Check ownership
    if (application.userId !== userId) {
      throw new Error('Access denied');
    }

    // Update fields
    if (updates.status !== undefined) {
      application.updateStatus(updates.status);
    }
    if (updates.appliedDate !== undefined) {
      application.updateAppliedDate(updates.appliedDate ? new Date(updates.appliedDate) : null);
    }
    if (updates.notes !== undefined) {
      application.updateNotes(updates.notes);
    }

    // Save
    await this.jobApplicationRepository.update(application);

    return {
      jobApplication: {
        id: application.id,
        userId: application.userId,
        jobSearchListId: application.jobSearchListId,
        resumeId: application.resumeId,
        company: application.company,
        position: application.position,
        jobDescription: application.jobDescription,
        status: application.status,
        appliedDate: application.appliedDate,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      }
    };
  }
}