import { axios } from '../lib/axios.js'

export class HttpAuthService {
  async login(email, password) {
    const response = await axios.post('/api/auth/login', { email, password })
    return response.data.data
  }

  async signup(name, email, password) {
    const response = await axios.post('/api/auth/signup', { name, email, password })
    return response.data.data
  }

  async getProfile() {
    const response = await axios.get('/api/user/profile')
    return response.data.data.profile
  }
}