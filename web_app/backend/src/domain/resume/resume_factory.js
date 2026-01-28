// domain/resume/resume_factory.js
import { newUUID, fakeRandomSentence } from '../../factory.js';
import { Resume } from './resume.js';

export async function fakeResume(repo, opts = {}) {
  const resume = new Resume(
    opts.id || newUUID(),
    opts.userId || newUUID(),
    opts.title || fakeRandomSentence(2),
    opts.sections || [
      { type: 'experience', data: { company: 'Test Company' } },
      { type: 'education', data: { degree: 'Test Degree' } }
    ],
    opts.templateId || null
  );

  if (opts.persisted) {
    await repo.save(resume);
  }

  return resume;
}