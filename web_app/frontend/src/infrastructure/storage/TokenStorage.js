export class TokenStorage {
  static getToken() {
    return localStorage.getItem('authToken');
  }

  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  static removeToken() {
    localStorage.removeItem('authToken');
  }
}