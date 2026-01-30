<template>
  <div class="bg-white shadow-2xl rounded-sm p-12 flex flex-col overflow-hidden text-[#222]" style="aspect-ratio: 1 / 1.414; width: 600px; min-width: 600px; font-family: 'Inter', sans-serif;">
    <!-- Header -->
    <header class="mb-6 flex justify-between border-b-2 border-[#2463eb] pb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-1">
          {{ resume.firstName || 'Your' }} {{ resume.lastName || 'Name' }}
        </h1>
        <p class="text-lg text-[#2463eb] font-medium">{{ resume.title || 'Professional Title' }}</p>
      </div>
      <div class="text-right text-[10px] text-gray-500 leading-relaxed">
        <p v-if="resume.email">{{ resume.email }}</p>
        <p v-if="resume.phone">{{ resume.phone }}</p>
        <p v-if="resume.location">{{ resume.location }}</p>
        <p v-if="resume.linkedin">{{ resume.linkedin }}</p>
      </div>
    </header>

    <!-- Summary -->
    <div v-if="resume.summary" class="mb-6">
      <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-1">Profile</h3>
      <p class="text-[11px] leading-relaxed text-gray-700">{{ resume.summary }}</p>
    </div>

    <!-- Experience -->
    <div v-if="filledExperiences.length > 0" class="mb-6">
      <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1">Experience</h3>
      <div 
        v-for="(exp, index) in filledExperiences" 
        :key="index"
        class="mb-4"
        :class="{ 'opacity-60': index > 0 }"
      >
        <div class="flex justify-between items-baseline mb-0.5">
          <h4 class="font-bold text-xs">{{ exp.company }}</h4>
          <span class="text-[9px] text-gray-500 font-medium italic">
            {{ exp.startDate }}{{ exp.startDate && exp.endDate ? ' — ' : '' }}{{ exp.endDate }}
          </span>
        </div>
        <p v-if="exp.title" class="text-[#2463eb] text-[10px] font-semibold mb-1">{{ exp.title }}</p>
        <p v-if="exp.description" class="text-[10px] text-gray-600 leading-relaxed">{{ exp.description }}</p>
      </div>
    </div>

    <!-- Skills -->
    <div v-if="resume.skills && resume.skills.length > 0" class="mt-auto">
      <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1">Expertise</h3>
      <div class="flex flex-wrap gap-1.5">
        <span 
          v-for="(skill, index) in resume.skills" 
          :key="index"
          class="px-2 py-0.5 bg-gray-100 text-[9px] font-semibold rounded"
        >
          {{ skill }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="isEmpty" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p class="text-sm">Start filling in your information</p>
        <p class="text-xs">Your resume preview will appear here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  }
})

// Filter out empty experience entries
const filledExperiences = computed(() => {
  if (!props.resume.experience) return []
  return props.resume.experience.filter(exp => 
    exp.company || exp.title || exp.description
  )
})

const isEmpty = computed(() => {
  const r = props.resume
  return !r.firstName && !r.lastName && !r.title && !r.summary && 
         filledExperiences.value.length === 0 && 
         (!r.skills || r.skills.length === 0)
})
</script>
