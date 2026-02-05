<template>
    <div class="flex h-full grow flex-col">
        <AppHeader></AppHeader>

        <div class="flex flex-col max-w-[1024px] flex-1">
            <div class="flex flex-1 w-full max-w-[1440px] mx-auto">
                <!-- Sidebar Navigation -->
                <aside
                    class="w-64 border-r border-[#e7ebf3] dark:border-gray-800 p-6 flex flex-col gap-6 bg-white dark:bg-background-dark hidden lg:flex">
                    <div class="flex flex-col gap-1">
                        <h1 class="text-gray-900 dark:text-white text-base font-bold leading-normal">Campaigns
                        </h1>
                        <p class="text-gray-500 text-xs font-normal leading-normal">Organize your applications
                        </p>
                    </div>
                    <nav class="flex flex-col gap-1">
                        <a v-for="list in jobSearchLists" :key="list.id" @click="selectList(list.id)"
                            class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
                            :class="list.id === selectedListId ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'">
                            <span class="material-symbols-outlined text-[20px]">folder_open</span>
                            <p class="text-sm font-medium leading-normal">{{ list.name }}</p>
                        </a>
                        <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                            href="#">
                            <span class="material-symbols-outlined text-[20px]">archive</span>
                            <p class="text-sm font-medium leading-normal">Archive</p>
                        </a>
                    </nav>
                    <button @click="openCreateListModal"
                        class="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold mt-auto">
                        <span class="material-symbols-outlined text-sm">add</span>
                        <span class="truncate">New List</span>
                    </button>
                </aside>
                <!-- Main Content Area -->
                <div class="flex-1 flex flex-col bg-background-light dark:bg-background-dark min-h-screen">
                    <!-- Page Heading -->
                    <div class="flex flex-wrap justify-between items-end gap-3 p-8">
                        <div class="flex min-w-72 flex-col gap-2">
                            <p
                                class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                                {{ selectedList?.name || 'Saved Jobs' }}</p>
                            <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal">{{
                                filteredJobs.length }} saved job descriptions</p>
                        </div>
                        <div class="flex gap-3">
                            <button @click="addJobManually"
                                class="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white border border-[#e7ebf3] dark:border-gray-700 text-sm font-bold shadow-sm">
                                <span class="truncate">Add Job Manually</span>
                            </button>
                        </div>
                    </div>
                    <!-- Filters/Chips -->
                    <div class="flex gap-3 px-8 pb-4 flex-wrap">
                        <button v-for="filter in filters" :key="filter.key" @click="activeFilter = filter.key"
                            :class="[
                                'flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4',
                                activeFilter === filter.key
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#0e121b] dark:text-white'
                            ]">
                            <p class="text-xs font-bold leading-normal">{{ filter.label }}</p>
                        </button>
                    </div>
                    <!-- Job Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        <div v-for="job in filteredJobs" :key="job.id"
                            class="flex flex-col gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-[#e7ebf3] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            @click="openTailoringStudio(job)">
                            <div class="flex justify-between items-start">
                                <div
                                    class="size-14 bg-[#f8f9fc] dark:bg-gray-900 rounded-lg flex items-center justify-center border border-[#e7ebf3] dark:border-gray-700 overflow-hidden">
                                    <span class="material-symbols-outlined text-gray-400">corporate_fare</span>
                                </div>
                                <div class="flex h-6 items-center justify-center rounded-full px-3" :class="getStatusClass(job.status)">
                                    <select v-model="job.status" @change.stop="updateStatus(job)" @click.stop class="bg-transparent border-0 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none">
                                        <option value="saved">Saved</option>
                                        <option value="applied">Applied</option>
                                        <option value="interviewing">Interviewing</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <p class="text-[#0e121b] dark:text-white text-lg font-bold leading-tight">{{
                                    job.position }}</p>
                                <p class="text-[#4d6599] dark:text-gray-400 text-sm font-medium">{{ job.company
                                }}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Match
                                    Score: 85%</span>
                            </div>
                            <div class="flex gap-2" @click.stop>
                                <button @click="editApplication(job)"
                                    class="flex items-center justify-center gap-1 rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-gray-600">
                                    <span class="material-symbols-outlined text-sm">edit</span>
                                    Edit
                                </button>
                                <button @click="openGenerateTailoringModal(job)"
                                    class="flex-1 flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90">
                                    <span class="material-symbols-outlined text-sm">auto_awesome</span>
                                    <span class="truncate">Generate Tailored Resume</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AppFooter></AppFooter>

        <!-- Create List Modal -->
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

        <!-- Generate Tailoring Modal -->
        <div v-if="showGenerateTailoringModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 modal-blur" @click="closeGenerateTailoringModal">
          <div class="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20" @click.stop>
            <div class="flex-1 p-8 lg:p-10 border-r border-slate-100 dark:border-gray-800">
              <div class="flex items-center gap-3 mb-8">
                <div class="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                  <span class="material-symbols-outlined font-bold">auto_awesome</span>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">AI Resume Generation</h2>
                  <p class="text-slate-500 text-sm">Tailoring your profile for the perfect match</p>
                </div>
              </div>
              <div class="space-y-6">
                <div>
                  <p class="text-sm font-medium text-slate-600 dark:text-gray-400 mb-3">
                    AI is tailoring your resume for <span class="text-slate-900 dark:text-white font-semibold tracking-tight">{{ selectedJobForTailoring?.position }}</span> at <span class="text-slate-900 dark:text-white font-semibold tracking-tight">{{ selectedJobForTailoring?.company }}</span>...
                  </p>
                  <div class="w-full h-2.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-violet-500 to-violet-700 w-[65%] rounded-full relative">
                      <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div class="space-y-4 pt-4">
                  <div class="flex items-center gap-3 text-emerald-500">
                    <span class="material-symbols-outlined text-xl">check_circle</span>
                    <span class="text-sm font-medium">Analyzing Job Description</span>
                  </div>
                  <div class="flex items-center gap-3 text-emerald-500">
                    <span class="material-symbols-outlined text-xl">check_circle</span>
                    <span class="text-sm font-medium">Identifying Key Skills</span>
                  </div>
                  <div class="flex items-center gap-3 text-slate-400 dark:text-gray-600">
                    <div class="size-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">Optimizing Professional Summary</span>
                  </div>
                  <div class="flex items-center gap-3 text-slate-300 dark:text-gray-700">
                    <span class="material-symbols-outlined text-xl">radio_button_unchecked</span>
                    <span class="text-sm font-medium">Formatting Experience Sections</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full md:w-[360px] bg-slate-50 dark:bg-gray-800/50 p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6">Generation Settings</h3>
                <div class="space-y-6">
                  <div class="space-y-3">
                    <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Tone of Voice</label>
                    <div class="grid grid-cols-1 gap-2">
                      <button class="flex items-center justify-between px-4 py-3 rounded-xl border-2 border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 transition-all">
                        <span class="text-sm font-bold">Professional</span>
                        <span class="material-symbols-outlined text-lg">check_circle</span>
                      </button>
                      <button class="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:border-violet-300 transition-all">
                        <span class="text-sm font-bold">Confident</span>
                      </button>
                      <button class="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-400 hover:border-violet-300 transition-all">
                        <span class="text-sm font-bold">Modern</span>
                      </button>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Target ATS Score</label>
                      <span class="text-sm font-bold text-violet-600 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded">95+</span>
                    </div>
                    <input class="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600" max="100" min="0" type="range" value="95" />
                    <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Basic</span>
                      <span>Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-10 md:mt-0 pt-6">
                <button @click="startGeneration" class="w-full ai-glow flex items-center justify-center gap-2 rounded-xl h-14 px-6 bg-violet-600 hover:bg-violet-700 text-white text-base font-bold transition-all transform active:scale-[0.98]">
                  <span class="material-symbols-outlined">magic_button</span>
                  <span>Start Generating</span>
                </button>
                <button @click="closeGenerateTailoringModal" class="w-full mt-3 text-slate-500 dark:text-gray-400 text-sm font-medium hover:text-slate-700 dark:hover:text-white transition-colors">
                  Cancel and return
                </button>
              </div>
            </div>
          </div>
        </div>
