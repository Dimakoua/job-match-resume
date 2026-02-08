<template>
  <header class="pb-4 mb-4">
    <div class="flex flex-col items-center text-center">
      <h1 class="font-bold text-[18pt] text-gray-900 mb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">
        {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
      </h1>
      <p class="text-[12pt] text-gray-700 mb-2" :style="{ fontFamily: fontFamilies[style.bodyFont] }" v-html="resume.title || 'Professional Title'"></p>
      <div class="text-[10pt] text-gray-600 flex flex-wrap justify-center gap-2">
        <span v-if="resume.location">{{ resume.location }}</span>
        <span v-if="resume.phone">| {{ resume.phone }}</span>
        <span v-if="resume.email">| {{ resume.email }}</span>
        <span v-if="resume.github">| <a :href="resume.github" target="_blank" class="underline">GitHub</a></span>
        <span v-if="resume.linkedin">| <a :href="resume.linkedin" target="_blank" class="underline">LinkedIn</a></span>
      </div>
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

// ...existing code...
</script>