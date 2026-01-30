<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Manage Sections</h2>
      <p class="text-sm text-gray-500 mt-1">Add, remove, or reorder resume sections.</p>
    </div>

    <!-- Available Sections -->
    <div class="space-y-3">
      <div 
        v-for="section in sections" 
        :key="section.id"
        class="flex items-center justify-between p-4 rounded-xl border border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm group"
      >
        <div class="flex items-center gap-3">
          <!-- Drag handle -->
          <button class="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </button>
          
          <div>
            <p class="font-semibold text-sm">{{ section.name }}</p>
            <p class="text-xs text-gray-500">{{ section.description }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Toggle visibility -->
          <button 
            @click="toggleSection(section.id)"
            :class="[
              'p-2 rounded-lg transition-all',
              section.enabled 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            <svg v-if="section.enabled" xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Custom Section -->
    <button class="mt-6 w-full p-4 rounded-xl border-2 border-dashed border-[#d0d7e7] dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span class="font-semibold text-sm">Add Custom Section</span>
    </button>

    <!-- Info Card -->
    <div class="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
      <div class="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-blue-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <div>
          <p class="text-sm font-semibold text-blue-700 dark:text-blue-400">Tip</p>
          <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">Drag sections to reorder them. Hidden sections won't appear in your resume but their data is preserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const sections = ref([
  { id: 'personal', name: 'Personal Information', description: 'Name, title, contact details', enabled: true, required: true },
  { id: 'summary', name: 'Professional Summary', description: 'Brief career overview', enabled: true },
  { id: 'experience', name: 'Work Experience', description: 'Employment history', enabled: true },
  { id: 'education', name: 'Education', description: 'Academic background', enabled: true },
  { id: 'skills', name: 'Skills', description: 'Technical and soft skills', enabled: true },
  { id: 'certifications', name: 'Certifications', description: 'Professional certifications', enabled: false },
  { id: 'projects', name: 'Projects', description: 'Notable projects', enabled: false },
  { id: 'languages', name: 'Languages', description: 'Language proficiencies', enabled: false },
])

const toggleSection = (id) => {
  const section = sections.value.find(s => s.id === id)
  if (section && !section.required) {
    section.enabled = !section.enabled
  }
}
</script>
