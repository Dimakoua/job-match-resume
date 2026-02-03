import { getPlatformProxy } from 'wrangler';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { cleanTestDatabase } from './src/test_helpers.js';

let platform;

beforeAll(async () => {
  platform = await getPlatformProxy({
    configPath: './wrangler.toml',
    environment: 'test',
    persist: { path: './.wrangler/state/v3' },
  });

  // Make DB available globally for tests
  global.DB = platform.env.DB;
  global.SCHEDULE_QUEUE = platform.env.SCHEDULE_QUEUE;
  global.platform = platform;
});

beforeEach(async () => {
  // Clear all tables before each test in correct order (reverse dependencies)
  await cleanTestDatabase(global.DB);
});

afterAll(async () => {
  if (platform) {
    await platform.dispose();
  }
});
