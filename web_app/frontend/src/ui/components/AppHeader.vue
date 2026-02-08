<template>
  <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-[#2d364f] bg-white dark:bg-[#1a202c] px-6 lg:px-40 py-3 sticky top-0 z-50">
    <div class="flex items-center gap-4 text-[#0e121b] dark:text-white">
      <router-link to="/dashboard" class="size-6 text-primary">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_6_330)">
            <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
          </g>
          <defs>
            <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
          </defs>
        </svg>
      </router-link>
      <h2 class="text-[#0e121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">AI Resume Builder</h2>
    </div>
    <div class="flex flex-1 justify-end gap-8 items-center">
      <nav class="hidden md:flex items-center gap-9">
        <router-link 
          to="/dashboard" 
          class="text-sm font-medium leading-normal transition-colors"
          :class="isActive('/dashboard') ? 'text-[#0e121b] dark:text-white' : 'text-[#4d6599] dark:text-gray-400 hover:text-primary'"
        >
          Dashboard
        </router-link>
        <router-link to="/saved-jobs"
          class="text-sm font-medium leading-normal transition-colors"
          :class="isActive('/saved-jobs') ? 'text-[#0e121b] dark:text-white' : 'text-[#4d6599] dark:text-gray-400 hover:text-primary'"
          >
          Saved Applications
        </router-link>
      </nav>
      <!-- User Menu -->
      <div class="relative">
        <button 
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 focus:outline-none"
        >
          <div 
            class="bg-primary text-white aspect-square rounded-full size-10 border border-gray-200 flex items-center justify-center font-semibold"
          >
            {{ userInitials }}
          </div>
        </button>
        <!-- Dropdown -->
        <div 
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a202c] rounded-lg shadow-lg border border-[#e7ebf3] dark:border-[#2d364f] py-2 z-50"
        >
          <div class="px-4 py-2 border-b border-[#e7ebf3] dark:border-[#2d364f]">
            <p class="text-sm font-semibold text-[#0e121b] dark:text-white">{{ userName }}</p>
            <p class="text-xs text-[#4d6599] dark:text-gray-400">{{ userEmail }}</p>
          </div>
          <button 
            @click="handleSignOut"
            class="w-full text-left px-4 py-2 text-sm text-[#4d6599] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0e121b] dark:hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showUserMenu = ref(false)

const userName = computed(() => authStore.user?.name || 'User')
const userEmail = computed(() => authStore.user?.email || '')
const userInitials = computed(() => {
  const name = userName.value
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const isActive = (path) => {
  return route.path.startsWith(path);
}

const handleSignOut = () => {
  showUserMenu.value = false
  authStore.logout()
  router.push('/login')
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
