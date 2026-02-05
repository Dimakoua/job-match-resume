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

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Company -->
              <div>
                <label for="company" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Company *</label>
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  required
                  :class="`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white ${fieldErrors.company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`"
                  placeholder="Enter company name"
                />
                <div v-if="fieldErrors.company" class="text-red-500 text-sm mt-1">{{ fieldErrors.company }}</div>
              </div>

              <!-- Position -->
              <div>
                <label for="position" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Position *</label>
                <input
                  id="position"
                  v-model="form.position"
                  type="text"
                  required
                  :class="`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white ${fieldErrors.position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`"
                  placeholder="Enter job position"
                />
                <div v-if="fieldErrors.position" class="text-red-500 text-sm mt-1">{{ fieldErrors.position }}</div>
              </div>

              <!-- Job Description -->
              <div>
                <label for="jobDescription" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Job Description *</label>
                <textarea
                  id="jobDescription"
                  v-model="form.jobDescription"
                  rows="4"
                  required
                  :class="`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white ${fieldErrors.jobDescription ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`"
                  placeholder="Paste the job description here"
                ></textarea>
                <div v-if="fieldErrors.jobDescription" class="text-red-500 text-sm mt-1">{{ fieldErrors.jobDescription }}</div>
              </div>

              <!-- Resume Selection -->
              <div>
                <label for="resumeId" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Resume</label>
                <select
                  id="resumeId"
                  v-model="form.resumeId"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                >
                  <option value="">Select a resume (optional)</option>
                  <option v-for="resume in resumes" :key="resume.id" :value="resume.id">
                    {{ resume.title }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Status</label>
                <select
                  id="status"
                  v-model="form.status"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                >
                  <option value="saved">Saved</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <!-- Applied Date -->
              <div>
                <label for="appliedDate" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Applied Date</label>
                <input
                  id="appliedDate"
                  v-model="form.appliedDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                />
              </div>

              <!-- Notes -->
              <div>
                <label for="notes" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Notes</label>
                <textarea
                  id="notes"
                  v-model="form.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                  placeholder="Any additional notes"
                ></textarea>
              </div>

              <!-- Submit Button -->
              <div class="flex justify-end">
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex items-center justify-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="loading">Updating...</span>
                  <span v-else>Update Application</span>
                </button>
              </div>
            </form>
            <div v-if="fieldErrors.api" class="text-red-500 text-sm mt-4">{{ fieldErrors.api }}</div>
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

const handleSubmit = async () => {
  fieldErrors.value = {};

  if (!form.value.company.trim()) {
    fieldErrors.value.company = 'Company is required';
  }
  if (!form.value.position.trim()) {
    fieldErrors.value.position = 'Position is required';
  }
  if (!form.value.jobDescription.trim()) {
    fieldErrors.value.jobDescription = 'Job description is required';
  }

  if (Object.keys(fieldErrors.value).length > 0) {
    return;
  }

  try {
    const applicationData = {
      resumeId: form.value.resumeId || null,
      company: form.value.company,
      position: form.value.position,
      jobDescription: form.value.jobDescription,
      status: form.value.status,
      appliedDate: form.value.appliedDate || null,
      notes: form.value.notes
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