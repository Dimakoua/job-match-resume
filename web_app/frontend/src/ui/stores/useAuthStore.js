import { defineStore } from 'pinia'
import { TokenStorage } from '../../infrastructure/storage/TokenStorage.js'
import { axios } from '../../infrastructure/lib/axios.js'

const USER_STORAGE_KEY = 'auth_user'

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
      // Persist token and user info
      TokenStorage.setToken(token)
      this._saveUser(userData)
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      TokenStorage.removeToken()
      localStorage.removeItem(USER_STORAGE_KEY)
    },
    _saveUser(userData) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
    },
    _loadUser() {
      try {
        const stored = localStorage.getItem(USER_STORAGE_KEY)
        return stored ? JSON.parse(stored) : null
      } catch (error) {
        console.warn('Failed to load user from localStorage:', error)
        return null
      }
    },
    async initializeAuth() {
      const token = TokenStorage.getToken()
      if (token) {
        this.token = token
        this.isAuthenticated = true
        
        // First, try to restore user from localStorage (avoid extra API call)
        const cachedUser = this._loadUser()
        if (cachedUser) {
          this.user = cachedUser
        }
        
        // Validate token is still valid with a minimal call to get current user
        // Only fetch if we don't have cached user or if you want to ensure freshness
        try {
          const response = await axios.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (response.data && response.data.data && response.data.data.profile) {
            this.user = response.data.data.profile
            this._saveUser(this.user)
          }
        } catch (error) {
          console.warn('Failed to validate user token:', error)
          // Token may be invalid, log out
          this.logout()
        }
      }
    },
  },
})