// factory.js
import { fakeUser } from './domain/user/user_factory.js';

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
}