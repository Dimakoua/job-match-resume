<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    <div class="flex gap-3">
      <router-link to="/builder" class="px-3 py-2 bg-white border rounded">Open Builder</router-link>
      <router-link to="/generator" class="px-3 py-2 bg-white border rounded">Open Generator</router-link>
      <button @click="handleSignOut" class="px-3 py-2 bg-white border rounded">Sign out</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()

const handleSignOut = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
</style>
