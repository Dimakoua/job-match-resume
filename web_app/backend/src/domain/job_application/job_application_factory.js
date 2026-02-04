// domain/job_application/job_application_factory.js
import { newUUID, fakeRandomSentence } from '../../factory.js';
import { JobApplication } from './job_application.js';

export async function fakeJobApplication(repo, opts = {}) {
  const jobApplication = new JobApplication(
    opts.id || newUUID(),
    opts.userId || newUUID(),
    opts.jobSearchListId || null,
    opts.resumeId || null,
    opts.company || fakeRandomSentence(2),
    opts.position || fakeRandomSentence(3),
    opts.jobDescription || fakeRandomSentence(10),
    opts.status || 'saved',
    opts.appliedDate || null,
    opts.notes || null
  );

  if (opts.persisted) {
    await repo.save(jobApplication);
  }

  return jobApplication;
}