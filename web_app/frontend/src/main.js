import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './ui/router'
import { useAuthStore } from './ui/stores/useAuthStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth state from localStorage before mounting
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')