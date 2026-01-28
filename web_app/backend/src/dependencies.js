/**
 * Dependency Injection Container
 */

import { SignUpUserService } from './application/sign_up_user/sign_up_user_service.js';
import { LoginUserService } from './application/login_user/login_user_service.js';
import { D1UserRepository } from './adapters/repositories/user/d1_user_repository.js';
import { UserRepository } from './domain/user/user_repository.js';

/**
 * Creates and returns all application dependencies
 * @param {Object} env - Cloudflare Worker environment
 * @returns {Object} Dependencies object
 */
export function createDependencies(env) {
  if(!env.JWT_SECRET){
    throw new Error('JWT_SECRET is required');
  }

  const jwt_secret = env.JWT_SECRET;
  const userRepositoryImplementation = new D1UserRepository(env.DB);
  const userRepository = new UserRepository(userRepositoryImplementation);

  const signUpService = new SignUpUserService(userRepository);
  const loginService = new LoginUserService(userRepository, jwt_secret);
  return {
    userRepository,
    signUpService,
    loginService
  };
}