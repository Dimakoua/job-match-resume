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
            <button class="text-primary font-bold text-sm hover:underline whitespace-nowrap">View Examples</button>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import ResumeCard from '../components/ResumeCard.vue'
import ResumeEmptyCard from '../components/ResumeEmptyCard.vue'

const router = useRouter()

const resumes = ref([])
const isLoading = ref(true)
const error = ref(null)

// TODO: Replace with actual API call
const loadResumes = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    // Simulated data for now - will be replaced with API call
    await new Promise(resolve => setTimeout(resolve, 500))
    resumes.value = [
      // { id: '1', title: 'Senior Software Engineer', updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      // { id: '2', title: 'Marketing Manager 2024', updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      // { id: '3', title: 'Lead Product Designer', updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
    ]
  } catch (err) {
    error.value = 'Failed to load resumes. Please try again.'
    console.error('Error loading resumes:', err)
  } finally {
    isLoading.value = false
  }
}

const handleCreateWithAI = () => {
  router.push('/generator')
}

const handleCreateFromScratch = () => {
  router.push('/builder')
}

const handleEditResume = (resume) => {
  router.push(`/builder?id=${resume.id}`)
}

const handleDownloadResume = (resume) => {
  // TODO: Implement download
  console.log('Download resume:', resume.id)
}

const handlePreviewResume = (resume) => {
  // TODO: Implement preview modal
  console.log('Preview resume:', resume.id)
}

const handleDuplicateResume = (resume) => {
  // TODO: Implement duplicate
  console.log('Duplicate resume:', resume.id)
}

const handleDeleteResume = (resume) => {
  // TODO: Implement delete with confirmation
  console.log('Delete resume:', resume.id)
}

onMounted(() => {
  loadResumes()
})
</script>

