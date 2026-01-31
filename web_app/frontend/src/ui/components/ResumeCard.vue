<template>
  <div class="flex flex-col gap-3 group">
    <!-- Card Preview -->
    <div class="relative w-full bg-white dark:bg-[#1a202c] aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-[#e7ebf3] dark:border-[#2d364f] group-hover:shadow-lg transition-all">
      <!-- Resume Preview Image/Placeholder -->
      <div 
        v-if="resume.previewUrl" 
        class="w-full h-full bg-center bg-no-repeat bg-cover opacity-90"
        :style="{ backgroundImage: `url(${resume.previewUrl})` }"
      ></div>
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      
      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
      
      <!-- Quick view button -->
      <div class="absolute bottom-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform">
        <button 
          @click.stop="$emit('preview', resume)"
          class="bg-white text-primary p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Card Info -->
    <div class="flex flex-col px-1">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-[#0e121b] dark:text-white text-base font-semibold leading-normal">{{ resume.title || 'Untitled Resume' }}</p>
          <p class="text-[#4d6599] dark:text-gray-400 text-xs font-normal leading-normal">{{ formattedDate }}</p>
        </div>
        <!-- More options menu -->
        <div class="relative">
          <button 
            @click.stop="showMenu = !showMenu"
            class="text-[#4d6599] hover:text-[#0e121b] dark:hover:text-white p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="12" cy="5" r="1"/>
              <circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          <!-- Dropdown menu -->
          <div 
            v-if="showMenu"
            class="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1a202c] rounded-lg shadow-lg border border-[#e7ebf3] dark:border-[#2d364f] py-1 z-10"
          >
            <button 
              @click.stop="handleDuplicate"
              class="w-full text-left px-3 py-2 text-sm text-[#4d6599] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0e121b] dark:hover:text-white"
            >
              Duplicate
            </button>
            <button 
              @click.stop="handleDelete"
              class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      <!-- Action buttons -->
      <div class="mt-3 flex gap-2">
        <button 
          @click="$emit('edit', resume)"
          class="flex-1 bg-primary/10 text-primary text-xs font-bold py-2 rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          Edit Resume
        </button>

        <!-- TODO: download logic we fix later -->
        <button 
          @click="$emit('download', resume)"
          class="px-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  resume: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'download', 'preview', 'duplicate', 'delete'])

const showMenu = ref(false)

const formattedDate = computed(() => {
  if (!props.resume.updatedAt) return 'Never edited'
  
  const date = new Date(props.resume.updatedAt)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Edited just now'
  if (diffMins < 60) return `Edited ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `Edited ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `Edited ${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `Edited ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return `Edited ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
})

const handleDuplicate = () => {
  showMenu.value = false
  emit('duplicate', props.resume)
}

const handleDelete = () => {
  showMenu.value = false
  emit('delete', props.resume)
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
