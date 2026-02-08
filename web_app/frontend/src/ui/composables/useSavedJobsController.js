/**
 * useSavedJobsController
 *
 * Controller composable for the Saved Jobs view.
 * Orchestrates job search lists and applications management.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ListJobSearchListsUseCase } from '../../core/application/job_search_list/ListJobSearchListsUseCase.js';
import { CreateJobSearchListUseCase } from '../../core/application/job_search_list/CreateJobSearchListUseCase.js';
import { UpdateJobSearchListUseCase } from '../../core/application/job_search_list/UpdateJobSearchListUseCase.js';
import { DeleteJobSearchListUseCase } from '../../core/application/job_search_list/DeleteJobSearchListUseCase.js';
import { ListJobApplicationsUseCase } from '../../core/application/job_application/ListJobApplicationsUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { ArchiveJobApplicationUseCase } from '../../core/application/job_application/ArchiveJobApplicationUseCase.js';
import { UnarchiveJobApplicationUseCase } from '../../core/application/job_application/UnarchiveJobApplicationUseCase.js';
import { HttpJobSearchListRepository } from '../../infrastructure/api/HttpJobSearchListRepository.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { useAuthStore } from '../stores/useAuthStore.js';

export function useSavedJobsController(selectedListIdRef = null) {
  // ===== Dependency Injection (DI) =====
  const jobSearchListRepository = new HttpJobSearchListRepository();
  const jobApplicationRepository = new HttpJobApplicationRepository();

  const listJobSearchListsUseCase = new ListJobSearchListsUseCase(jobSearchListRepository);
  const createJobSearchListUseCase = new CreateJobSearchListUseCase(jobSearchListRepository);
  const updateJobSearchListUseCase = new UpdateJobSearchListUseCase(jobSearchListRepository);
  const deleteJobSearchListUseCase = new DeleteJobSearchListUseCase(jobSearchListRepository);
  const listJobApplicationsUseCase = new ListJobApplicationsUseCase(jobApplicationRepository);
  const updateJobApplicationUseCase = new UpdateJobApplicationUseCase(jobApplicationRepository);
  const archiveJobApplicationUseCase = new ArchiveJobApplicationUseCase(jobApplicationRepository);
  const unarchiveJobApplicationUseCase = new UnarchiveJobApplicationUseCase(jobApplicationRepository);

  const authStore = useAuthStore();
  const route = useRoute();
  const router = useRouter();

  // ===== State =====
  const jobSearchLists = ref([]);
  const applications = ref([]);
  const isLoadingLists = ref(false);
  const isLoadingApps = ref(false);
  const error = ref(null);

  // UI State
  const searchQuery = ref('');
  const activeFilter = ref('all');
  const isArchiveView = ref(false);
  const createListModal = ref({
    show: false,
    name: '',
    description: ''
  });
  const editListModal = ref({
    show: false,
    id: null,
    name: '',
    description: ''
  });

  // Initialize activeFilter from URL query parameter
  const getInitialActiveFilter = () => {
    const filter = route.query.filter;
    if (filter && ['all', 'recent', 'saved', 'applied', 'interviewing', 'rejected'].includes(filter)) {
      return filter;
    }
    return 'all';
  };

  activeFilter.value = getInitialActiveFilter();

  // Initialize isArchiveView from route
  isArchiveView.value = route.path === '/saved-jobs/archive';

  // Watch for route changes to update isArchiveView
  watchEffect(() => {
    isArchiveView.value = route.path === '/saved-jobs/archive';
  });

  // Watch for activeFilter changes and update URL
  watchEffect(() => {
    const currentFilter = route.query.filter;
    const newFilter = activeFilter.value;
    
    if (currentFilter !== newFilter) {
      router.replace({
        query: {
          ...route.query,
          filter: newFilter !== 'all' ? newFilter : undefined
        }
      });
    }
  });

  // ===== Computed =====
  const filters = computed(() => [
    { key: 'all', label: 'All Jobs' },
    { key: 'recent', label: 'Recently Added' },
    { key: 'saved', label: 'Saved' },
    { key: 'applied', label: 'Applied' },
    { key: 'interviewing', label: 'Interviewing' },
  ]);

  const filteredJobs = computed(() => {
    let filtered = applications.value;

    // Filter by archive status
    if (isArchiveView.value) {
      filtered = filtered.filter(job => job.archived);
    } else {
      filtered = filtered.filter(job => !job.archived);
    }

    // Filter by selected list (if provided)
    if (selectedListIdRef?.value && !isArchiveView.value) {
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
    if (activeFilter.value === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (activeFilter.value === 'saved') {
      filtered = filtered.filter(job => job.status === 'saved');
    } else if (activeFilter.value === 'applied') {
      filtered = filtered.filter(job => job.status === 'applied');
    } else if (activeFilter.value === 'interviewing') {
      filtered = filtered.filter(job => job.status === 'interviewing');
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

  const updateJobSearchList = async (id, name, description) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const updatedList = await updateJobSearchListUseCase.execute({
        id,
        userId,
        name,
        description
      });

      // Update local state
      const index = jobSearchLists.value.findIndex(list => list.id === id);
      if (index !== -1) {
        jobSearchLists.value[index] = updatedList;
      }
      return updatedList;
    } catch (err) {
      error.value = 'Failed to update job search list. Please try again.';
      console.error('Error updating job search list:', err);
      throw err;
    }
  };

  const deleteJobSearchList = async (id) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await deleteJobSearchListUseCase.execute({
        id,
        userId
      });

      // Remove from local state
      jobSearchLists.value = jobSearchLists.value.filter(list => list.id !== id);

      // If the deleted list was selected, redirect to first list or default
      if (selectedListIdRef?.value === id) {
        const remainingLists = jobSearchLists.value;
        if (remainingLists.length > 0) {
          // This will be handled by the component's watchEffect
        } else {
          // No lists left, perhaps redirect to a default view
        }
      }
    } catch (err) {
      error.value = 'Failed to delete job search list. Please try again.';
      console.error('Error deleting job search list:', err);
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
        userId,
        includeArchived: isArchiveView.value
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

  const archiveApplication = async (applicationId) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await archiveJobApplicationUseCase.execute({ id: applicationId, userId });
      
      // Remove from local state if not in archive view
      if (!isArchiveView.value) {
        applications.value = applications.value.filter(app => app.id !== applicationId);
      }
    } catch (err) {
      error.value = 'Failed to archive application. Please try again.';
      console.error('Error archiving application:', err);
      throw err;
    }
  };

  const unarchiveApplication = async (applicationId) => {
    try {
      const userId = authStore.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      await unarchiveJobApplicationUseCase.execute({ id: applicationId, userId });
      
      // Remove from local state if in archive view
      if (isArchiveView.value) {
        applications.value = applications.value.filter(app => app.id !== applicationId);
      }
    } catch (err) {
      error.value = 'Failed to unarchive application. Please try again.';
      console.error('Error unarchiving application:', err);
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

  const openEditListModal = (list) => {
    editListModal.value = {
      show: true,
      id: list.id,
      name: list.name,
      description: list.description
    };
  };

  const resetEditListModal = () => {
    editListModal.value = {
      show: false,
      id: null,
      name: '',
      description: ''
    };
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
    isArchiveView,
    createListModal,
    editListModal,

    // Computed
    filters,
    filteredJobs,

    // Methods
    loadJobSearchLists,
    createJobSearchList,
    updateJobSearchList,
    deleteJobSearchList,
    loadApplications,
    loadAllApplications,
    updateApplicationStatus,
    archiveApplication,
    unarchiveApplication,
    getStatusClass,
    resetCreateListModal,
    openCreateListModal,
    openEditListModal,
    resetEditListModal
  };
}