<template>
  <header class="mb-6 flex justify-between border-b-2 pb-4" :style="{ borderColor: style.accentColor }">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">
        {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
      </h1>
      <p class="text-lg font-medium" :style="{ color: style.accentColor }">{{ resume.title || 'Professional Title' }}</p>
    </div>
    <div class="text-right text-gray-500 leading-relaxed" :style="contactStyle">
      <p v-if="resume.email">{{ resume.email }}</p>
      <p v-if="resume.phone">{{ resume.phone }}</p>
      <p v-if="resume.location">{{ resume.location }}</p>
      <p v-if="resume.linkedin">{{ resume.linkedin }}</p>
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