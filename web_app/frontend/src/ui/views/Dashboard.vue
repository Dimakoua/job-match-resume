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
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

          <!-- Job Search Lists Section -->
          <div class="mt-16">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-bold text-[#0e121b] dark:text-white">Job Search Lists</h2>
                <p class="text-[#4d6599] dark:text-gray-400 text-sm mt-1">Organize and track your job applications</p>
              </div>
              <button 
                @click="handleCreateJobSearchList"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New List
              </button>
            </div>

            <!-- Job Search Lists Grid -->
            <div v-if="jobSearchLists.length === 0" class="text-center py-12 bg-[#e7ebf3]/40 dark:bg-[#1a202c] rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-16 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                <path d="M9 12h6m-6 4h6"/>
              </svg>
              <h3 class="text-lg font-semibold text-[#0e121b] dark:text-white mb-2">No job search lists yet</h3>
              <p class="text-[#4d6599] dark:text-gray-400 mb-4">Create your first list to start tracking job applications</p>
              <button 
                @click="handleCreateJobSearchList"
                class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create List
              </button>
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="list in jobSearchLists" 
                :key="list.id"
                class="bg-white dark:bg-[#1a202c] p-6 rounded-xl border border-[#e7ebf3] dark:border-[#2d364f] hover:shadow-lg transition-all"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1">
                    <h3 class="font-bold text-[#0e121b] dark:text-white text-lg mb-1">{{ list.name }}</h3>
                    <p v-if="list.description" class="text-[#4d6599] dark:text-gray-400 text-sm">{{ list.description }}</p>
                    <p v-else class="text-[#4d6599] dark:text-gray-400 text-sm">No description</p>
                  </div>
                  <div class="relative">
                    <button 
                      @click.stop="toggleListMenu(list.id)"
                      class="text-[#4d6599] hover:text-[#0e121b] dark:hover:text-white p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                    <div 
                      v-if="activeListMenu === list.id"
                      class="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1a202c] rounded-lg shadow-lg border border-[#e7ebf3] dark:border-[#2d364f] py-1 z-10"
                    >
                      <button 
                        @click.stop="handleEditList(list)"
                        class="w-full text-left px-3 py-2 text-sm text-[#4d6599] hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#0e121b] dark:hover:text-white"
                      >
                        Rename
                      </button>
                      <button 
                        @click.stop="handleDeleteList(list)"
                        class="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-xs text-[#4d6599] dark:text-gray-400">0 applications</span>
                  <button 
                    @click="handleViewList(list)"
                    class="text-primary text-sm font-semibold hover:underline"
                  >
                    View →
                  </button>
                </div>
              </div>
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

    <!-- Create Job Search List Modal -->
    <div v-if="createListModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="createListModal.show = false">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full" @click.stop>
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Create Job Search List</h3>
        </div>
        <form @submit.prevent="handleCreateListSubmit" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">List Name</label>
            <input 
              v-model="createListModal.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="e.g., Tech Companies 2024"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
            <textarea 
              v-model="createListModal.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Brief description of this job search..."
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button 
              type="button"
              @click="createListModal.show = false"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Job Search List Modal -->
    <div v-if="editListModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="editListModal.show = false">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full" @click.stop>
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Edit Job Search List</h3>
        </div>
        <form @submit.prevent="handleEditListSubmit" class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">List Name</label>
            <input 
              v-model="editListModal.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
            <textarea 
              v-model="editListModal.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button 
              type="button"
              @click="editListModal.show = false"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import ResumeCard from '../components/ResumeCard.vue'
import ResumeEmptyCard from '../components/ResumeEmptyCard.vue'
import ResumePreview from '../components/ResumePreview.vue'
import { useDashboardController } from '../composables/useDashboardController.js'
import { useJobSearchListController } from '../composables/useJobSearchListController.js'

// Use the controller composable (per technical_design.md §3.2D)
const {
  resumes,
  isLoading,
  error,
  previewModal,
  handleCreateWithAI,
  handleCreateFromScratch,
  handleEditResume,
  handleDownloadResume,
  handlePreviewResume,
  handleDuplicateResume,
  handleDeleteResume
} = useDashboardController()

const {
  lists: jobSearchLists,
  isLoading: listsLoading,
  error: listsError,
  loadLists,
  createList,
  updateList,
  deleteList
} = useJobSearchListController()

// Router instance
const router = useRouter()

// Job search list state
const activeListMenu = ref(null)
const createListModal = ref({
  show: false,
  name: '',
  description: ''
})
const editListModal = ref({
  show: false,
  list: null,
  name: '',
  description: ''
})

// Job search list handlers
const toggleListMenu = (listId) => {
  activeListMenu.value = activeListMenu.value === listId ? null : listId
}

const handleCreateJobSearchList = () => {
  createListModal.value = {
    show: true,
    name: '',
    description: ''
  }
}

const handleViewList = (list) => {
  router.push(`/job-applications/${list.id}`)
}

const handleEditList = (list) => {
  activeListMenu.value = null
  editListModal.value = {
    show: true,
    list,
    name: list.name,
    description: list.description || ''
  }
}

const handleDeleteList = async (list) => {
  activeListMenu.value = null
  if (!window.confirm(`Are you sure you want to delete "${list.name}"?`)) return
  
  try {
    await deleteList(list.id)
  } catch (err) {
    alert(err.message)
  }
}

const handleCreateListSubmit = async () => {
  try {
    await createList(createListModal.value.name, createListModal.value.description)
    createListModal.value = { show: false, name: '', description: '' }
  } catch (err) {
    alert(err.message)
  }
}

const handleEditListSubmit = async () => {
  try {
    await updateList(editListModal.value.list.id, {
      name: editListModal.value.name,
      description: editListModal.value.description
    })
    editListModal.value = { show: false, list: null, name: '', description: '' }
  } catch (err) {
    alert(err.message)
  }
}

const handleClickOutside = (event) => {
  // Close list menu if clicking outside
  if (activeListMenu.value && !event.target.closest('.relative')) {
    activeListMenu.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadLists()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
