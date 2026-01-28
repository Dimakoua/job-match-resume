// domain/user/user_factory.js
import { fakeEmail, newUUID } from '../../factory.js';
import { User } from './user.js';

export async function fakeUser(repo, opts = {}) {
  const user = new User(
    opts.id || newUUID(),
    opts.email || fakeEmail(),
    opts.name || 'Test User',
    opts.passwordHash || '$2a$10$fakeHashForTesting1234567890123456789012'
  );

  if (opts.persisted) {
    await repo.save(user);
  }

  return user;
}