/**
 * useJobApplicationController
 *
 * Controller composable for job application management.
 * Per technical_design.md §3.2B: "Controllers orchestrate use cases and manage state."
 */
import { ref, computed } from 'vue';
import { ListJobApplicationsUseCase } from '../../core/application/job_application/ListJobApplicationsUseCase.js';
import { CreateJobApplicationUseCase } from '../../core/application/job_application/CreateJobApplicationUseCase.js';
import { UpdateJobApplicationUseCase } from '../../core/application/job_application/UpdateJobApplicationUseCase.js';
import { DeleteJobApplicationUseCase } from '../../core/application/job_application/DeleteJobApplicationUseCase.js';
import { HttpJobApplicationRepository } from '../../infrastructure/api/HttpJobApplicationRepository.js';
import { JobApplication } from '../../core/domain/job_application/JobApplication.js';

export function useJobApplicationController() {
  // Reactive state
  const applications = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Repository instance
  const repository = new HttpJobApplicationRepository();

  // Use case instances
  const listUseCase = new ListJobApplicationsUseCase(repository);
  const createUseCase = new CreateJobApplicationUseCase(repository);
  const updateUseCase = new UpdateJobApplicationUseCase(repository);
  const deleteUseCase = new DeleteJobApplicationUseCase(repository);

  // Computed properties
  const applicationsByStatus = computed(() => {
    if (!applications.value || !Array.isArray(applications.value)) return {};
    const grouped = {};
    applications.value.forEach(app => {
      if (!grouped[app.status]) {
        grouped[app.status] = [];
      }
      grouped[app.status].push(app);
    });
    return grouped;
  });

  const totalApplications = computed(() => applications.value?.length || 0);

  const applicationsByStatusCount = computed(() => {
    if (!applications.value || !Array.isArray(applications.value)) return {};
    const counts = {};
    applications.value.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  });

  // Actions
  const loadApplications = async (jobSearchListId, userId) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await listUseCase.execute({ jobSearchListId, userId });
      applications.value = result || [];
    } catch (err) {
      error.value = err.message || 'Failed to load applications';
      console.error('Error loading applications:', err);
      applications.value = []; // Ensure it's an array
    } finally {
      loading.value = false;
    }
  };

  const createApplication = async (applicationData) => {
    loading.value = true;
    error.value = null;
    try {
      // Pass the data directly as command properties, not as a JobApplication object
      const result = await createUseCase.execute({
        userId: applicationData.userId,
        jobSearchListId: applicationData.jobSearchListId,
        resumeId: applicationData.resumeId,
        company: applicationData.company,
        position: applicationData.position,
        jobDescription: applicationData.jobDescription,
        status: applicationData.status || 'saved',
        appliedDate: applicationData.appliedDate || null,
        notes: applicationData.notes || ''
      });
      applications.value.push(result);
      return result;
    } catch (err) {
      error.value = err.message || 'Failed to create application';
      console.error('Error creating application:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateApplication = async (applicationId, updates) => {
    loading.value = true;
    error.value = null;
    try {
      const existingApp = applications.value.find(app => app.id === applicationId);
      if (!existingApp) {
        throw new Error('Application not found');
      }

      const updatedApplication = new JobApplication(
        existingApp.id,
        existingApp.userId,
        existingApp.jobSearchListId,
        existingApp.resumeId,
        existingApp.company,
        existingApp.position,
        existingApp.jobDescription,
        updates.status || existingApp.status,
        updates.appliedDate || existingApp.appliedDate,
        updates.notes !== undefined ? updates.notes : existingApp.notes
      );

      const result = await updateUseCase.execute({ application: updatedApplication });

      // Update local state
      const index = applications.value.findIndex(app => app.id === applicationId);
      if (index !== -1) {
        applications.value[index] = result.application;
      }

      return result.application;
    } catch (err) {
      error.value = err.message || 'Failed to update application';
      console.error('Error updating application:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteApplication = async (applicationId) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteUseCase.execute({ applicationId });

      // Remove from local state
      applications.value = applications.value.filter(app => app.id !== applicationId);
    } catch (err) {
      error.value = err.message || 'Failed to delete application';
      console.error('Error deleting application:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    applications,
    loading,
    error,

    // Computed
    applicationsByStatus,
    totalApplications,
    applicationsByStatusCount,

    // Actions
    loadApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    clearError
  };
}