import { User } from '../../domain/user/User.js'

export class LoginUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(email, password) {
    const response = await this.authService.login(email, password);
    const user = new User(response.user.id, response.user.email, response.user.name);
    user.validate();
    return { user, token: response.token };
  }
}