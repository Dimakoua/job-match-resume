/**
 * useDashboardController (Composable)
 * 
 * Acts as the Controller layer that wires Use Cases with the Dashboard Vue component.
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ListResumesUseCase } from '../../core/application/editor/ListResumesUseCase.js'
import { HttpResumesListService } from '../../infrastructure/api/HttpResumesListService.js'

export function useDashboardController() {
  const router = useRouter()

  // ===== Dependency Injection (DI) =====
  const resumesListService = new HttpResumesListService()
  const listResumesUseCase = new ListResumesUseCase(resumesListService)

  // ===== State =====
  const resumes = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  // ===== Event Handlers =====
  const loadResumes = async () => {
    isLoading.value = true
    error.value = null

    try {
      resumes.value = await listResumesUseCase.execute()
    } catch (err) {
      error.value = 'Failed to load resumes. Please try again.'
      console.error('Error loading resumes:', err)
    } finally {
      isLoading.value = false
    }
  }

  const handleCreateWithAI = () => {
    router.push('/generator')
  }

  const handleCreateFromScratch = () => {
    router.push('/builder')
  }

  const handleEditResume = (resume) => {
    router.push(`/builder?id=${resume.id}`)
  }

  const handleDownloadResume = (resume) => {
    // TODO: Implement download
    console.log('Download resume:', resume.id)
  }

  const handlePreviewResume = (resume) => {
    // TODO: Implement preview modal
    console.log('Preview resume:', resume.id)
  }

  const handleDuplicateResume = (resume) => {
    // TODO: Implement duplicate
    console.log('Duplicate resume:', resume.id)
  }

  const handleDeleteResume = (resume) => {
    // TODO: Implement delete with confirmation
    console.log('Delete resume:', resume.id)
  }

  // ===== Lifecycle =====
  onMounted(() => {
    loadResumes()
  })

  // ===== Expose to component =====
  return {
    // State
    resumes,
    isLoading,
    error,
    // Handlers
    loadResumes,
    handleCreateWithAI,
    handleCreateFromScratch,
    handleEditResume,
    handleDownloadResume,
    handlePreviewResume,
    handleDuplicateResume,
    handleDeleteResume
  }
}
