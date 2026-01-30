<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark">
    <!-- Header -->
    <BuilderHeader 
      :resume-title="resumeTitle" 
      :is-saved="isSaved"
      @download="handleDownload"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <BuilderSidebar 
        :active-tab="activeTab" 
        @select="activeTab = $event" 
      />

      <!-- Editor Panel -->
      <main class="w-full max-w-[550px] bg-white dark:bg-background-dark border-r border-[#e7ebf3] dark:border-gray-800 overflow-y-auto custom-scrollbar">
        <!-- Edit Tab - Resume Editor -->
        <ResumeEditor 
          v-if="activeTab === 'edit'"
          v-model="resumeData"
          @ai-enhance="handleAiEnhance"
        />
        
        <!-- Sections Tab -->
        <SectionsEditor 
          v-else-if="activeTab === 'sections'"
          v-model:sections="sections"
        />
        
        <!-- Layout Tab -->
        <LayoutEditor 
          v-else-if="activeTab === 'layout'"
          v-model:layout="layoutSettings"
        />
        
        <!-- Style Tab -->
        <StyleEditor 
          v-else-if="activeTab === 'style'"
          @update:style="handleStyleUpdate"
        />
      </main>

      <!-- Preview Panel -->
      <section class="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto p-8 lg:p-12 flex justify-center custom-scrollbar relative">
        <!-- Floating Controls -->
        <div class="absolute top-6 right-6 flex flex-col gap-3 z-20">
          <button 
            @click="zoomIn"
            class="h-12 w-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-gray-600 dark:text-gray-300 group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button 
            @click="zoomOut"
            class="h-12 w-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-gray-600 dark:text-gray-300 group-hover:text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </div>

        <!-- Resume Preview -->
        <div :style="{ transform: `scale(${zoom})`, transformOrigin: 'top center' }">
          <ResumePreview :resume="resumeData" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BuilderHeader from '../components/BuilderHeader.vue'
import BuilderSidebar from '../components/BuilderSidebar.vue'
import ResumeEditor from '../components/ResumeEditor.vue'
import ResumePreview from '../components/ResumePreview.vue'
import SectionsEditor from '../components/SectionsEditor.vue'
import LayoutEditor from '../components/LayoutEditor.vue'
import StyleEditor from '../components/StyleEditor.vue'

const route = useRoute()

const activeTab = ref('edit')
const zoom = ref(1)
const isSaved = ref(true)

const resumeData = ref({
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  summary: '',
  experience: [],
  skills: []
})

// Sections configuration
const sections = ref([
  { id: 'personal', label: 'Personal Info', visible: true, required: true },
  { id: 'summary', label: 'Professional Summary', visible: true },
  { id: 'experience', label: 'Work Experience', visible: true },
  { id: 'skills', label: 'Skills', visible: true },
  { id: 'education', label: 'Education', visible: false },
  { id: 'certifications', label: 'Certifications', visible: false },
  { id: 'projects', label: 'Projects', visible: false },
])

// Layout settings
const layoutSettings = ref({
  template: 'classic',
  margins: 1,
  spacing: 1.5,
})

const resumeTitle = computed(() => {
  if (resumeData.value.title) {
    return resumeData.value.title
  }
  if (resumeData.value.firstName || resumeData.value.lastName) {
    return `${resumeData.value.firstName} ${resumeData.value.lastName}`.trim() + "'s Resume"
  }
  return 'Untitled Resume'
})

// Mark as unsaved when data changes
watch(resumeData, () => {
  isSaved.value = false
}, { deep: true })

const zoomIn = () => {
  if (zoom.value < 1.5) {
    zoom.value = Math.min(1.5, zoom.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(0.5, zoom.value - 0.1)
  }
}

const handleDownload = () => {
  // TODO: Implement PDF download
  console.log('Download PDF:', resumeData.value)
}

const handleAiEnhance = (section, index) => {
  // TODO: Implement AI enhancement
  console.log('AI Enhance:', section, index)
}

const handleStyleUpdate = (styleData) => {
  // TODO: Apply style changes to preview
  console.log('Style Update:', styleData)
}

// Load resume data if editing existing
onMounted(() => {
  const resumeId = route.query.id
  if (resumeId) {
    // TODO: Load resume from API
    console.log('Loading resume:', resumeId)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d0d7e7;
  border-radius: 10px;
}
</style>
