import { BaseController } from '../base/base_controller.js';

export class HealthController extends BaseController {
  async getHealth() {
    return this.jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }
}