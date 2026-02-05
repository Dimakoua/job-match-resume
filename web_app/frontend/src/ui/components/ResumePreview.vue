<template>
  <component
    :is="currentTemplateComponent"
    :resume="resume"
    :layout="layout"
    :style="style"
    :sections="sections"
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
  }
})

const currentTemplateComponent = computed(() => {
  return getResumeTemplate(props.layout.template)
})
</script>
