// factory.js
import { fakeUser } from './domain/user/user_factory.js';
import { fakeResume } from './domain/resume/resume_factory.js';
import { fakeJobSearchList } from './domain/job_search_list/job_search_list_factory.js';
import { fakeTemplate } from './domain/template/template_factory.js';
import { UserRepository } from './domain/user/user_repository.js';
import { ResumeRepository } from './domain/resume/resume_repository.js';
import { JobSearchListRepository } from './domain/job_search_list/job_search_list_repository.js';
import { TemplateRepository } from './domain/template/template_repository.js';
import { D1UserRepository } from './adapters/repositories/user/d1_user_repository.js';
import { D1ResumeRepository } from './adapters/repositories/resume/d1_resume_repository.js';
import { D1JobSearchListRepository } from './adapters/repositories/job_search_list/d1_job_search_list_repository.js';

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
    this.templateRepo = new TemplateRepository();
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

  async fakeTemplate(opts = {}) {
    return await fakeTemplate(this.templateRepo, opts);
  }
}