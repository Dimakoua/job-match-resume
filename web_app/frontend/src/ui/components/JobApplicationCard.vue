<template>
  <div @click="handleCardClick" class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-[#e7ebf3] dark:border-[#2d364f] hover:shadow-md transition-all cursor-pointer">
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-[#0e121b] dark:text-white mb-1">
          {{ application.position }}
        </h3>
        <p class="text-[#4d6599] dark:text-gray-400 text-sm mb-2">
          {{ application.company }}
        </p>
        <div class="flex items-center gap-2">
          <span :class="getStatusBadgeClass(application.status)"
                class="px-2 py-1 rounded-full text-xs font-medium capitalize">
            {{ application.status }}
          </span>
          <span v-if="atsScore !== null" :class="getAtsScoreBadgeClass(atsScore)"
                class="px-2 py-1 rounded-full text-xs font-medium">
            ATS: {{ atsScore }}%
          </span>
          <span v-if="application.appliedDate" class="text-xs text-gray-500 dark:text-gray-400">
            Applied {{ formatDate(application.appliedDate) }}
          </span>
        </div>
      </div>

      <!-- Actions Menu -->
      <div class="relative">
        <button
          @click.stop="showMenu = !showMenu"
          class="text-[#4d6599] hover:text-[#0e121b] dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div v-if="showMenu" @click.stop class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-[#e7ebf3] dark:border-[#2d364f] z-10">
          <div class="py-1">
            <!-- Status Options -->
            <div class="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Update Status
            </div>
            <button
              v-for="status in statusOptions"
              :key="status"
              @click="handleStatusChange(status)"
              :class="[
                'w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                application.status === status ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'
              ]"
            >
              <span class="capitalize">{{ status }}</span>
            </button>

            <div class="border-t border-gray-200 dark:border-gray-600 my-1"></div>

            <!-- Actions -->
            <button
              @click="handleEdit"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Edit Application
            </button>
            <button
              @click="handleDelete"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete Application
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Description Preview -->
    <div v-if="application.jobDescription" class="mb-4">
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
        {{ application.jobDescription }}
      </p>
    </div>

    <!-- Notes -->
    <div v-if="application.notes" class="mb-4">
      <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Notes
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300">
        {{ application.notes }}
      </p>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
      <span>Created {{ formatDate(application.createdAt) }}</span>
      <span v-if="application.updatedAt && application.updatedAt !== application.createdAt">
        Updated {{ formatDate(application.updatedAt) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAtsScore } from '../composables/useAtsScore.js';

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update-status', 'delete', 'edit']);

const showMenu = ref(false);
const { atsScore } = useAtsScore(props.application);
// Status options for the dropdown
const statusOptions = [
  'saved',
  'applied',
  'interviewing',
  'rejected',
  'accepted',
  'withdrawn'
];

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

const getAtsScoreBadgeClass = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const handleStatusChange = (newStatus) => {
  showMenu.value = false;
  emit('update-status', props.application.id, newStatus);
};

const handleCardClick = () => {
  emit('edit', props.application.id);
};

const handleEdit = () => {
  showMenu.value = false;
  emit('edit', props.application.id);
};

const handleDelete = () => {
  showMenu.value = false;
  emit('delete', props.application.id);
};

// Close menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showMenu.value = false;
  }
};

// Add event listener
document.addEventListener('click', handleClickOutside);
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>