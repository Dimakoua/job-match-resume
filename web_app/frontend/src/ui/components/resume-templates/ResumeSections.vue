<template>
  <!-- Summary -->
  <div v-if="resume.summary && isSectionVisible('summary')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Profile</h3>
    <p :style="bodyStyle" class="text-gray-700 whitespace-pre-wrap">{{ resume.summary }}</p>
  </div>

  <!-- Experience -->
  <div v-if="filledExperiences.length > 0 && isSectionVisible('experience')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Experience</h3>
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
      <p v-if="exp.title" class="text-[10px] font-semibold mb-1" :style="{ color: style.accentColor }">{{ exp.title }}</p>
      <p v-if="exp.description" :style="bodyStyle" class="text-gray-600 whitespace-pre-wrap">{{ exp.description }}</p>
    </div>
  </div>

  <!-- Education -->
  <div v-if="resume.education && resume.education.length > 0 && isSectionVisible('education')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Education</h3>
    <div v-for="(edu, index) in resume.education" :key="index" class="mb-3">
      <div class="flex justify-between items-baseline">
        <h4 class="font-bold text-xs">{{ edu.school }}</h4>
        <span class="text-[9px] text-gray-500 font-medium italic">
          {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
        </span>
      </div>
      <p class="text-[10px] font-semibold" :style="{ color: style.accentColor }">
        {{ edu.degree }}{{ edu.degree && edu.field ? ', ' : '' }}{{ edu.field }}
      </p>
    </div>
  </div>

  <!-- Projects -->
  <div v-if="resume.projects && resume.projects.length > 0 && isSectionVisible('projects')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Projects</h3>
    <div v-for="(project, index) in resume.projects" :key="index" class="mb-3">
      <div class="flex justify-between items-baseline mb-0.5">
        <h4 class="font-bold text-xs">{{ project.name }}</h4>
        <a v-if="project.link" :href="project.link" target="_blank" class="text-[9px] text-primary hover:underline font-medium">Link</a>
      </div>
      <p v-if="project.description" :style="bodyStyle" class="text-gray-600 whitespace-pre-wrap">{{ project.description }}</p>
    </div>
  </div>

  <!-- Certifications -->
  <div v-if="resume.certifications && resume.certifications.length > 0 && isSectionVisible('certifications')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Certifications</h3>
    <div v-for="(cert, index) in resume.certifications" :key="index" class="flex justify-between items-baseline mb-1">
      <div>
        <span class="font-bold text-xs">{{ cert.name }}</span>
        <span v-if="cert.issuer" class="text-[10px] text-gray-600"> • {{ cert.issuer }}</span>
      </div>
      <span class="text-[9px] text-gray-500">{{ cert.date }}</span>
    </div>
  </div>

  <!-- Skills -->
  <div v-if="resume.skills && resume.skills.length > 0 && isSectionVisible('skills')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 border-b border-gray-100 pb-1" :style="{ fontFamily: fontFamilies[style.headingFont] }">Expertise</h3>
    <div class="flex flex-wrap gap-1.5">
      <span
        v-for="(skill, index) in resume.skills"
        :key="index"
        class="px-2 py-0.5 text-[9px] font-semibold rounded"
        :style="{ backgroundColor: style.accentColor + '15', color: style.accentColor }"
      >
        {{ skill }}
      </span>
    </div>
  </div>

  <!-- Custom Sections -->
  <template v-for="customSection in (customSections || [])" :key="customSection?.id || 'unknown'">
    <div v-if="customSection?.id && isSectionVisible(customSection.id) && resume.customSections?.[customSection.id]" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
      <h3 class="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-1 capitalize" :style="{ fontFamily: fontFamilies[style.headingFont] }">{{ customSection.label }}</h3>
      <p :style="bodyStyle" class="text-gray-700 whitespace-pre-wrap">{{ resume.customSections[customSection.id] }}</p>
    </div>
  </template>

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
</template>

<script setup>
import { computed } from 'vue'

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

const fontFamilies = {
  'inter': "'Inter', sans-serif",
  'playfair': "'Playfair Display', serif",
  'roboto': "'Roboto', sans-serif",
  'lora': "'Lora', serif",
  'open-sans': "'Open Sans', sans-serif",
  'roboto-mono': "'Roboto Mono', monospace"
}

const bodyStyle = computed(() => ({
  fontSize: `${props.style.fontSize}px`,
  lineHeight: props.style.lineHeight,
  fontFamily: fontFamilies[props.style.bodyFont]
}))

// Filter out empty experience entries
const filledExperiences = computed(() => {
  if (!props.resume.experience) return []
  return props.resume.experience.filter(exp =>
    exp.company || exp.title || exp.description
  )
})

const isSectionVisible = (sectionId) => {
  if (props.sections.length === 0) return true
  const section = props.sections.find(s => s.id === sectionId)
  return section ? section.visible : true
}

const customSections = computed(() => {
  if (!props.sections || !Array.isArray(props.sections)) return []
  return props.sections.filter(s => s?.custom === true)
})

const isEmpty = computed(() => {
  const r = props.resume
  return !r.firstName && !r.lastName && !r.title && !r.summary &&
         filledExperiences.value.length === 0 &&
         (!r.education || r.education.length === 0) &&
         (!r.projects || r.projects.length === 0) &&
         (!r.certifications || r.certifications.length === 0) &&
         (!r.skills || r.skills.length === 0)
})
</script>