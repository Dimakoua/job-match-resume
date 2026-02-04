/**
 * useJobSearchListController (Composable)
 *
 * Acts as the Controller layer that wires Use Cases with the Vue component.
 * Orchestrates business logic without being tied to Vue render logic.
 *
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref } from 'vue'
import { CreateJobSearchListUseCase } from '../../core/application/job_search_list/CreateJobSearchListUseCase.js'
import { ListJobSearchListsUseCase } from '../../core/application/job_search_list/ListJobSearchListsUseCase.js'
import { UpdateJobSearchListUseCase } from '../../core/application/job_search_list/UpdateJobSearchListUseCase.js'
import { DeleteJobSearchListUseCase } from '../../core/application/job_search_list/DeleteJobSearchListUseCase.js'
import { HttpJobSearchListRepository } from '../../infrastructure/api/HttpJobSearchListRepository.js'
import { useAuthStore } from '../stores/useAuthStore.js'

export function useJobSearchListController() {
  // ===== Dependency Injection (DI) =====
  const repository = new HttpJobSearchListRepository()
  const createUseCase = new CreateJobSearchListUseCase(repository)
  const listUseCase = new ListJobSearchListsUseCase(repository)
  const updateUseCase = new UpdateJobSearchListUseCase(repository)
  const deleteUseCase = new DeleteJobSearchListUseCase(repository)

  const authStore = useAuthStore()

  // ===== State =====
  const lists = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ===== Event Handlers =====
  const loadLists = async () => {
    isLoading.value = true
    error.value = null

    try {
      const userId = authStore.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      lists.value = await listUseCase.execute({ userId })
    } catch (err) {
      error.value = 'Failed to load job search lists. Please try again.'
      console.error('Error loading job search lists:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createList = async (name, description = null) => {
    try {
      const userId = authStore.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const newList = await createUseCase.execute({
        userId,
        name,
        description
      })

      // Add to local state
      lists.value.push(newList)

      return newList
    } catch (err) {
      console.error('Failed to create job search list:', err)
      throw new Error(err.message || 'Failed to create job search list')
    }
  }

  const updateList = async (id, updates) => {
    try {
      const userId = authStore.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      const updatedList = await updateUseCase.execute({
        id,
        userId,
        ...updates
      })

      // Update local state
      const index = lists.value.findIndex(list => list.id === id)
      if (index !== -1) {
        lists.value[index] = updatedList
      }

      return updatedList
    } catch (err) {
      console.error('Failed to update job search list:', err)
      throw new Error(err.message || 'Failed to update job search list')
    }
  }

  const deleteList = async (id) => {
    try {
      const userId = authStore.user?.id
      if (!userId) {
        throw new Error('User not authenticated')
      }

      await deleteUseCase.execute({ id, userId })

      // Remove from local state
      lists.value = lists.value.filter(list => list.id !== id)
    } catch (err) {
      console.error('Failed to delete job search list:', err)
      throw new Error(err.message || 'Failed to delete job search list')
    }
  }

  // ===== Expose to component =====
  return {
    // State
    lists,
    isLoading,
    error,
    // Handlers
    loadLists,
    createList,
    updateList,
    deleteList
  }
}