import axios from 'axios'
import { TokenStorage } from '../storage/TokenStorage.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787', // Default to local backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid, clear and redirect to login
      TokenStorage.removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { api as axios }