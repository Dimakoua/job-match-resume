<template>
  <div ref="previewContainer" class="relative">
    <component
      :is="currentTemplateComponent"
      :resume="processedResume"
      :layout="layout"
      :style="style"
      :sections="sections"
      :keywordsToHighlight="keywordsToHighlight"
      :hide-empty-sections="hideEmptySections"
    />

    <div
      v-if="showPageLimits && pageBreakPositions.length > 0"
      class="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <div
        v-for="(breakY, index) in pageBreakPositions"
        :key="`page-break-${index}`"
        class="absolute left-0 right-0 border-t border-dashed border-sky-400/80"
        :style="{ top: `${breakY}px` }"
      >
        <span class="absolute -top-3 right-2 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Page {{ index + 1 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getResumeTemplate } from './resume-templates/resumeTemplateFactory.js'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({
      template: 'classic',
      margins: 48,
      sectionSpacing: 24
    })
  },
  style: {
    type: Object,
    default: () => ({
      headingFont: 'inter',
      bodyFont: 'inter',
      fontSize: 11,
      lineHeight: 1.5,
      accentColor: '#2463eb'
    })
  },
  sections: {
    type: Array,
    default: () => []
  },
  keywordsToHighlight: {
    type: Array,
    default: () => []
  },
  hideEmptySections: {
    type: Boolean,
    default: false
  },
  showPageLimits: {
    type: Boolean,
    default: false
  }
})

const previewContainer = ref(null)
const previewSize = ref({ width: 0, height: 0 })
let resizeObserver = null

const A4_RATIO = 1.41421356

const pageHeightPx = computed(() => {
  if (!previewSize.value.width) return 0
  return previewSize.value.width * A4_RATIO
})

const pageBreakPositions = computed(() => {
  const pageHeight = pageHeightPx.value
  const contentHeight = previewSize.value.height

  if (!props.showPageLimits || pageHeight <= 0 || contentHeight <= pageHeight) {
    return []
  }

  const pageCount = Math.ceil(contentHeight / pageHeight)
  const breaks = []

  for (let pageIndex = 1; pageIndex < pageCount; pageIndex += 1) {
    breaks.push(pageIndex * pageHeight)
  }

  return breaks
})

const currentTemplateComponent = computed(() => {
  return getResumeTemplate(props.layout.template)
})

const processedResume = computed(() => {
  if (!props.keywordsToHighlight?.length) {
    return props.resume
  }

  const highlightText = (text) => {
    if (!text) return text

    let highlightedText = text
    props.keywordsToHighlight.forEach(keyword => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-200 dark:bg-yellow-800/30 px-1 rounded font-semibold">$1</span>')
    })

    return highlightedText
  }

  // Deep clone and highlight all text fields
  const highlighted = JSON.parse(JSON.stringify(props.resume))

  const highlightInObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = highlightText(obj[key])
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        highlightInObject(obj[key])
      }
    }
  }

  highlightInObject(highlighted)
  return highlighted
})

onMounted(() => {
  if (!previewContainer.value) return

  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0]
    if (!entry) return

    previewSize.value = {
      width: entry.contentRect.width,
      height: entry.contentRect.height
    }
  })

  resizeObserver.observe(previewContainer.value)
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
</script>
