/**
 * useSavedJobsController
 *
 * Controller composable for the Saved Jobs view.
 * Orchestrates job search lists and applications management.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed } from 'vue';
import { ListJobSearchListsUseCase } from '../../core/application/job_search_list/ListJobSearchListsUseCase.js';
import { CreateJobSearchListUseCase } from '../../core/application/job_search_list/CreateJobSearchListUseCase.js';
import { ListJobApplicationsUseCase } from '../../core/application/job_application/ListJobApplicationsUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { HttpJobSearchListRepository } from '../../infrastructure/api/HttpJobSearchListRepository.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { useAuthStore } from '../stores/useAuthStore.js';

export function useSavedJobsController(selectedListIdRef = null) {
  // ===== Dependency Injection (DI) =====
  const jobSearchListRepository = new HttpJobSearchListRepository();
  const jobApplicationRepository = new HttpJobApplicationRepository();

  const listJobSearchListsUseCase = new ListJobSearchListsUseCase(jobSearchListRepository);
  const createJobSearchListUseCase = new CreateJobSearchListUseCase(jobSearchListRepository);
  const listJobApplicationsUseCase = new ListJobApplicationsUseCase(jobApplicationRepository);
  const updateJobApplicationUseCase = new UpdateJobApplicationUseCase(jobApplicationRepository);

  const authStore = useAuthStore();

  // ===== State =====
  const jobSearchLists = ref([]);
  const applications = ref([]);
  const isLoadingLists = ref(false);
  const isLoadingApps = ref(false);
  const error = ref(null);

  // UI State
  const searchQuery = ref('');
  const activeFilter = ref('all');
  const createListModal = ref({
    show: false,
    name: '',
    description: ''
  });

  // ===== Computed =====
  const filters = computed(() => [
    { key: 'all', label: 'All Jobs' },
    { key: 'highMatch', label: 'Matching > 90%' },
    { key: 'recent', label: 'Recently Added' },
    { key: 'saved', label: 'Saved' },
    { key: 'applied', label: 'Applied' },
  ]);

  const filteredJobs = computed(() => {
    let filtered = applications.value;

    // Filter by selected list (if provided)
    if (selectedListIdRef?.value) {
      filtered = filtered.filter(job => job.jobSearchListId === selectedListIdRef.value);
    }

    // Search filter
    if (searchQuery.value) {
      filtered = filtered.filter(job =>
        job.position.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // Active filter
    if (activeFilter.value === 'highMatch') {
      filtered = filtered.filter(job => (job.matchScore || 0) > 90);
    } else if (activeFilter.value === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (activeFilter.value === 'saved') {
      filtered = filtered.filter(job => job.status === 'saved');
    } else if (activeFilter.value === 'applied') {
      filtered = filtered.filter(job => job.status === 'applied');
    }

    return filtered;
  });

  // ===== Methods =====
  const loadJobSearchLists = async () => {
    isLoadingLists.value = true;
    error.value = null;

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      jobSearchLists.value = await listJobSearchListsUseCase.execute({ userId });
    } catch (err) {
      error.value = 'Failed to load job search lists. Please try again.';
      console.error('Error loading job search lists:', err);
    } finally {
      isLoadingLists.value = false;
    }
  };

  const createJobSearchList = async (name, description) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const newList = await createJobSearchListUseCase.execute({
        name,
        description,
        userId
      });

      jobSearchLists.value.push(newList);
      return newList;
    } catch (err) {
      error.value = 'Failed to create job search list. Please try again.';
      console.error('Error creating job search list:', err);
      throw err;
    }
  };

  const loadApplications = async (listId) => {
    isLoadingApps.value = true;
    error.value = null;

    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const apps = await listJobApplicationsUseCase.execute({
        jobSearchListId: listId,
        userId
      });
      applications.value = apps;
      return apps;
    } catch (err) {
      error.value = 'Failed to load applications. Please try again.';
      console.error('Error loading applications:', err);
      throw err;
    } finally {
      isLoadingApps.value = false;
    }
  };

  const loadAllApplications = async () => {
    applications.value = [];
    for (const list of jobSearchLists.value) {
      try {
        const apps = await loadApplications(list.id);
        applications.value.push(...apps);
      } catch (error) {
        console.error('Failed to load applications for list', list.id, error);
      }
    }
  };

  const updateApplicationStatus = async (applicationId, status, application) => {
    try {
      // Create updated application object
      const updatedApplication = { ...application, status };
      const updatedApp = await updateJobApplicationUseCase.execute({ application: updatedApplication });
      // Update local state
      const index = applications.value.findIndex(app => app.id === applicationId);
      if (index !== -1) {
        applications.value[index] = updatedApp;
      }
      return updatedApp;
    } catch (err) {
      error.value = 'Failed to update application status. Please try again.';
      console.error('Error updating application status:', err);
      throw err;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'saved': return 'bg-gray-100 text-gray-700';
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'interviewing': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const resetCreateListModal = () => {
    createListModal.value = {
      show: false,
      name: '',
      description: ''
    };
  };

  const openCreateListModal = () => {
    createListModal.value.show = true;
  };

  return {
    // State
    jobSearchLists,
    applications,
    isLoadingLists,
    isLoadingApps,
    error,
    searchQuery,
    activeFilter,
    createListModal,

    // Computed
    filters,
    filteredJobs,

    // Methods
    loadJobSearchLists,
    createJobSearchList,
    loadApplications,
    loadAllApplications,
    updateApplicationStatus,
    getStatusClass,
    resetCreateListModal,
    openCreateListModal
  };
}