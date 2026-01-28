<script setup>
import { ref } from 'vue'
import { useAuthStore } from './ui/stores/useAuthStore'
import { useResumeStore } from './ui/stores/useResumeStore'

const authStore = useAuthStore()
const resumeStore = useResumeStore()

const message = ref('Welcome to AI Resume Builder')

const login = () => {
  authStore.login({ name: 'John Doe', email: 'john@example.com' })
}

const logout = () => {
  authStore.logout()
}

const updateName = () => {
  resumeStore.updatePersonalInfo({ name: 'Jane Doe' })
}
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
    <div class="bg-white dark:bg-background-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
      <h1 class="text-3xl font-bold text-primary mb-4">{{ message }}</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">Pinia stores are reactive!</p>

      <div v-if="authStore.isAuthenticated" class="mb-4">
        <p class="text-success">Logged in as: {{ authStore.user.name }}</p>
        <button @click="logout" class="bg-error text-white px-4 py-2 rounded hover:bg-red-700 transition mr-2">
          Logout
        </button>
      </div>
      <div v-else class="mb-4">
        <button @click="login" class="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2">
          Login
        </button>
      </div>

      <div class="mb-4">
        <p>Resume Name: {{ resumeStore.resume.personalInfo.name || 'Not set' }}</p>
        <button @click="updateName" class="bg-ai text-white px-4 py-2 rounded hover:bg-purple-700 transition">
          Update Name
        </button>
      </div>
    </div>
  </div>
</template>