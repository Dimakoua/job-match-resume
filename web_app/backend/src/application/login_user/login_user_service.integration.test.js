import { describe, it, expect, beforeEach } from 'vitest';
import { LoginUserService } from './login_user_service.js';
import { SignUpUserService } from '../sign_up_user/sign_up_user_service.js';
import { D1UserRepository } from '../../adapters/repositories/user/d1_user_repository.js';

describe('LoginUserService Integration Tests', () => {
  let loginService;
  let signUpService;
  let db;

  beforeEach(async () => {
    db = global.DB;
    if (!db) {
      loginService = null;
      signUpService = null;
      return;
    }

    // Clean the test database
    await db.prepare('DELETE FROM Users').run();
    const repo = new D1UserRepository(db);
    loginService = new LoginUserService(repo, 'integration_secret', 'integration_salt');
    signUpService = new SignUpUserService(repo, 'integration_salt');
  });

  afterAll(async () => {
    if (db) {
      // Clean up after all tests
      await db.prepare('DELETE FROM Users').run();
    }
  });

  it('should login successfully with valid credentials in real DB', async () => {
    if (!loginService || !signUpService) return;
    const email = `login_integration${Date.now()}@example.com`;
    const password = 'password123';

    // First, sign up the user
    const signUpCommand = { email, name: 'Integration User', password };
    const signedUpUser = await signUpService.execute(signUpCommand);

    // Now, login
    const loginCommand = { email, password };
    const result = await loginService.execute(loginCommand);

    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(signedUpUser.id);
    expect(result.user.email).toBe(email);
    expect(result.user.name).toBe('Integration User');
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
    expect(result.token.length).toBeGreaterThan(0);
  });

  it('should throw error for non-existent email in real DB', async () => {
    if (!loginService) return;
    const loginCommand = { email: 'nonexistent@example.com', password: 'password' };

    await expect(loginService.execute(loginCommand)).rejects.toThrow('Invalid email or password');
  });

  it('should throw error for invalid password in real DB', async () => {
    if (!loginService || !signUpService) return;
    const email = `invalid_pass${Date.now()}@example.com`;
    const correctPassword = 'correct123';

    // Sign up with correct password
    const signUpCommand = { email, name: 'Test User', password: correctPassword };
    await signUpService.execute(signUpCommand);

    // Try to login with wrong password
    const loginCommand = { email, password: 'wrongpassword' };
    await expect(loginService.execute(loginCommand)).rejects.toThrow('Invalid email or password');
  });
});