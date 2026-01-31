/**
 * useBuilderController (Composable)
 * 
 * Acts as the Controller layer that wires Use Cases with the Vue component.
 * Orchestrates business logic without being tied to Vue render logic.
 * 
 * Per technical_design.md §3.2D: "The Composable acts as the Controller."
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { SaveResumeUseCase } from '../../core/application/editor/SaveResumeUseCase.js'
import { LoadResumeUseCase } from '../../core/application/editor/LoadResumeUseCase.js'
import { DraftStorageUseCase } from '../../core/application/editor/DraftStorageUseCase.js'
import { DownloadPdfUseCase } from '../../core/application/editor/DownloadPdfUseCase.js'
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js'
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js'

export function useBuilderController() {
  const route = useRoute()
  const router = useRouter()

  // ===== Dependency Injection (DI) =====
  const resumeRepository = new HttpResumeRepository()
  const aiService = new HttpAIService()
  const draftStorageUseCase = new DraftStorageUseCase('resume_builder_draft', 1000)
  const saveResumeUseCase = new SaveResumeUseCase(resumeRepository)
  const loadResumeUseCase = new LoadResumeUseCase(resumeRepository, draftStorageUseCase)
  const downloadPdfUseCase = new DownloadPdfUseCase()

  // ===== State =====
  const activeTab = ref('edit')
  const zoom = ref(1)
  const isSaved = ref(true)
  const isSaving = ref(false)
  const resumeId = ref(null)

  const defaultResumeData = {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: []
  }

  const resumeData = ref({ ...defaultResumeData })

  const sections = ref([
    { id: 'personal', label: 'Personal Info', visible: true, required: true },
    { id: 'summary', label: 'Professional Summary', visible: true },
    { id: 'experience', label: 'Work Experience', visible: true },
    { id: 'skills', label: 'Skills', visible: true },
    { id: 'education', label: 'Education', visible: false },
    { id: 'certifications', label: 'Certifications', visible: false },
    { id: 'projects', label: 'Projects', visible: false },
  ])

  const layoutSettings = ref({
    template: 'classic',
    margins: 48,
    sectionSpacing: 24,
  })

  const styleSettings = ref({
    headingFont: 'inter',
    bodyFont: 'inter',
    fontSize: 11,
    lineHeight: 1.5,
    accentColor: '#2463eb'
  })

  const aiModal = ref({
    show: false,
    loading: false,
    section: '',
    index: null,
    result: null,
    error: null
  })

  // ===== Computed =====
  const resumeTitle = computed(() => {
    if (resumeData.value.title) {
      return resumeData.value.title
    }
    if (resumeData.value.firstName || resumeData.value.lastName) {
      return `${resumeData.value.firstName} ${resumeData.value.lastName}`.trim() + "'s Resume"
    }
    return 'Untitled Resume'
  })

  // ===== Auto-save functionality =====
  // Instead of watching all state changes, we'll use explicit marking of changes
  const markUnsaved = () => {
    if (!isSaving.value) {
      isSaved.value = false
      draftStorageUseCase.scheduleAutoSave(() => {
        draftStorageUseCase.saveDraft(
          resumeData.value,
          sections.value,
          layoutSettings.value,
          styleSettings.value,
          resumeId.value
        )
      })
    }
  }

  // Watch for user-initiated changes only (after initial load completes)
  // Using ref instead of plain variable for proper reactivity
  const isInitialLoadComplete = ref(false)
  
  watch(
    [resumeData, sections, layoutSettings, styleSettings],
    () => {
      if (isInitialLoadComplete.value && !isSaving.value) {
        markUnsaved()
      }
    },
    { deep: true, flush: 'post' }  // flush: 'post' prevents recursive updates during render
  )

  // ===== Event Handlers: Save =====
  const handleSave = async () => {
    isSaving.value = true
    try {
      const result = await saveResumeUseCase.execute(
        resumeData.value,
        sections.value,
        layoutSettings.value,
        styleSettings.value,
        resumeId.value
      )

      resumeId.value = result.id
      isSaved.value = true
      draftStorageUseCase.clearDraft()

      // Update URL if new resume
      if (!route.query.id) {
        router.replace({ query: { id: result.id } })
      }
    } catch (error) {
      console.error('Failed to save:', error)
      // Show user-friendly error without re-throwing
      // to avoid recursive state mutations
      alert('Failed to save resume. Please check your internet connection and try again.')
    } finally {
      isSaving.value = false
    }
  }

  // ===== Event Handlers: Download =====
  const handleDownload = () => {
    downloadPdfUseCase.download(
      resumeData.value,
      styleSettings.value,
      layoutSettings.value
    )
  }

  // ===== Event Handlers: AI Enhancement =====
  const handleAiEnhance = async (section, index = null) => {
    aiModal.value.show = true
    aiModal.value.loading = true
    aiModal.value.section = section
    aiModal.value.index = index
    aiModal.value.result = null
    aiModal.value.error = null

    try {
      let textToEnhance = ''
      if (section === 'summary') {
        textToEnhance = resumeData.value.summary
      } else if (section === 'experience' && index !== null) {
        textToEnhance = resumeData.value.experience[index]?.description || ''
      }

      if (!textToEnhance.trim()) {
        aiModal.value.error = 'Please enter some text first to enhance.'
        aiModal.value.loading = false
        return
      }

      const result = await aiService.improveText(textToEnhance)
      aiModal.value.result = result.improvedText || result.text || result
      aiModal.value.loading = false
    } catch (error) {
      console.error('AI Enhancement failed:', error)
      aiModal.value.error = 'Failed to enhance text. Please try again.'
      aiModal.value.loading = false
    }
  }

  const applyAiEnhancement = () => {
    if (!aiModal.value.result) return

    if (aiModal.value.section === 'summary') {
      resumeData.value.summary = aiModal.value.result
    } else if (aiModal.value.section === 'experience' && aiModal.value.index !== null) {
      resumeData.value.experience[aiModal.value.index].description = aiModal.value.result
    }

    aiModal.value.show = false
  }

  // ===== Zoom Controls =====
  const zoomIn = () => {
    if (zoom.value < 1.5) {
      zoom.value = Math.min(1.5, zoom.value + 0.1)
    }
  }

  const zoomOut = () => {
    if (zoom.value > 0.5) {
      zoom.value = Math.max(0.5, zoom.value - 0.1)
    }
  }

  // ===== Lifecycle: Unsaved changes warning =====
  const handleBeforeUnload = (e) => {
    if (!isSaved.value) {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
  }

  onBeforeRouteLeave((to, from, next) => {
    if (!isSaved.value) {
      const answer = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!answer) {
        next(false)
        return
      }
    }
    next()
  })

  // ===== Lifecycle: Load resume =====
  onMounted(async () => {
    window.addEventListener('beforeunload', handleBeforeUnload)

    try {
      const id = route.query.id
      if (id) {
        resumeId.value = id
        const loaded = await loadResumeUseCase.execute(id)
        
        // Merge with defaults to ensure all fields exist
        resumeData.value = { ...defaultResumeData, ...loaded.resumeData }
        
        if (loaded.sections && loaded.sections.length > 0) {
          sections.value = loaded.sections
        }
        if (loaded.layoutSettings) layoutSettings.value = loaded.layoutSettings
        if (loaded.styleSettings) styleSettings.value = loaded.styleSettings
        isSaved.value = loaded.source === 'backend'
      } else {
        // New resume - try to restore draft
        const draft = loadResumeUseCase.loadFromDraftOrNew()
        if (draft) {
          resumeData.value = { ...defaultResumeData, ...draft.resumeData }
          if (draft.sections) sections.value = draft.sections
          if (draft.layoutSettings) layoutSettings.value = draft.layoutSettings
          if (draft.styleSettings) styleSettings.value = draft.styleSettings
          isSaved.value = !draft.isUnsaved
        }
      }
    } catch (error) {
      console.error('Failed to load resume:', error)
    }

    // Use nextTick to defer enabling watcher until after Vue's update cycle completes
    // This ensures all reactive assignments have propagated before tracking user changes
    await nextTick()
    isInitialLoadComplete.value = true
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    draftStorageUseCase.cancelAutoSave()
  })

  // ===== Expose to component =====
  return {
    // State
    activeTab,
    zoom,
    isSaved,
    isSaving,
    resumeId,
    resumeData,
    sections,
    layoutSettings,
    styleSettings,
    aiModal,
    resumeTitle,
    // Handlers
    handleSave,
    handleDownload,
    handleAiEnhance,
    applyAiEnhancement,
    zoomIn,
    zoomOut
  }
}
