<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Manage Sections</h2>
      <p class="text-sm text-gray-500 mt-1">Add, remove, or reorder resume sections.</p>
    </div>

    <!-- Available Sections -->
    <div class="space-y-3">
      <div 
        v-for="section in localSections" 
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
            <p class="font-semibold text-sm">{{ section.label }}</p>
            <p class="text-xs text-gray-500">{{ getSectionDescription(section.id) }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Required badge -->
          <span v-if="section.required" class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Required</span>
          
          <!-- Toggle visibility -->
          <button 
            v-if="!section.required"
            @click="toggleSection(section.id)"
            :class="[
              'p-2 rounded-lg transition-all',
              section.visible 
                ? 'text-primary bg-primary/10' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
          >
            <svg v-if="section.visible" xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    <button 
      @click="showAddSection = true"
      class="mt-6 w-full p-4 rounded-xl border-2 border-dashed border-[#d0d7e7] dark:border-gray-700 text-gray-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
      <span class="font-semibold text-sm">Add Custom Section</span>
    </button>

    <!-- Add Section Modal -->
    <div v-if="showAddSection" class="mt-4 p-4 rounded-xl border border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <input 
        v-model="newSectionName"
        @keyup.enter="addCustomSection"
        class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm mb-3" 
        type="text" 
        placeholder="Section name (e.g., Volunteer Work)"
      />
      <div class="flex gap-2">
        <button 
          @click="addCustomSection"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add Section
        </button>
        <button 
          @click="showAddSection = false; newSectionName = ''"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>

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
          <p class="text-xs text-blue-600 dark:text-blue-300 mt-1">Hidden sections won't appear in your resume but their data is preserved. Toggle visibility to quickly customize your resume for different roles.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:sections'])

const localSections = ref(JSON.parse(JSON.stringify(props.sections)))
const showAddSection = ref(false)
const newSectionName = ref('')

// Sync with parent
// Watch for parent prop changes
watch(() => props.sections, (newVal) => {
  // Use deep comparison to avoid circular updates
  if (JSON.stringify(newVal) !== JSON.stringify(localSections.value)) {
    localSections.value = JSON.parse(JSON.stringify(newVal))
  }
}, { deep: true })

const sectionDescriptions = {
  personal: 'Name, title, contact details',
  summary: 'Brief career overview',
  experience: 'Employment history',
  skills: 'Technical and soft skills',
  education: 'Academic background',
  certifications: 'Professional certifications',
  projects: 'Notable projects',
  languages: 'Language proficiencies',
}

const getSectionDescription = (id) => {
  return sectionDescriptions[id] || 'Custom section'
}

const toggleSection = (id) => {
  const section = localSections.value.find(s => s.id === id)
  if (section && !section.required) {
    section.visible = !section.visible
    emit('update:sections', JSON.parse(JSON.stringify(localSections.value)))
  }
}

const addCustomSection = () => {
  if (newSectionName.value.trim()) {
    const id = newSectionName.value.toLowerCase().replace(/\s+/g, '-')
    localSections.value.push({
      id,
      label: newSectionName.value.trim(),
      visible: true,
      custom: true
    })
    emit('update:sections', JSON.parse(JSON.stringify(localSections.value)))
    newSectionName.value = ''
    showAddSection.value = false
  }
}
</script>
