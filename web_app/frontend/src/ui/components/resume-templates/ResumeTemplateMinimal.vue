<template>
  <div
    class="bg-white shadow-2xl rounded-sm flex flex-col overflow-y-auto text-[#222] p-4"
    :style="previewStyle"
  >
    <ResumeHeaderMinimal :resume="resume" :style="style" />
    <ResumeSections
      :resume="resume"
      :layout="layout"
      :style="style"
      :sections="sections"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResumeHeaderMinimal from './ResumeHeaderMinimal.vue'
import ResumeSections from './ResumeSections.vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({
      template: 'minimal',
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

const fontFamilies = {
  'inter': "'Inter', sans-serif",
  'playfair': "'Playfair Display', serif",
  'roboto': "'Roboto', sans-serif",
  'lora': "'Lora', serif",
  'open-sans': "'Open Sans', sans-serif",
  'roboto-mono': "'Roboto Mono', monospace"
}

const previewStyle = computed(() => ({
  aspectRatio: '1 / 1.414',
  minWidth: '600px',
  fontFamily: fontFamilies[props.style.bodyFont],
  padding: `${props.layout.margins}px`
}))
</script>