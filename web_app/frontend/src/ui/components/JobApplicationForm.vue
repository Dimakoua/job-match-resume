<template>
  <div class="space-y-6">
    <form @submit.prevent="$emit('submit', form)" class="space-y-6">
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
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex items-center justify-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Updating...</span>
          <span v-else>{{ submitButtonText || 'Update Application' }}</span>
        </button>
      </div>
    </form>
    <div v-if="fieldErrors.api" class="text-red-500 text-sm">{{ fieldErrors.api }}</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  resumes: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  submitButtonText: {
    type: String,
    default: 'Update Application'
  }
});

const emit = defineEmits(['submit', 'cancel']);

const fieldErrors = ref({});

const form = ref({
  company: props.initialData.company || '',
  position: props.initialData.position || '',
  jobDescription: props.initialData.jobDescription || '',
  resumeId: props.initialData.resumeId || '',
  status: props.initialData.status || 'saved',
  appliedDate: props.initialData.appliedDate ? new Date(props.initialData.appliedDate).toISOString().split('T')[0] : '',
  notes: props.initialData.notes || ''
});

// Watch for changes to initialData to update form
watch(() => props.initialData, (newData) => {
  if (newData) {
    form.value = {
      company: newData.company || '',
      position: newData.position || '',
      jobDescription: newData.jobDescription || '',
      resumeId: newData.resumeId || '',
      status: newData.status || 'saved',
      appliedDate: newData.appliedDate ? new Date(newData.appliedDate).toISOString().split('T')[0] : '',
      notes: newData.notes || ''
    };
  }
}, { deep: true });
</script>