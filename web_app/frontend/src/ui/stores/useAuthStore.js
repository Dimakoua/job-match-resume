import { defineStore } from 'pinia'
import { TokenStorage } from '../../infrastructure/storage/TokenStorage.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
  actions: {
    login(userData, token) {
      this.user = userData
      this.token = token
      this.isAuthenticated = true
      // Persist token
      TokenStorage.setToken(token)
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      TokenStorage.removeToken()
    },
    initializeAuth() {
      const token = TokenStorage.getToken()
      if (token) {
        this.token = token
        this.isAuthenticated = true
        // Optionally fetch user profile here
      }
    },
  },
})