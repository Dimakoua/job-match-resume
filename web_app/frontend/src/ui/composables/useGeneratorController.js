/**
 * useGeneratorController (Composable)
 * 
 * Manages the multi-step wizard for generating a resume from a job description.
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js'
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js'
import { GenerateFromJDUseCase } from '../../core/application/ai/GenerateFromJDUseCase.js'
import { ListTemplatesUseCase } from '../../core/application/editor/ListTemplatesUseCase.js'
import { filterSupportedTemplates } from '../../ui/components/resume-templates/resumeTemplateFactory.js'

export function useGeneratorController() {
  const router = useRouter()

  // ===== Dependency Injection (DI) =====
  const aiService = new HttpAIService()
  const resumeRepo = new HttpResumeRepository()
  const generateFromJDUseCase = new GenerateFromJDUseCase(aiService, resumeRepo)
  const listTemplatesUseCase = new ListTemplatesUseCase(resumeRepo)

  // ===== State =====
  const step = ref(1) // 1: JD + User Data, 2: Template, 3: Loading
  const jobDescription = ref('')
  const userData = ref('')
  const selectedTemplate = ref('basic')
  const templates = ref([])
  const isGenerating = ref(false)
  const error = ref(null)

  // ===== Actions =====
  const fetchTemplates = async () => {
    try {
      const allTemplates = await listTemplatesUseCase.execute()
      // Filter to only show templates that have frontend components
      templates.value = filterSupportedTemplates(allTemplates)
    } catch (err) {
      console.error('Failed to load templates:', err)
      // Fallback to minimal set if API fails
      templates.value = [
        { id: 'basic', name: 'Basic' },
        { id: 'modern', name: 'Modern' },
        { id: 'professional', name: 'Professional' }
      ]
    }
  }

  const nextStep = () => {
    if (step.value === 1) {
      if (!jobDescription.value.trim()) {
        error.value = 'Please paste a job description first.'
        return
      }
      if (!userData.value.trim()) {
        error.value = 'Please paste your current resume or key details.'
        return
      }
    }
    error.value = null
    step.value++
  }

  const prevStep = () => {
    error.value = null
    step.value--
  }

  const selectTemplate = (id) => {
    selectedTemplate.value = id
  }

  const handleGenerate = async () => {
    isGenerating.value = true
    error.value = null
    step.value = 3 // Move to generating step

    try {
      const resume = await generateFromJDUseCase.execute(
        jobDescription.value,
        userData.value,
        selectedTemplate.value
      )
      
      // Redirect to builder with the new resume ID
      router.push(`/builder?id=${resume.id}`)
    } catch (err) {
      step.value = 2 // Go back to template selection
      error.value = 'Generation failed. Please check your inputs or try again.'
      console.error('Generation error:', err)
    } finally {
      isGenerating.value = false
    }
  }

  // ===== Lifecycle =====
  onMounted(() => {
    fetchTemplates()
  })

  return {
    // State
    step,
    jobDescription,
    userData,
    selectedTemplate,
    templates,
    isGenerating,
    error,
    // Actions
    nextStep,
    prevStep,
    selectTemplate,
    handleGenerate
  }
}
