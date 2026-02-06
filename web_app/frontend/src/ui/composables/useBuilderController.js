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
import { DraftVersionUseCase } from '../../core/application/editor/DraftVersionUseCase.js'
import { HttpAIService } from '../../infrastructure/api/HttpAIService.js'
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js'
import { ExportService } from '../../infrastructure/api/ExportService.js'
import { DownloadResumeUseCase } from '../../core/application/export/DownloadResumeUseCase.js'
import * as pdfjsLib from 'pdfjs-dist'

export function useBuilderController() {
  // Configure PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.mjs'

  const route = useRoute()
  const router = useRouter()

  // ===== Dependency Injection (DI) =====
  const resumeRepository = new HttpResumeRepository()
  const aiService = new HttpAIService()
  const exportService = new ExportService()
  const draftStorageUseCase = new DraftStorageUseCase('resume_builder_draft', 1000)
  const saveResumeUseCase = new SaveResumeUseCase(resumeRepository)
  const loadResumeUseCase = new LoadResumeUseCase(resumeRepository, draftStorageUseCase)
  const downloadResumeUseCase = new DownloadResumeUseCase(exportService)
  const draftVersionUseCase = new DraftVersionUseCase()

  // ===== State =====
  const activeTab = ref('edit')
  const zoom = ref(1)
  const isSaved = ref(true)
  const isSaving = ref(false)
  const isSyncing = ref(false)
  const resumeId = ref(null)
  const history = ref([])
  let backendAutoSaveTimeout = null

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
    template: 'basic',
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
    allVariations: [],
    selectedVariation: 0,
    error: null
  })

  const uploadModal = ref({
    show: false,
    loading: false,
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
      
      // 1. Immediate Local Draft Save
      draftStorageUseCase.scheduleAutoSave(() => {
        draftStorageUseCase.saveDraft(
          resumeData.value,
          sections.value,
          layoutSettings.value,
          styleSettings.value,
          resumeId.value
        )
      })

      // 2. Debounced Backend Save
      scheduleBackendAutoSave()
    }
  }

  const scheduleBackendAutoSave = () => {
    if (backendAutoSaveTimeout) clearTimeout(backendAutoSaveTimeout)
    
    // Only background save if we have an ID and aren't mid-save
    if (!resumeId.value || isSaving.value) return

    backendAutoSaveTimeout = setTimeout(async () => {
      // Don't auto-save if user manually saved while we were waiting
      if (isSaved.value) return

      try {
        isSyncing.value = true
        await saveResumeUseCase.execute(
          resumeData.value,
          sections.value,
          layoutSettings.value,
          styleSettings.value,
          resumeId.value
        )
        isSaved.value = true
        draftStorageUseCase.clearDraft()
        
        // Also create a periodic backup snapshot
        draftVersionUseCase.saveSnapshot(resumeId.value, 'Auto-save', {
          resumeData: resumeData.value,
          sections: sections.value,
          layoutSettings: layoutSettings.value,
          styleSettings: styleSettings.value
        })
        refreshHistory()
      } catch (error) {
        console.warn('Background auto-save failed:', error)
      } finally {
        isSyncing.value = false
      }
    }, 5000) // 5 second debounce
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

  // ===== Version History =====
  const refreshHistory = () => {
    if (resumeId.value) {
      history.value = draftVersionUseCase.getHistory(resumeId.value)
    }
  }

  const restoreVersion = (version) => {
    if (!version || !version.data) return

    const { resumeData: vData, sections: vSections, layoutSettings: vLayout, styleSettings: vStyle } = version.data
    
    // Update state
    resumeData.value = JSON.parse(JSON.stringify(vData))
    if (vSections) sections.value = JSON.parse(JSON.stringify(vSections))
    if (vLayout) layoutSettings.value = JSON.parse(JSON.stringify(vLayout))
    if (vStyle) styleSettings.value = JSON.parse(JSON.stringify(vStyle))
    
    isSaved.value = false
    activeTab.value = 'edit'
  }

  const clearHistory = () => {
    if (resumeId.value && window.confirm('Are you sure you want to clear all local versions? This cannot be undone.')) {
      draftVersionUseCase.clearHistory(resumeId.value)
      refreshHistory()
    }
  }

  // ===== Event Handlers: Save =====
  const handleSave = async () => {
    if (backendAutoSaveTimeout) clearTimeout(backendAutoSaveTimeout)
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

      // Create a local history snapshot on successful save
      draftVersionUseCase.saveSnapshot(result.id, 'Manual Save', {
        resumeData: resumeData.value,
        sections: sections.value,
        layoutSettings: layoutSettings.value,
        styleSettings: styleSettings.value
      })
      refreshHistory()
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
  const handleDownload = async (format = 'pdf') => {
    if (!resumeId.value) {
      alert('Please save your resume first before downloading.')
      return
    }
    try {
      const command = {
        resumeId: resumeId.value,
        format // 'pdf' or 'docx'
      }
      await downloadResumeUseCase.execute(command)
      // Download is triggered automatically; no additional feedback needed
    } catch (err) {
      console.error('Failed to download resume:', err)
      alert(`Failed to download resume: ${err.message}`)
    }
  }

  // ===== Event Handlers: AI Enhancement =====
  const handleAiEnhance = async (section, index = null) => {
    aiModal.value.show = true
    aiModal.value.loading = true
    aiModal.value.section = section
    aiModal.value.index = index
    aiModal.value.result = null
    aiModal.value.allVariations = []
    aiModal.value.selectedVariation = 0
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
      // Handle variations array from backend
      if (result.variations && Array.isArray(result.variations)) {
        aiModal.value.result = result.variations[0] // Display first variation
        aiModal.value.allVariations = result.variations // Store all for potential future use
      } else {
        aiModal.value.result = result.improvedText || result.text || result
      }
      aiModal.value.loading = false
    } catch (error) {
      console.error('AI Enhancement failed:', error)
      aiModal.value.error = 'Failed to enhance text. Please try again.'
      aiModal.value.loading = false
    }
  }

  const applyAiEnhancement = () => {
    const selectedText = aiModal.value.allVariations.length > 0 
      ? aiModal.value.allVariations[aiModal.value.selectedVariation] 
      : aiModal.value.result

    if (!selectedText) return

    if (aiModal.value.section === 'summary') {
      resumeData.value.summary = selectedText
    } else if (aiModal.value.section === 'experience' && aiModal.value.index !== null) {
      resumeData.value.experience[aiModal.value.index].description = selectedText
    }

    if (resumeId.value) {
      draftVersionUseCase.saveSnapshot(resumeId.value, 'AI Enhancement', {
        resumeData: resumeData.value,
        sections: sections.value,
        layoutSettings: layoutSettings.value,
        styleSettings: styleSettings.value
      })
      refreshHistory()
    }

    aiModal.value.show = false
  }

  // ===== Event Handlers: PDF Upload =====
  const handleUploadPdf = async (file) => {
    uploadModal.value.show = true
    uploadModal.value.loading = true
    uploadModal.value.error = null

    try {
      // Extract text from PDF
      const text = await extractTextFromPdf(file)
      
      // Parse the text using AI
      const parsedData = await aiService.parseResumeText(text)
      
      // Update resume data
      resumeData.value = { ...defaultResumeData, ...parsedData }
      
      uploadModal.value.loading = false
      uploadModal.value.show = false
      
      // Mark as unsaved
      markUnsaved()
    } catch (error) {
      console.error('PDF upload failed:', error)
      uploadModal.value.error = 'Failed to parse PDF. Please try again.'
      uploadModal.value.loading = false
    }
  }

  const extractTextFromPdf = async (file) => {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const pdfData = new Uint8Array(e.target.result)
          const pdfDoc = await pdfjsLib.getDocument(pdfData).promise
          const totalPages = pdfDoc.numPages

          let textContent = ''

          // Create an array of promises for each page
          const pagePromises = []

          for (let i = 1; i <= totalPages; i++) {
            pagePromises.push(pdfDoc.getPage(i).then(async page => {
              const text = await page.getTextContent()
              return text.items.map(item => item.str).join(' ')
            }))
          }

          // Wait for all pages to be processed
          const allText = await Promise.all(pagePromises)

          // Combine all pages' text
          textContent = allText.join('\n')

          resolve(textContent)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
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
        refreshHistory()
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

      // Apply template styling if coming from Examples page
      if (route.query.templateStyle) {
        try {
          const templateStyle = JSON.parse(route.query.templateStyle)
          styleSettings.value = { ...styleSettings.value, ...templateStyle }
        } catch (error) {
          console.warn('Failed to parse template style:', error)
        }
      }

      // Apply template layout if template specified
      if (route.query.template) {
        layoutSettings.value.template = route.query.template
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
    if (backendAutoSaveTimeout) clearTimeout(backendAutoSaveTimeout)
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
    uploadModal,
    resumeTitle,
    // Handlers
    handleSave,
    handleDownload,
    handleAiEnhance,
    applyAiEnhancement,
    handleUploadPdf,
    zoomIn,
    zoomOut,
    // History
    history,
    restoreVersion,
    refreshHistory,
    clearHistory,
    isSyncing
  }
}
