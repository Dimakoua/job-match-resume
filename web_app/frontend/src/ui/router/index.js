import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/builder', name: 'Builder', component: () => import('../views/Builder.vue'), meta: { requiresAuth: true } },
  { path: '/generator', name: 'Generator', component: () => import('../views/Generator.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
