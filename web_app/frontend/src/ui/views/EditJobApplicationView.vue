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
              <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Edit Job Application</h1>
              <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal">
                Update the details of your job application
              </p>
            </div>
            <div class="flex gap-3">
              <button
                @click="$router.back()"
                class="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-5 bg-gray-200 text-gray-800 gap-2 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="space-y-4">
            <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          </div>

          <!-- Form -->
          <div v-else class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d364f]">
            <JobApplicationForm
              :initial-data="form"
              :resumes="resumes"
              :loading="loading"
              submit-button-text="Update Application"
              @submit="handleSubmit"
              @cancel="$router.back()"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import JobApplicationForm from '../components/JobApplicationForm.vue';
import { useJobApplicationController } from '../composables/useJobApplicationController.js';
import { useResumeController } from '../composables/useResumeController.js';
import { useAuthStore } from '../stores/useAuthStore.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { getApplication, updateApplication, loading } = useJobApplicationController();
const { resumes, loadResumes } = useResumeController();
const fieldErrors = ref({});
const application = ref(null);

const form = ref({
  company: '',
  position: '',
  jobDescription: '',
  resumeId: '',
  status: 'saved',
  appliedDate: '',
  notes: ''
});

const loadApplication = async () => {
  try {
    const app = await getApplication(route.params.applicationId, authStore.user.id);
    application.value = app;
    form.value.company = app.company || '';
    form.value.position = app.position || '';
    form.value.jobDescription = app.jobDescription || '';
    form.value.resumeId = app.resumeId || '';
    form.value.status = app.status || 'saved';
    form.value.appliedDate = app.appliedDate ? app.appliedDate.toISOString().split('T')[0] : '';
    form.value.notes = app.notes || '';
  } catch (err) {
    console.error('Failed to load application:', err);
    fieldErrors.value.api = 'Failed to load application';
  }
};

const handleSubmit = async (formData) => {
  try {
    const applicationData = {
      resumeId: formData.resumeId || null,
      company: formData.company,
      position: formData.position,
      jobDescription: formData.jobDescription,
      status: formData.status,
      appliedDate: formData.appliedDate || null,
      notes: formData.notes
    };

    console.log('Updating application with data:', applicationData);
    await updateApplication(route.params.applicationId, applicationData, application.value);
    router.push(`/saved-jobs/${route.params.listId}`);
  } catch (err) {
    console.error('Failed to update application:', err);
    fieldErrors.value.api = err.message || 'Failed to update application. Please try again.';
  }
};

onMounted(() => {
  loadApplication();
  loadResumes();
});
</script>