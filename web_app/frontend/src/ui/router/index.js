import { createRouter, createWebHistory } from 'vue-router'
import { TokenStorage } from '../../infrastructure/storage/TokenStorage.js'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/signup', name: 'Signup', component: () => import('../views/Signup.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPassword.vue') },
  { path: '/terms', name: 'Terms', component: () => import('../views/Terms.vue') },
  { path: '/privacy', name: 'Privacy', component: () => import('../views/Privacy.vue') },
  { path: '/examples', name: 'Examples', component: () => import('../views/Examples.vue'), meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/builder', name: 'Builder', component: () => import('../views/Builder.vue'), meta: { requiresAuth: true } },
  { path: '/generator', name: 'Generator', component: () => import('../views/Generator.vue'), meta: { requiresAuth: true } },
  { path: '/job-applications/:listId', name: 'JobApplicationView', component: () => import('../views/JobApplicationView.vue'), meta: { requiresAuth: true } },
  { path: '/job-applications/:listId/create', name: 'CreateJobApplication', component: () => import('../views/CreateJobApplicationView.vue'), meta: { requiresAuth: true } },
  { path: '/job-applications/:listId/:applicationId/edit', name: 'EditJobApplication', component: () => import('../views/EditJobApplicationView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!TokenStorage.getToken()
  const isAuthPage = ['Login', 'Signup', 'ForgotPassword'].includes(to.name)
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Trying to access protected route without auth -> redirect to login
    next('/login')
  } else if (isAuthPage && isAuthenticated) {
    // Already logged in, trying to access auth pages -> redirect to dashboard
    next('/dashboard')
  } else {
    next()
  }
})

export default router
