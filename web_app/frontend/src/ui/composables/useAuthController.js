import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'
import { LoginUseCase } from '../../core/application/auth/LoginUseCase.js'
import { SignupUseCase } from '../../core/application/auth/SignupUseCase.js'
import { HttpAuthService } from '../../infrastructure/api/HttpAuthService.js'

export function useAuthController() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref(null)

  // Manual Dependency Injection
  const authService = new HttpAuthService()
  const loginUseCase = new LoginUseCase(authService)
  const signupUseCase = new SignupUseCase(authService)

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const { user, token } = await loginUseCase.execute(email, password)
      authStore.login(user, token)
      router.push('/dashboard')
    } catch (err) {
      console.log('Error response:', err.response?.data)
      let errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Login failed'
      if (err.response?.data?.error?.details) {
        errorMessage += ': ' + err.response.data.error.details.map(d => d.message).join(', ')
      } else if (err.response?.data?.details) {
        errorMessage += ': ' + err.response.data.details.map(d => d.message).join(', ')
      }
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (name, email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const { user, token } = await signupUseCase.execute(name, email, password)
      authStore.login(user, token)
      router.push('/dashboard')
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Signup failed'
      if (err.response?.data?.details) {
        errorMessage += ': ' + err.response.data.details.map(d => d.message).join(', ')
      }
      error.value = errorMessage
    } finally {
      isLoading.value = false
    }
  }

  return { login, signup, isLoading, error }
}