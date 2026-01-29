<script setup>
import { ref } from 'vue'
import { useAuthStore } from './ui/stores/useAuthStore'
import { useResumeStore } from './ui/stores/useResumeStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const resumeStore = useResumeStore()
const router = useRouter()

const message = ref('Welcome to AI Resume Builder')

const login = () => {
  authStore.login({ name: 'John Doe', email: 'john@example.com' })
}

const logout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

const updateName = () => {
  resumeStore.updatePersonalInfo({ name: 'Jane Doe' })
}
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">

    <main class="flex-1">
      <router-view />
    </main>

    <footer class="py-4 text-center text-xs text-slate-400 dark:text-slate-600">
      <p>© 2024 AI Resume Builder. All rights reserved.</p>
    </footer>
  </div>
</template>