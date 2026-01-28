import { describe, it, expect } from 'vitest';
import { HealthController } from './health_controller.js';

describe('HealthController', () => {
  let controller;

  beforeEach(() => {
    controller = new HealthController();
  });

  describe('getHealth', () => {
    it('should return 200 with health status', async () => {
      const response = await controller.getHealth();

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('ok');
      expect(body.version).toBe('1.0.0');
      expect(body.timestamp).toBeDefined();
      expect(typeof body.timestamp).toBe('string');
    });
  });
});