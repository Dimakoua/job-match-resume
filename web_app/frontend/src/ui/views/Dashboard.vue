<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#111621]">
    <div class="flex h-full grow flex-col">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="px-6 lg:px-40 flex flex-1 justify-center py-8">
        <div class="flex flex-col max-w-[1024px] flex-1">
          <!-- Page Heading -->
          <div class="flex flex-wrap justify-between items-end gap-4 pb-8">
            <div class="flex min-w-72 flex-col gap-1">
              <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Resumes</h1>
              <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal">Manage and optimize your professional career documents</p>
            </div>
            <div class="flex gap-3">
              <button 
                @click="handleCreateWithAI"
                class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <span class="truncate">Create with AI</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="n in 3" :key="n" class="aspect-[3/4] rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500 mb-4">{{ error }}</p>
            <button @click="loadResumes" class="text-primary hover:underline">Try again</button>
          </div>

          <!-- Resume Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Empty State Card -->
            <ResumeEmptyCard @create="handleCreateFromScratch" />

            <!-- Resume Cards -->
            <ResumeCard 
              v-for="resume in resumes" 
              :key="resume.id"
              :resume="resume"
              @edit="handleEditResume"
              @download="handleDownloadResume"
              @preview="handlePreviewResume"
              @duplicate="handleDuplicateResume"
              @delete="handleDeleteResume"
            />
          </div>

          <!-- Pagination -->
          <div v-if="resumes.length > 0 && pagination.totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2">
              <!-- Previous Button -->
              <button 
                @click="goToPrevious"
                :disabled="!pagination.hasPrev"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <!-- Page Numbers -->
              <div class="flex items-center gap-1">
                <button 
                  v-for="page in pagination.totalPages" 
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    page === pagination.page 
                      ? 'bg-primary text-white' 
                      : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <!-- Next Button -->
              <button 
                @click="goToNext"
                :disabled="!pagination.hasNext"
                class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Inspiration Section -->
          <div class="mt-16 bg-[#e7ebf3]/40 dark:bg-[#1a202c] p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex gap-4 items-center">
              <div class="size-12 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-[#0e121b] dark:text-white">Need some inspiration?</h3>
                <p class="text-sm text-[#4d6599] dark:text-gray-400">Browse through our library of expert-approved resume examples.</p>
              </div>
            </div>
            <router-link 
              to="/examples"
              class="text-primary font-bold text-sm hover:underline whitespace-nowrap transition-colors"
            >
              View Examples
            </router-link>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Preview Modal -->
    <div v-if="previewModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="previewModal.show = false">
      <div class="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col" @click.stop>
        <!-- Modal Header -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
          <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ previewModal.resume?.title }}</h3>
          <div class="flex items-center gap-2">
            <button 
              @click="handleDownloadResume(previewModal.resume)"
              class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button 
              @click="previewModal.show = false"
              class="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body (Preview) -->
        <div class="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-950 flex justify-center custom-scrollbar">
          <div v-if="previewModal.isLoading" class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p class="mt-4 text-gray-500">Loading preview...</p>
          </div>
          <div v-else class="w-full max-w-[800px] origin-top scale-90 sm:scale-100">
            <ResumePreview 
              :resume="previewModal.resume"
              :sections="previewModal.sections"
              :layout="previewModal.layout"
              :style="previewModal.style"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import ResumeCard from '../components/ResumeCard.vue'
import ResumeEmptyCard from '../components/ResumeEmptyCard.vue'
import ResumePreview from '../components/ResumePreview.vue'
import { useDashboardController } from '../composables/useDashboardController.js'

// Use the controller composable (per technical_design.md §3.2D)
const {
  resumes,
  isLoading,
  error,
  pagination,
  previewModal,
  handleCreateWithAI,
  handleCreateFromScratch,
  handleEditResume,
  handleDownloadResume,
  handlePreviewResume,
  handleDuplicateResume,
  handleDeleteResume,
  goToPage,
  goToNext,
  goToPrevious
} = useDashboardController()

// Router instance
const router = useRouter()
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
