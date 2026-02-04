/**
 * useResumeController
 *
 * Controller composable for resume management.
 * Per technical_design.md §3.2B: "Controllers orchestrate use cases and manage state."
 */
import { ref } from 'vue';
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js';

export function useResumeController() {
  // Reactive state
  const resumes = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Repository instance
  const repository = new HttpResumeRepository();

  // Actions
  const loadResumes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const result = await repository.list();
      resumes.value = result || [];
    } catch (err) {
      error.value = err.message || 'Failed to load resumes';
      console.error('Error loading resumes:', err);
      resumes.value = [];
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    resumes,
    loading,
    error,

    // Actions
    loadResumes,
    clearError
  };
}