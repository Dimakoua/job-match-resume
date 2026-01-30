import { User } from '../../domain/user/User.js'

export class SignupUseCase {
  constructor(authService) {
    this.authService = authService;
  }

  async execute(name, email, password) {
    const response = await this.authService.signup(name, email, password);
    const user = new User(response.user.id, response.user.email, response.user.name);
    user.validate();
    return { user, token: response.token };
  }
}