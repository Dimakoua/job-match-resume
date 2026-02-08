// factory.js
import { fakeUser } from './domain/user/user_factory.js';
import { fakeResume } from './domain/resume/resume_factory.js';
import { fakeJobSearchList } from './domain/job_search_list/job_search_list_factory.js';
import { fakeJobApplication } from './domain/job_application/job_application_factory.js';
import { fakeTemplate } from './domain/template/template_factory.js';
import { UserRepository } from './domain/user/user_repository.js';
import { ResumeRepository } from './domain/resume/resume_repository.js';
import { JobSearchListRepository } from './domain/job_search_list/job_search_list_repository.js';
import { JobApplicationRepository } from './domain/job_application/job_application_repository.js';
import { TemplateRepository } from './domain/template/template_repository.js';
import { D1UserRepository } from './adapters/repositories/user/d1_user_repository.js';
import { D1ResumeRepository } from './adapters/repositories/resume/d1_resume_repository.js';
import { D1JobSearchListRepository } from './adapters/repositories/job_search_list/d1_job_search_list_repository.js';
import { D1JobApplicationRepository } from './adapters/repositories/job_application/d1_job_application_repository.js';
import { CreateJobSearchListService } from './application/job_search_list/create_job_search_list_service.js';
import { CreateJobApplicationFromExtensionService } from './application/job_application/create_job_application_from_extension_service.js';
import { ListJobApplicationsService } from './application/job_application/list_job_applications_service.js';
import { UpdateJobApplicationService } from './application/job_application/update_job_application_service.js';
import { DeleteJobApplicationService } from './application/job_application/delete_job_application_service.js';
import { ArchiveJobApplicationService } from './application/job_application/archive_job_application_service.js';
import { UnarchiveJobApplicationService } from './application/job_application/unarchive_job_application_service.js';

const words = [
  'apple', 'banana', 'cherry', 'dog', 'elephant', 'flower', 'garden', 'house',
  'island', 'jungle', 'kite', 'lemon', 'mountain', 'night', 'ocean', 'piano',
  'queen', 'river', 'sun', 'tree', 'umbrella', 'violin', 'window', 'xylophone',
  'yellow', 'zebra'
];

export function newUUID() {
  return crypto.randomUUID();
}

export function fakeEmail() {
  return `user-${newUUID()}@coffee-run.com`;
}

export function fakeRandomSentence(wordCount) {
  if (!Number.isInteger(wordCount) || wordCount <= 0) {
    throw new Error('wordCount must be a positive integer');
  }
  const selectedWords = Array.from({ length: wordCount }, () => words[Math.floor(Math.random() * words.length)]);
  return selectedWords.join(' ').replace(/^\w/, c => c.toUpperCase());
}

export class Factory {
  constructor(db) {
    this.db = db;
    this.userRepo = new UserRepository(new D1UserRepository(db));
    this.resumeRepo = new ResumeRepository(new D1ResumeRepository(db));
    this.jobSearchListRepo = new JobSearchListRepository(new D1JobSearchListRepository(db));
    this.jobApplicationRepo = new JobApplicationRepository(new D1JobApplicationRepository(db));
    this.templateRepo = new TemplateRepository();
    this.createJobSearchListService = new CreateJobSearchListService(this.jobSearchListRepo);
    this.createJobApplicationFromExtensionService = new CreateJobApplicationFromExtensionService(
      this.jobApplicationRepo,
      this.userRepo,
      this.jobSearchListRepo,
      this.createJobSearchListService
    );
    this.listJobApplicationsService = new ListJobApplicationsService(this.jobApplicationRepo);
    this.updateJobApplicationService = new UpdateJobApplicationService(this.jobApplicationRepo);
    this.deleteJobApplicationService = new DeleteJobApplicationService(this.jobApplicationRepo);
    this.archiveJobApplicationService = new ArchiveJobApplicationService(this.jobApplicationRepo);
    this.unarchiveJobApplicationService = new UnarchiveJobApplicationService(this.jobApplicationRepo);
  }

  async build(factoryName, opts = {}) {
    // Convert snake_case to camelCase: team_member -> teamMember
    const camelCaseName = factoryName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    const funcName = `fake${camelCaseName.charAt(0).toUpperCase() + camelCaseName.slice(1)}`;
    if (typeof this[funcName] === 'function') {
      return await this[funcName](opts);
    }
    throw new Error(`Unknown factory: ${factoryName}`);
  }

  async insert(factoryName, opts = {}) {
    return await this.build(factoryName, { ...opts, persisted: true });
  }

  async fakeUser(opts = {}) {
    return await fakeUser(this.userRepo, opts);
  }

  async fakeResume(opts = {}) {
    return await fakeResume(this.resumeRepo, opts);
  }

  async fakeJobSearchList(opts = {}) {
    return await fakeJobSearchList(this.jobSearchListRepo, opts);
  }

  async fakeJobApplication(opts = {}) {
    return await fakeJobApplication(this.jobApplicationRepo, opts);
  }

  async fakeTemplate(opts = {}) {
    return await fakeTemplate(this.templateRepo, opts);
  }
}