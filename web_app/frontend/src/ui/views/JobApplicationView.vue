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
              <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Job Applications</h1>
              <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal">
                Track your job applications and their progress
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="handleCreateApplication"
                class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-primary text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span class="truncate">Add Application</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="space-y-4">
            <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500 mb-4">{{ error }}</p>
            <button @click="loadApplications" class="text-primary hover:underline">Try again</button>
          </div>

          <!-- Applications List -->
          <div v-else-if="applications && applications.length > 0" class="space-y-4">
            <!-- Status Summary -->
            <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d364f]">
              <h2 class="text-lg font-bold text-[#0e121b] dark:text-white mb-4">Application Status</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(count, status) in applicationsByStatusCount" :key="status"
                     class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div class="text-2xl font-bold text-primary">{{ count }}</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 capitalize">{{ status }}</div>
                </div>
              </div>
            </div>

            <!-- Applications by Status -->
            <div v-for="(apps, status) in applicationsByStatus" :key="status" class="space-y-3">
              <h3 class="text-xl font-bold text-[#0e121b] dark:text-white capitalize flex items-center gap-2">
                <span :class="getStatusBadgeClass(status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ status }}
                </span>
                <span class="text-gray-500 dark:text-gray-400">({{ apps.length }})</span>
              </h3>

              <div class="space-y-3">
                <JobApplicationCard
                  v-for="application in apps"
                  :key="application.id"
                  :application="application"
                  @update-status="handleUpdateStatus"
                  @delete="handleDeleteApplication"
                />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20">
            <div class="border-2 border-dashed border-[#d0d7e7] bg-white/50 dark:bg-gray-900/50 px-6 py-20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No job applications yet</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-6">Start tracking your job applications to stay organized.</p>
              <button
                @click="handleCreateApplication"
                class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14M5 12h14" />
                </svg>
                Add Your First Application
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import JobApplicationCard from '../components/JobApplicationCard.vue';
import { useJobApplicationController } from '../composables/useJobApplicationController.js';
import { useAuthStore } from '../stores/useAuthStore.js';

// Composables
const route = useRoute();
const authStore = useAuthStore();
const {
  applications,
  loading,
  error,
  applicationsByStatus,
  applicationsByStatusCount,
  loadApplications,
  updateApplication,
  deleteApplication,
  clearError
} = useJobApplicationController();

// Computed
const jobSearchListId = computed(() => route.params.listId);

// Methods
const getStatusBadgeClass = (status) => {
  const classes = {
    saved: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    applied: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    interviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    withdrawn: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  };
  return classes[status] || classes.saved;
};

const handleCreateApplication = () => {
  // TODO: Navigate to create application form
  console.log('Create application clicked');
};

const handleUpdateStatus = async (applicationId, newStatus) => {
  try {
    await updateApplication(applicationId, { status: newStatus });
  } catch (err) {
    console.error('Failed to update application status:', err);
  }
};

const handleDeleteApplication = async (applicationId) => {
  if (confirm('Are you sure you want to delete this application?')) {
    try {
      await deleteApplication(applicationId);
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  }
};

// Lifecycle
onMounted(async () => {
  if (jobSearchListId.value && authStore.user?.id) {
    await loadApplications(jobSearchListId.value, authStore.user.id);
  }
});
</script>