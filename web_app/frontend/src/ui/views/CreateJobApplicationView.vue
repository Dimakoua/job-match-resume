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
              <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Add Job Application</h1>
              <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal">
                Fill in the details to track your job application
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

          <!-- Form -->
          <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d364f]">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Company -->
              <div>
                <label for="company" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Company *</label>
                <input
                  id="company"
                  v-model="form.company"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                  placeholder="Enter company name"
                />
              </div>

              <!-- Position -->
              <div>
                <label for="position" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Position *</label>
                <input
                  id="position"
                  v-model="form.position"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                  placeholder="Enter job position"
                />
              </div>

              <!-- Job Description -->
              <div>
                <label for="jobDescription" class="block text-sm font-medium text-[#0e121b] dark:text-white mb-2">Job Description</label>
                <textarea
                  id="jobDescription"
                  v-model="form.jobDescription"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-[#0e121b] dark:text-white"
                  placeholder="Paste the job description here"
                ></textarea>
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
                    {{ resume.name }}
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
                  <span v-if="loading">Creating...</span>
                  <span v-else>Add Application</span>
                </button>
              </div>
            </form>
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
import { useAuthStore } from '../stores/useAuthStore.js';
// Assume there's a resume controller
// import { useResumeController } from '../composables/useResumeController.js';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { createApplication, loading } = useJobApplicationController();

// const { resumes, loadResumes } = useResumeController(); // TODO: implement
const resumes = ref([]); // Placeholder

const form = ref({
  company: '',
  position: '',
  jobDescription: '',
  resumeId: '',
  status: 'saved',
  appliedDate: '',
  notes: ''
});

const handleSubmit = async () => {
  try {
    const applicationData = {
      userId: authStore.user.id,
      jobSearchListId: route.params.listId,
      resumeId: form.value.resumeId || null,
      company: form.value.company,
      position: form.value.position,
      jobDescription: form.value.jobDescription,
      status: form.value.status,
      appliedDate: form.value.appliedDate || null,
      notes: form.value.notes
    };

    await createApplication(applicationData);
    router.push(`/job-applications/${route.params.listId}`);
  } catch (err) {
    console.error('Failed to create application:', err);
    // TODO: show error message
  }
};

onMounted(() => {
  // loadResumes(); // TODO: load resumes
});
</script>