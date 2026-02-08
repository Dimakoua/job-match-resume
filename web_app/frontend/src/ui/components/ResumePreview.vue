<template>
  <component
    :is="currentTemplateComponent"
    :resume="processedResume"
    :layout="layout"
    :style="style"
    :sections="sections"
    :keywordsToHighlight="keywordsToHighlight"
  />
</template>

<script setup>
import { computed } from 'vue'
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
  }
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
</script>
