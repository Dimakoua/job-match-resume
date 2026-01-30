<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Choose Layout</h2>
      <p class="text-sm text-gray-500 mt-1">Select a template layout for your resume.</p>
    </div>

    <!-- Layout Options -->
    <div class="grid grid-cols-2 gap-4">
      <button 
        v-for="layout in layouts" 
        :key="layout.id"
        @click="selectLayout(layout.id)"
        :class="[
          'p-4 rounded-xl border-2 transition-all text-left group',
          localLayout.template === layout.id 
            ? 'border-primary bg-primary/5' 
            : 'border-[#d0d7e7] dark:border-gray-700 hover:border-primary/50'
        ]"
      >
        <!-- Layout Preview -->
        <div class="aspect-[1/1.414] bg-white rounded-lg shadow-sm border border-gray-200 mb-3 p-3 overflow-hidden">
          <div :class="layout.previewClass">
            <!-- Header placeholder -->
            <div class="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div class="h-1.5 bg-primary/40 rounded w-1/2 mb-3"></div>
            <!-- Content placeholders -->
            <div class="h-1 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-1 bg-gray-200 rounded w-5/6 mb-1"></div>
            <div class="h-1 bg-gray-200 rounded w-4/6 mb-3"></div>
            <div class="h-1.5 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div class="h-1 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-1 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>

        <p class="font-semibold text-sm">{{ layout.name }}</p>
        <p class="text-xs text-gray-500">{{ layout.description }}</p>

        <!-- Selected indicator -->
        <div v-if="localLayout.template === layout.id" class="mt-2 flex items-center gap-1 text-primary text-xs font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Active
        </div>
      </button>
    </div>

    <!-- Spacing Settings -->
    <section class="mt-10">
      <div class="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
        </svg>
        <h3 class="text-lg font-bold">Spacing & Margins</h3>
      </div>

      <div class="space-y-6">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Page Margins</label>
            <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ localLayout.margins }}px</span>
          </div>
          <input 
            v-model.number="localLayout.margins"
            type="range" 
            min="24" 
            max="64" 
            step="4"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-[10px] text-gray-400 px-1">
            <span>Compact</span>
            <span>Normal</span>
            <span>Spacious</span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Section Spacing</label>
            <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ localLayout.sectionSpacing }}px</span>
          </div>
          <input 
            v-model.number="localLayout.sectionSpacing"
            type="range" 
            min="16" 
            max="48" 
            step="4"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  layout: {
    type: Object,
    default: () => ({
      template: 'classic',
      margins: 48,
      sectionSpacing: 24
    })
  }
})

const emit = defineEmits(['update:layout'])

const localLayout = ref({ ...props.layout })

// Sync with parent
watch(() => props.layout, (newVal) => {
  localLayout.value = { ...newVal }
}, { deep: true })

// Emit changes
watch(localLayout, (newVal) => {
  emit('update:layout', { ...newVal })
}, { deep: true })

const layouts = [
  { 
    id: 'classic', 
    name: 'Classic', 
    description: 'Traditional single-column layout',
    previewClass: ''
  },
  { 
    id: 'modern', 
    name: 'Modern', 
    description: 'Clean with accent colors',
    previewClass: 'border-l-2 border-primary pl-2'
  },
  { 
    id: 'minimal', 
    name: 'Minimal', 
    description: 'Ultra-clean, no borders',
    previewClass: 'opacity-80'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    description: 'Bold headers, structured',
    previewClass: 'border-t-4 border-primary pt-2'
  },
]

const selectLayout = (id) => {
  localLayout.value.template = id
}
</script>
