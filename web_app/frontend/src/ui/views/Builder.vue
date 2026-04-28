<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background-light dark:bg-background-dark">
    <!-- Header -->
    <BuilderHeader 
      :resume-title="resumeTitle" 
      :is-saved="isSaved"
      :is-saving="isSaving"
      :is-syncing="isSyncing"
      :show-page-limits="showPageLimits"
      @save="handleSave"
      @download="(format) => handleDownload(format)"
      @upload-pdf="handleUploadPdf"
      @toggle-page-limits="togglePageLimits"
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
          :sections="sections"
          :template="layoutSettings.template"
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
          v-model:style="styleSettings"
        />

        <!-- History Tab -->
        <HistoryEditor 
          v-else-if="activeTab === 'history'"
          :history="history"
          @restore="restoreVersion"
          @clear="clearHistory"
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
          <ResumePreview 
            :resume="resumeData" 
            :layout="layoutSettings"
            :style="styleSettings"
            :sections="sections"
            :show-page-limits="showPageLimits"
          />
        </div>
      </section>
    </div>

    <!-- AI Enhancement Modal -->
    <div v-if="aiModal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold">AI Enhancement</h3>
              <p class="text-sm text-gray-500">Improving your {{ aiModal.section }}</p>
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="aiModal.loading" class="flex flex-col items-center py-8">
            <div class="h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-gray-500">AI is enhancing your content...</p>
          </div>
          <div v-else-if="aiModal.result">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Enhanced Version{{ aiModal.allVariations.length > 1 ? 's' : '' }}:</p>
            <div v-if="aiModal.allVariations.length > 1" class="space-y-3 mb-4">
              <div v-for="(variation, idx) in aiModal.allVariations" :key="idx" class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed border-2 border-transparent hover:border-violet-200 dark:hover:border-violet-700 cursor-pointer transition-colors" :class="{ 'border-violet-500 bg-violet-50 dark:bg-violet-900/20': aiModal.selectedVariation === idx }" @click="aiModal.selectedVariation = idx">
                <div class="flex items-start gap-3">
                  <input type="radio" :checked="aiModal.selectedVariation === idx" @change="aiModal.selectedVariation = idx" class="mt-0.5 text-violet-600 focus:ring-violet-500" />
                  <div class="flex-1">{{ variation }}</div>
                </div>
              </div>
            </div>
            <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed mb-4">
              {{ aiModal.result }}
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <button 
                @click="applyAiEnhancement"
                class="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
              >
                Apply Enhancement
              </button>
              <button 
                @click="aiModal.show = false"
                class="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
          <div v-else-if="aiModal.error" class="text-center py-4">
            <p class="text-red-500 text-sm">{{ aiModal.error }}</p>
            <button 
              @click="aiModal.show = false"
              class="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Upload Modal -->
    <div v-if="uploadModal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold">Upload PDF Resume</h3>
              <p class="text-sm text-gray-500">Parsing your resume...</p>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div v-if="uploadModal.loading" class="flex flex-col items-center py-8">
            <div class="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-sm text-gray-500">Extracting text from PDF...</p>
            <p class="text-xs text-gray-400 mt-2">This may take a few moments</p>
          </div>
          <div v-else-if="uploadModal.error" class="text-center py-4">
            <p class="text-red-500 text-sm">{{ uploadModal.error }}</p>
            <button 
              @click="uploadModal.show = false"
              class="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BuilderHeader from '../components/BuilderHeader.vue'
import BuilderSidebar from '../components/BuilderSidebar.vue'
import ResumeEditor from '../components/ResumeEditor.vue'
import ResumePreview from '../components/ResumePreview.vue'
import SectionsEditor from '../components/SectionsEditor.vue'
import LayoutEditor from '../components/LayoutEditor.vue'
import StyleEditor from '../components/StyleEditor.vue'
import HistoryEditor from '../components/HistoryEditor.vue'
import { useBuilderController } from '../composables/useBuilderController.js'

// Use the controller composable (per technical_design.md §3.2D)
const {
  activeTab,
  zoom,
  showPageLimits,
  isSaved,
  isSaving,
  isSyncing,
  resumeData,
  sections,
  layoutSettings,
  styleSettings,
  aiModal,
  uploadModal,
  resumeTitle,
  handleSave,
  handleDownload,
  handleAiEnhance,
  applyAiEnhancement,
  handleUploadPdf,
  zoomIn,
  zoomOut,
  togglePageLimits,
  history,
  restoreVersion,
  clearHistory
} = useBuilderController()
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
