<template>
  <header class="border-b-2 border-double border-gray-300 pb-8 mb-8" :style="{ borderColor: style.accentColor }">
    <div class="flex justify-between items-start">
      <div class="max-w-[70%]">
        <h1 class="text-4xl font-bold text-gray-900 mb-2 uppercase tracking-tight" :style="{ fontFamily: fontFamilies[style.headingFont] }">
          {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
        </h1>
        <p class="text-lg italic text-gray-600" :style="{ fontFamily: fontFamilies[style.bodyFont] }">{{ resume.title || 'Professional Title' }}</p>
      </div>
      <div class="text-right text-xs uppercase tracking-widest text-gray-500 leading-loose" :style="contactStyle">
        <p v-if="resume.location">{{ resume.location }}</p>
        <p v-if="resume.phone">{{ resume.phone }}</p>
        <p v-if="resume.email" class="lowercase">{{ resume.email }}</p>
        <p v-if="resume.linkedin">{{ resume.linkedin }}</p>
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

const contactStyle = computed(() => ({
  fontSize: `${props.style.fontSize - 1}px`
}))
</script>