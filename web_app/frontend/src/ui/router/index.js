import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/signup', name: 'Signup', component: () => import('../views/Signup.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPassword.vue') },
  { path: '/terms', name: 'Terms', component: () => import('../views/Terms.vue') },
  { path: '/privacy', name: 'Privacy', component: () => import('../views/Privacy.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/builder', name: 'Builder', component: () => import('../views/Builder.vue'), meta: { requiresAuth: true } },
  { path: '/generator', name: 'Generator', component: () => import('../views/Generator.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Stub auth guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = false // Stub: replace with actual auth check
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