</div>
</template>

<script setup>
import { computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSavedJobsController } from '../composables/useSavedJobsController.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

// Composables
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Computed
const selectedListId = computed(() => route.params.listId);
const selectedList = computed(() => {
  return jobSearchLists.value.find(list => list.id === selectedListId.value);
});

// Use the controller composable
const {
  jobSearchLists,
  applications,
  isLoadingLists,
  isLoadingApps,
  error,
  searchQuery,
  activeFilter,
  showGenerateTailoringModal,
  selectedJobForTailoring,
  createListModal,
  filters,
  filteredJobs,
  loadJobSearchLists,
  createJobSearchList,
  loadApplications,
  updateApplicationStatus,
  getStatusClass,
  openGenerateTailoringModal,
  closeGenerateTailoringModal,
  resetCreateListModal,
  openCreateListModal
} = useSavedJobsController(selectedListId);

// Methods
const selectList = (listId) => {
  router.push(`/saved-jobs/${listId}`);
};

const updateStatus = async (job) => {
  try {
    await updateApplicationStatus(job.id, job.status, job);
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};

const editApplication = (job) => {
  router.push(`/job-applications/${job.jobSearchListId}/${job.id}/edit`);
};

const openTailoringStudio = (job) => {
  router.push(`/tailoring/${job.id}`);
};

const startGeneration = async () => {
  // Simulate generation process
  try {
    // Here you would call the AI generation API
    // For now, we'll just wait a bit and then navigate to the studio
    await new Promise(resolve => setTimeout(resolve, 2000));
    closeGenerateTailoringModal();
    router.push(`/tailoring/${selectedJobForTailoring.value.id}`);
  } catch (error) {
    console.error('Generation failed:', error);
  }
};

const addJobManually = () => {
  router.push(`/job-applications/${selectedListId.value}/create`);
};

const handleCreateListSubmit = async () => {
  try {
    await createJobSearchList(createListModal.value.name, createListModal.value.description);
    resetCreateListModal();
    await loadJobSearchLists();
    if (selectedListId.value) {
      await loadApplications(selectedListId.value);
    }
  } catch (err) {
    console.error('Failed to create list:', err);
  }
};

watchEffect(async () => {
  if (selectedListId.value) {
    await loadApplications(selectedListId.value);
  } else if (jobSearchLists.value.length > 0) {
    // Default to first list
    router.replace(`/saved-jobs/${jobSearchLists.value[0].id}`);
  }
});

onMounted(async () => {
  await loadJobSearchLists();
  if (selectedListId.value) {
    await loadApplications(selectedListId.value);
  }
});
</script>

<style scoped>
.material-symbols-outlined {
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
display: inline-block;
vertical-align: middle;
}

.modal-blur {
backdrop-filter: blur(8px);
}

.ai-glow {
box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
}
</style>