import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'
import { LoginUseCase } from '../../core/application/auth/LoginUseCase.js'
import { HttpAuthService } from '../../infrastructure/api/HttpAuthService.js'

export function useAuthController() {
  const router = useRouter()
  const authStore = useAuthStore()
  const isLoading = ref(false)
  const error = ref(null)

  // Manual Dependency Injection
  const authService = new HttpAuthService()
  const loginUseCase = new LoginUseCase(authService)

  const login = async (email, password) => {
    isLoading.value = true
    error.value = null
    try {
      const { user, token } = await loginUseCase.execute(email, password)
      authStore.login(user, token)
      router.push('/dashboard')
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
    } finally {
      isLoading.value = false
    }
  }

  return { login, isLoading, error }
}