// domain/job_search_list/job_search_list_factory.js
import { newUUID, fakeRandomSentence } from '../../factory.js';
import { JobSearchList } from './job_search_list.js';

export async function fakeJobSearchList(repo, opts = {}) {
  const jobSearchList = new JobSearchList(
    opts.id || newUUID(),
    opts.userId || newUUID(),
    opts.name || fakeRandomSentence(2),
    opts.description || null
  );

  if (opts.persisted) {
    await repo.save(jobSearchList);
  }

  return jobSearchList;
}