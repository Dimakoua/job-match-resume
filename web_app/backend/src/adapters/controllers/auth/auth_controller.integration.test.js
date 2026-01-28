import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth_controller.js';
import { Factory } from '../../../factory.js';
import { SignUpUserService } from '../../../application/sign_up_user/sign_up_user_service.js';
import { LoginUserService } from '../../../application/login_user/login_user_service.js';
import { UpdateUserService } from '../../../application/update_user/update_user_service.js';
import { GetUserProfileService } from '../../../application/get_user_profile/get_user_profile_service.js';
import { D1UserRepository } from '../../../adapters/repositories/user/d1_user_repository.js';
import { D1OrderRepository } from '../../../adapters/repositories/order/d1_order_repository.js';

describe('AuthController Integration Tests', () => {
  let controller;
  let factory;
  let db;

  beforeEach(() => {
    db = global.DB;
    if (!db) {
      controller = null;
      factory = null;
      return;
    }
    const userRepository = new D1UserRepository(db);
    const signUpService = new SignUpUserService(userRepository);
    const loginService = new LoginUserService(userRepository, 'test_jwt_secret');
    const updateUserService = new UpdateUserService(userRepository);
    const getUserProfileService = new GetUserProfileService(userRepository);
    const deps = {
      signUpService,
      loginService,
      updateUserService,
      getUserProfileService,
    };
    controller = new AuthController(deps, 'test_jwt_secret');
    factory = new Factory(db);
    
  });

  it('should create a user and return 201 on successful sign up', async () => {
    

    const email = `integration${crypto.randomUUID()}@example.com`;
    const name = 'Integration Test User';
    const password = 'password123';

    const request = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };

    const response = await controller.signUp(request);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(email);
    expect(body.data.user.name).toBe(name);
    expect(body.data.user.id).toBeDefined();
    expect(body.data.token).toBeDefined();
    expect(typeof body.data.token).toBe('string');

    // Verify user was saved to database
    const savedUser = await db.prepare('SELECT * FROM Users WHERE email = ?').bind(email).first();
    expect(savedUser).not.toBeNull();
    expect(savedUser.email).toBe(email);
    expect(savedUser.name).toBe(name);
    expect(savedUser.password_hash).toBeDefined();
    expect(savedUser.password_hash).not.toBe(password); // Should be hashed
  });

  it('should return 409 when email already exists', async () => {
    

    const email = `duplicate${crypto.randomUUID()}@example.com`;
    const name = 'Duplicate Test User';
    const password = 'password123';

    // First sign up
    const request1 = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };
    const response1 = await controller.signUp(request1);
    expect(response1.status).toBe(201);

    // Second sign up with same email
    const request2 = {
      json: async () => ({
        email,
        name: 'Different Name',
        password,
      }),
    };
    const response2 = await controller.signUp(request2);

    expect(response2.status).toBe(409);
    const body = await response2.json();
    expect(body.error.code).toBe('EMAIL_IN_USE');
  });

  it('should return 400 for invalid request data', async () => {
    

    const request = {
      json: async () => ({
        email: 'invalid-email',
        name: '',
        password: 'short',
      }),
    };

    const response = await controller.signUp(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should update user profile successfully', async () => {
    

    const email = `update${crypto.randomUUID()}@example.com`;
    const name = 'Update Test User';
    const password = 'password123';

    // First sign up
    const signUpRequest = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };
    const signUpResponse = await controller.signUp(signUpRequest);
    expect(signUpResponse.status).toBe(201);
    const signUpBody = await signUpResponse.json();
    const token = signUpBody.data.token;
    const userId = signUpBody.data.user.id;

    // Now update profile
    const updateRequest = {
      headers: {
        get: (header) => header === 'authorization' ? `Bearer ${token}` : null,
      },
      json: async () => ({
        name: 'Updated Name',
      }),
    };

    // Mock authenticate to return the user ID
    controller.authenticate = vi.fn().mockResolvedValue(userId);

    const updateResponse = await controller.updateUser(updateRequest);

    expect(updateResponse.status).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.user.id).toBe(userId);
    expect(updateBody.data.user.email).toBe(email);
    expect(updateBody.data.user.name).toBe('Updated Name');

    // Verify in database
    const updatedUser = await db.prepare('SELECT * FROM Users WHERE id = ?').bind(userId).first();
    expect(updatedUser.name).toBe('Updated Name');
  });

  it('should update user password successfully', async () => {
    

    const email = `updatepass${crypto.randomUUID()}@example.com`;
    const name = 'Update Password User';
    const password = 'password123';

    // First sign up
    const signUpRequest = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };
    const signUpResponse = await controller.signUp(signUpRequest);
    expect(signUpResponse.status).toBe(201);
    const signUpBody = await signUpResponse.json();
    const token = signUpBody.data.token;
    const userId = signUpBody.data.user.id;

    // Get original password hash before update
    const originalUser = await db.prepare('SELECT * FROM Users WHERE id = ?').bind(userId).first();
    const originalHash = originalUser.password_hash;

    // Now update password
    const updateRequest = {
      headers: {
        get: (header) => header === 'authorization' ? `Bearer ${token}` : null,
      },
      json: async () => ({
        password: 'newpassword456',
      }),
    };

    // Mock authenticate to return the user ID
    controller.authenticate = vi.fn().mockResolvedValue(userId);

    const updateResponse = await controller.updateUser(updateRequest);

    expect(updateResponse.status).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.success).toBe(true);
    expect(updateBody.data.user.id).toBe(userId);
    expect(updateBody.data.user.email).toBe(email);
    expect(updateBody.data.user.name).toBe(name);

    // Verify password was updated in database (hash changed)
    const updatedUser = await db.prepare('SELECT * FROM Users WHERE id = ?').bind(userId).first();
    expect(updatedUser.password_hash).not.toBeUndefined();
    // Should be different from original hash
    expect(updatedUser.password_hash).not.toBe(originalHash);
  });

  it('should return 401 for missing auth token on update', async () => {
    

    const updateRequest = {
      headers: {
        get: () => null,
      },
      json: async () => ({
        name: 'Updated Name',
      }),
    };

    const updateResponse = await controller.updateUser(updateRequest);

    expect(updateResponse.status).toBe(401);
  });

  it('should return 400 for invalid update data', async () => {
    

    const email = `invalidupdate${crypto.randomUUID()}@example.com`;
    const name = 'Invalid Update User';
    const password = 'password123';

    // First sign up
    const signUpRequest = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };
    const signUpResponse = await controller.signUp(signUpRequest);
    expect(signUpResponse.status).toBe(201);
    const signUpBody = await signUpResponse.json();
    const token = signUpBody.data.token;
    const userId = signUpBody.data.user.id;

    // Now try invalid update
    const updateRequest = {
      headers: {
        get: (header) => header === 'authorization' ? `Bearer ${token}` : null,
      },
      json: async () => ({
        name: '', // Invalid
      }),
    };

    // Mock authenticate to return the user ID
    controller.authenticate = vi.fn().mockResolvedValue(userId);

    const updateResponse = await controller.updateUser(updateRequest);

    expect(updateResponse.status).toBe(400);
    const updateBody = await updateResponse.json();
    expect(updateBody.error.code).toBe('VALIDATION_ERROR');
  });


  it('should get user profile with valid JWT', async () => {
    

    const email = `profile${crypto.randomUUID()}@example.com`;
    const name = 'Profile Test User';
    const password = 'password123';

    // Sign up user
    const signUpRequest = {
      json: async () => ({
        email,
        name,
        password,
      }),
    };
    const signUpResponse = await controller.signUp(signUpRequest);
    expect(signUpResponse.status).toBe(201);

    // Login to get token
    const loginRequest = {
      json: async () => ({
        email,
        password,
      }),
    };
    const loginResponse = await controller.login(loginRequest);
    expect(loginResponse.status).toBe(200);
    const loginBody = await loginResponse.json();
    const token = loginBody.data.token;
    const userId = loginBody.data.user.id;

    // Get profile
    const profileRequest = {
      headers: {
        get: (header) => header === 'Authorization' ? `Bearer ${token}` : null,
      },
    };

    // Mock authenticate to return the user ID
    controller.authenticate = vi.fn().mockResolvedValue(userId);

    const profileResponse = await controller.getUserProfile(profileRequest);

    expect(profileResponse.status).toBe(200);
    const profileBody = await profileResponse.json();
    expect(profileBody.success).toBe(true);
    expect(profileBody.data.profile).toHaveProperty('id');
    expect(profileBody.data.profile.email).toBe(email);
    expect(profileBody.data.profile.name).toBe(name);
    expect(profileBody.data.profile).not.toHaveProperty('passwordHash');
  });

  it('should return 401 for getUserProfile without auth', async () => {
    

    // Mock authenticate to throw 401 for this test
    controller.authenticate = vi.fn().mockImplementation(() => {
      throw new Response(JSON.stringify({ error: { code: 'Unauthorized', message: 'Authentication required' } }), { status: 401 });
    });

    const profileRequest = {
      headers: {
        get: () => null, // No auth header
      },
    };

    const profileResponse = await controller.getUserProfile(profileRequest);

    expect(profileResponse.status).toBe(401);
  });

});