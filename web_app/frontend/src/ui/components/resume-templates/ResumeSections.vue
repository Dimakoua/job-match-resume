<template>
  <!-- Summary -->
  <div v-if="resume.summary && isSectionVisible('summary')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Profile</h3>
    <p :style="bodyStyle" :class="bodyTextClass">{{ resume.summary }}</p>
  </div>

  <!-- Experience -->
  <div v-if="filledExperiences.length > 0 && isSectionVisible('experience')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Experience</h3>
    <div
      v-for="(exp, index) in filledExperiences"
      :key="index"
      :class="experienceItemClass"
    >
      <div :class="experienceHeaderClass">
        <h4 :class="companyNameClass">{{ exp.company }}</h4>
        <span :class="dateClass">
          {{ exp.startDate }}{{ exp.startDate && exp.endDate ? ' — ' : '' }}{{ exp.endDate }}
        </span>
      </div>
      <p v-if="exp.title" :class="jobTitleClass" :style="{ color: style.accentColor }">{{ exp.title }}</p>
      <p v-if="exp.description" :style="bodyStyle" :class="bodyTextClass">{{ exp.description }}</p>
    </div>
  </div>

  <!-- Education -->
  <div v-if="resume.education && resume.education.length > 0 && isSectionVisible('education')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Education</h3>
    <div v-for="(edu, index) in resume.education" :key="index" :class="educationItemClass">
      <div :class="educationHeaderClass">
        <h4 :class="schoolNameClass">{{ edu.school }}</h4>
        <span :class="dateClass">
          {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
        </span>
      </div>
      <p :class="degreeClass" :style="{ color: style.accentColor }">
        {{ edu.degree }}{{ edu.degree && edu.field ? ', ' : '' }}{{ edu.field }}
      </p>
    </div>
  </div>

  <!-- Projects -->
  <div v-if="resume.projects && resume.projects.length > 0 && isSectionVisible('projects')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Projects</h3>
    <div v-for="(project, index) in resume.projects" :key="index" :class="projectItemClass">
      <div :class="projectHeaderClass">
        <h4 :class="projectNameClass">{{ project.name }}</h4>
        <a v-if="project.link" :href="project.link" target="_blank" :class="projectLinkClass">Link</a>
      </div>
      <p v-if="project.description" :style="bodyStyle" :class="bodyTextClass">{{ project.description }}</p>
    </div>
  </div>

  <!-- Certifications -->
  <div v-if="resume.certifications && resume.certifications.length > 0 && isSectionVisible('certifications')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Certifications</h3>
    <div v-for="(cert, index) in resume.certifications" :key="index" :class="certificationItemClass">
      <div>
        <span :class="certificationNameClass">{{ cert.name }}</span>
        <span v-if="cert.issuer" :class="certificationIssuerClass"> • {{ cert.issuer }}</span>
      </div>
      <span :class="dateClass">{{ cert.date }}</span>
    </div>
  </div>

  <!-- Skills -->
  <div v-if="resume.skills && resume.skills.length > 0 && isSectionVisible('skills')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Expertise</h3>
    <div :class="skillsContainerClass">
      <span
        v-for="(skill, index) in resume.skills"
        :key="index"
        :class="skillTagClass"
        :style="{ backgroundColor: style.accentColor + '15', color: style.accentColor }"
      >
        {{ skill }}
      </span>
    </div>
  </div>

  <!-- Custom Sections -->
  <template v-for="customSection in (customSections || [])" :key="customSection?.id || 'unknown'">
    <div v-if="customSection?.id && isSectionVisible(customSection.id) && resume.customSections?.[customSection.id]" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
      <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle" class="capitalize">{{ customSection.label }}</h3>
      <p :style="bodyStyle" :class="bodyTextClass">{{ resume.customSections[customSection.id] }}</p>
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

// Template-specific styling classes
const sectionHeaderClass = computed(() => {
  const base = 'uppercase'
  switch (props.layout.template) {
    case 'basic':
      return `${base} text-sm font-bold tracking-[0.1em] border-b border-black pb-1 mb-2`
    case 'classic':
      return `${base} text-sm font-bold tracking-widest border-l-4 pl-4 mb-4`
    case 'modern':
      return `${base} text-lg font-bold tracking-widest mb-2`
    case 'minimal':
      return `${base} text-xs font-semibold tracking-widest border-b border-slate-100 pb-2`
    case 'professional':
      return `${base} text-sm font-bold tracking-widest border-l-4 pl-4 mb-4`
    default:
      return `${base} text-xs font-bold tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-1`
  }
})

const sectionHeaderStyle = computed(() => {
  switch (props.layout.template) {
    case 'classic':
    case 'professional':
      return { color: props.style.accentColor, fontFamily: fontFamilies[props.style.headingFont] }
    case 'modern':
      return { fontFamily: fontFamilies[props.style.headingFont] }
    default:
      return { fontFamily: fontFamilies[props.style.headingFont] }
  }
})

const bodyTextClass = computed(() => {
  switch (props.layout.template) {
    case 'basic':
      return 'text-justify'
    case 'modern':
      return 'text-slate-700 leading-relaxed'
    case 'minimal':
      return 'text-slate-600 font-light leading-relaxed'
    default:
      return 'text-gray-700 whitespace-pre-wrap'
  }
})

// Experience styling
const experienceItemClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex flex-col gap-2 mb-6'
    case 'minimal':
      return 'flex flex-col gap-1 mb-4'
    default:
      return 'mb-4'
  }
})

const experienceHeaderClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex justify-between items-baseline'
    case 'minimal':
      return 'flex justify-between items-baseline'
    default:
      return 'flex justify-between items-baseline mb-0.5'
  }
})

const companyNameClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-900 font-bold text-lg'
    case 'minimal':
      return 'text-slate-900 font-medium text-base'
    default:
      return 'font-bold text-xs'
  }
})

const jobTitleClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-primary font-semibold italic'
    case 'minimal':
      return 'text-slate-500 font-light text-xs'
    default:
      return 'text-[10px] font-semibold mb-1'
  }
})

const dateClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-500 text-sm font-medium'
    case 'minimal':
      return 'text-slate-500 text-xs font-light'
    default:
      return 'text-[9px] text-gray-500 font-medium italic'
  }
})

// Education styling
const educationItemClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'mb-4'
    case 'minimal':
      return 'flex justify-between items-baseline mb-4'
    default:
      return 'mb-3'
  }
})

const educationHeaderClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex justify-between items-baseline'
    case 'minimal':
      return '' // Handled by parent flex
    default:
      return 'flex justify-between items-baseline'
  }
})

const schoolNameClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-900 font-bold'
    case 'minimal':
      return 'text-slate-900 font-medium text-base'
    default:
      return 'font-bold text-xs'
  }
})

const degreeClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-600 text-sm'
    case 'minimal':
      return 'text-slate-500 text-sm font-light'
    default:
      return 'text-[10px] font-semibold'
  }
})

// Projects styling
const projectItemClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex flex-col gap-2 mb-4'
    case 'minimal':
      return 'mb-4'
    default:
      return 'mb-3'
  }
})

const projectHeaderClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex justify-between items-baseline'
    case 'minimal':
      return 'flex justify-between items-baseline'
    default:
      return 'flex justify-between items-baseline mb-0.5'
  }
})

const projectNameClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-900 font-bold text-lg'
    case 'minimal':
      return 'text-slate-900 font-medium text-base'
    default:
      return 'font-bold text-xs'
  }
})

const projectLinkClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-500 text-sm'
    case 'minimal':
      return 'text-slate-500 text-xs'
    default:
      return 'text-[9px] text-primary hover:underline font-medium'
  }
})

// Certifications styling
const certificationItemClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex justify-between items-baseline mb-2'
    case 'minimal':
      return 'mb-2'
    default:
      return 'flex justify-between items-baseline mb-1'
  }
})

const certificationNameClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-900 font-bold text-base'
    case 'minimal':
      return 'text-slate-900 font-medium text-sm'
    default:
      return 'font-bold text-xs'
  }
})

const certificationIssuerClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'text-slate-600 text-sm'
    case 'minimal':
      return 'text-slate-500 text-xs'
    default:
      return 'text-[10px] text-gray-600'
  }
})

// Skills styling
const skillsContainerClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'flex flex-wrap gap-2'
    case 'minimal':
      return 'flex flex-wrap gap-x-8 gap-y-3'
    default:
      return 'flex flex-wrap gap-1.5'
  }
})

const skillTagClass = computed(() => {
  switch (props.layout.template) {
    case 'modern':
      return 'px-3 py-1 text-sm font-medium rounded'
    case 'minimal':
      return 'text-xs font-medium uppercase tracking-tighter'
    default:
      return 'px-2 py-0.5 text-[9px] font-semibold rounded'
  }
})

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