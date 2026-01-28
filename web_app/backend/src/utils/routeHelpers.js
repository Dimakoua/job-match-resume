// backend/src/utils/routeHelpers.js
import { createDependencies } from '../dependencies.js';

/**
 * Helper to create dependencies and instantiate a controller with common setup.
 * @param {Object} env - Cloudflare Worker env
 * @param {Function} ControllerClass - The controller class (e.g., AuthController)
 * @param {Array} extraArgs - Additional args for the controller constructor (e.g., [env.JWT_SECRET])
 * @returns {Object} { deps, controller }
 */
export function createController(env, ControllerClass, extraArgs = []) {
  const deps = createDependencies(env);
  const controller = new ControllerClass(deps, ...extraArgs);
  return { deps, controller };
}