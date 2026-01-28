import { getPlatformProxy } from 'wrangler';
import { beforeAll, afterAll, beforeEach } from 'vitest';

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
  if (global.DB) {
    try {
      await global.DB.prepare('DELETE FROM Resumes').run();
      await global.DB.prepare('DELETE FROM Users').run();
    } catch (error) {
      // Silently ignore errors during cleanup
      console.warn('Cleanup error:', error.message);
    }
  }
});

afterAll(async () => {
  if (platform) {
    await platform.dispose();
  }
});
