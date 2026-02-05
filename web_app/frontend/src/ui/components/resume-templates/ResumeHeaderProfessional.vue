<template>
  <header class="mb-6 border-t-4 pt-4" :style="{ borderColor: style.accentColor }">
    <h1 class="text-3xl font-bold tracking-tight mb-1" :style="{ fontFamily: fontFamilies[style.headingFont], color: style.accentColor }">
      {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
    </h1>
    <p class="text-lg font-semibold text-gray-700 mb-2">{{ resume.title || 'Professional Title' }}</p>
    <div class="flex flex-wrap gap-3 text-gray-500 border-b pb-4 border-gray-200" :style="contactStyle">
      <span v-if="resume.email">{{ resume.email }}</span>
      <span v-if="resume.phone">• {{ resume.phone }}</span>
      <span v-if="resume.location">• {{ resume.location }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
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

const contactStyle = computed(() => ({
  fontSize: `${props.style.fontSize - 1}px`
}))
</script>