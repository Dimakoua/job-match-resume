// application/job_application/update_job_application_service.js
import { z } from 'zod';

const updateJobApplicationSchema = z.object({
  id: z.string().min(1, 'Invalid job application ID'),
  userId: z.string().min(1, 'Invalid user ID'),
  company: z.string().max(200, 'Company must be less than 200 characters'),
  position: z.string().max(200, 'Position must be less than 200 characters'),
  jobDescription: z.string().min(1, 'Job description is required').max(10000, 'Job description must be less than 10000 characters'),
  status: z.enum(['saved', 'applied', 'interviewing', 'rejected', 'accepted', 'withdrawn']).optional(),
  appliedDate: z.union([z.string().datetime(), z.null()]).optional(),
  notes: z.union([z.string().max(1000, 'Notes must be less than 1000 characters'), z.null()]).optional(),
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
    if (updates.company !== undefined) {
      application.updateCompany(updates.company);
    }
    if (updates.position !== undefined) {
      application.updatePosition(updates.position);
    }
    if (updates.jobDescription !== undefined) {
      application.updateJobDescription(updates.jobDescription);
    }
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