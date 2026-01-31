<template>
  <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-background-dark px-6 py-3 z-10">
    <div class="flex items-center gap-4 text-[#0e121b] dark:text-white">
      <router-link to="/dashboard" class="size-8 text-primary">
        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path clip-rule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fill-rule="evenodd"></path>
        </svg>
      </router-link>
      <div class="flex flex-col">
        <h2 class="text-lg font-bold leading-tight tracking-[-0.015em]">Resume Studio</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {{ resumeTitle }} • 
          <span v-if="isSyncing" class="text-primary animate-pulse">Syncing...</span>
          <span v-else :class="isSaved ? 'text-green-500' : 'text-amber-500'">
            {{ isSaved ? 'Saved' : 'Unsaved changes' }}
          </span>
        </p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <nav class="hidden md:flex items-center gap-6 mr-4">
        <router-link to="/dashboard" class="text-sm font-medium hover:text-primary transition-colors">Dashboard</router-link>
      </nav>
      <div class="flex gap-2">
        <button 
          @click="$emit('save')"
          :disabled="isSaving || isSaved"
          :class="[
            'flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-sm font-bold transition-all',
            isSaved 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-[#e7ebf3] dark:bg-gray-800 text-[#0e121b] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
          ]"
        >
          <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save') }}</span>
        </button>
        <button 
          @click="$emit('download')"
          class="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
        >
          <span>Download PDF</span>
        </button>
      </div>
      <!-- User Avatar -->
      <div class="relative">
        <button 
          @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2 focus:outline-none"
        >
          <div class="bg-primary text-white aspect-square rounded-full size-10 border border-gray-200 flex items-center justify-center font-semibold">
            {{ userInitials }}
          </div>
        </button>
        <div 
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a202c] rounded-lg shadow-lg border border-[#e7ebf3] dark:border-[#2d364f] py-2 z-50"
        >
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore'

const props = defineProps({
  resumeTitle: {
    type: String,
    default: 'Untitled Resume'
  },
  isSaved: {
    type: Boolean,
    default: true
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  isSyncing: {
    type: Boolean,
    default: false
  }
})

defineEmits(['download', 'save'])

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)

const userName = computed(() => authStore.user?.name || 'User')
const userInitials = computed(() => {
  const name = userName.value
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const handleSignOut = () => {
  showUserMenu.value = false
  authStore.logout()
  router.push('/login')
}

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
