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

// Simple route guard: redirect to /login when route requires auth
router.beforeEach((to, from, next) => {
	const auth = useAuthStore()
	if (to.meta && to.meta.requiresAuth && !auth.isAuthenticated) {
		return next({ name: 'Login' })
	}
	next()
})

app.mount('#app')