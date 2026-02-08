<template>
  <header class="text-center mb-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 uppercase mb-2" :style="{ fontFamily: fontFamilies[style.headingFont] }">
      {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
    </h1>
    <p class="text-lg text-gray-700 mb-2" :style="{ fontFamily: fontFamilies[style.bodyFont] }" v-html="resume.title || 'Professional Title'"></p>
    <div class="flex justify-center gap-4 text-gray-500" :style="contactStyle">
      <span v-if="resume.location">{{ resume.location }}</span>
      <span v-if="resume.phone">{{ resume.phone }}</span>
      <span v-if="resume.email">{{ resume.email }}</span>
      <span v-if="resume.linkedin">{{ resume.linkedin }}</span>
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