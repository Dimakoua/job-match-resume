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
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js'

export function useDashboardController() {
  const router = useRouter()

  // ===== Dependency Injection (DI) =====
  const resumesListService = new HttpResumesListService()
  const resumeRepository = new HttpResumeRepository()
  const listResumesUseCase = new ListResumesUseCase(resumesListService)

  // ===== State =====
  const resumes = ref([])
  const isLoading = ref(true)
  const error = ref(null)

  const previewModal = ref({
    show: false,
    resume: null,
    sections: [],
    layout: { template: 'basic' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#3b82f6' },
    isLoading: false
  })

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
    // TODO: Implement download via backend API later
    console.log('Download resume requested:', resume.id)
    alert('PDF Download is coming soon!')
  }

  const handlePreviewResume = async (resume) => {
    previewModal.value.show = true
    previewModal.value.isLoading = true
    previewModal.value.resume = resume

    try {
      const full = await resumeRepository.get(resume.id)
      
      // Map domain entity logic for preview
      previewModal.value.sections = full.sections?.visibleSections || full.sections || []
      previewModal.value.layout = full.sections?.layout || { template: full.templateId || 'basic' }
      previewModal.value.style = full.sections?.style || { headingFont: 'inter', bodyFont: 'inter', accentColor: '#3b82f6' }
      
      // Also merge root content into resume preview object
      const { visibleSections, layout, style, ...content } = full.sections || {}
      previewModal.value.resume = { ...resume, ...content }
    } catch (err) {
      console.error('Failed to load preview:', err)
      previewModal.value.show = false
    } finally {
      previewModal.value.isLoading = false
    }
  }

  const handleDuplicateResume = async (resume) => {
    try {
      const full = await resumeRepository.get(resume.id)
      const dataToSave = {
        title: `${full.title} (Copy)`,
        templateId: full.templateId,
        sections: full.sections
      }
      await resumeRepository.create(dataToSave)
      await loadResumes()
    } catch (err) {
      console.error('Failed to duplicate resume:', err)
      alert('Failed to duplicate resume.')
    }
  }

  const handleDeleteResume = async (resume) => {
    if (!window.confirm(`Are you sure you want to delete "${resume.title || 'this resume'}"?`)) return
    
    try {
      await resumeRepository.delete(resume.id)
      await loadResumes()
    } catch (err) {
      console.error('Failed to delete resume:', err)
      alert('Failed to delete resume.')
    }
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
    previewModal,
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
