<template>
  <div class="p-6">
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Version History</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        View and restore previous versions of your resume.
      </p>
    </div>

    <div class="space-y-4">
      <!-- Empty State / Placeholder -->
      <div v-if="history.length === 0" class="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
        <div class="h-12 w-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
            <path d="M12 7v5l4 2"/>
          </svg>
        </div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">No versions yet</h3>
        <p class="text-xs text-gray-500 max-w-[200px] mx-auto">
          Save your resume to start tracking versions and changes over time.
        </p>
      </div>

      <!-- History List (Mock Data for now) -->
      <div 
        v-for="version in history" 
        :key="version.id"
        class="group p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-600">
              <span class="text-xs font-bold">v{{ version.number }}</span>
            </div>
            <div>
              <p class="text-sm font-bold text-gray-900 dark:text-white">{{ version.name }}</p>
              <p class="text-[11px] text-gray-500">{{ version.date }}</p>
            </div>
          </div>
          <button class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-all uppercase tracking-wider">
            Restore
          </button>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 italic">
          "{{ version.changeMessage }}"
        </p>
      </div>
    </div>

    <!-- Info Box -->
    <div class="mt-12 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
      <div class="flex gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-amber-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p class="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
          Versions are currently stored locally in your browser session. Backend versioning support is planned for a future update.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Mock history data for UI demonstration
const history = ref([
  // Uncomment to test the list view
  /*
  { 
    id: 1, 
    number: 3, 
    name: 'Current Version', 
    date: 'Jan 30, 2026 • 2:45 PM', 
    changeMessage: 'Added Education and Certifications sections' 
  },
  { 
    id: 2, 
    number: 2, 
    name: 'AI Enhanced Version', 
    date: 'Jan 30, 2026 • 2:10 PM', 
    changeMessage: 'Improved summary using AI' 
  },
  { 
    id: 3, 
    number: 1, 
    name: 'Initial Draft', 
    date: 'Jan 30, 2026 • 1:55 PM', 
    changeMessage: 'Created basic resume structure' 
  }
  */
])
</script>
