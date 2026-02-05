<template>
  <!-- Summary -->
  <div v-if="resume.summary && isSectionVisible('summary')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">Profile</h3>
    <p :style="bodyStyle" :class="bodyTextClass">{{ resume.summary }}</p>
  </div>

  <!-- Experience -->
  <div v-if="filledExperiences.length > 0 && isSectionVisible('experience')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">
      <span v-if="layout.template === 'academic'" class="text-center">
        Research Appointments
        <div class="academic-divider mx-auto w-1/3 mt-2"></div>
      </span>
      <span v-else-if="layout.template === 'creative'">
        <span class="size-2 bg-primary rounded-full"></span>
        Experience
      </span>
      <span v-else-if="layout.template === 'technical'">Professional Experience</span>
      <span v-else>Experience</span>
    </h3>
    <div
      v-for="(exp, index) in filledExperiences"
      :key="index"
      :class="experienceItemClass"
    >
      <div v-if="layout.template === 'creative'" class="absolute -left-[9px] top-0 size-4 bg-primary rounded-full ring-4 ring-white"></div>
      <div :class="experienceHeaderClass">
        <h4 v-if="layout.template === 'academic'" :class="companyNameClass">{{ exp.company }}</h4>
        <h4 v-else-if="layout.template === 'creative'" :class="companyNameClass">{{ exp.title }}</h4>
        <h4 v-else-if="layout.template === 'technical'" :class="companyNameClass">{{ exp.title }} | {{ exp.company }}</h4>
        <h4 v-else :class="companyNameClass">{{ exp.company }}</h4>
        <span :class="dateClass">
          {{ exp.startDate }}{{ exp.startDate && exp.endDate ? ' — ' : '' }}{{ exp.endDate }}
        </span>
      </div>
      <p v-if="exp.title && layout.template !== 'creative' && layout.template !== 'technical'" :class="jobTitleClass" :style="{ color: style.accentColor }">{{ exp.title }}</p>
      <p v-if="exp.title && layout.template === 'creative'" :class="jobTitleClass">{{ exp.company }}</p>
      <p v-if="exp.description" :style="bodyStyle" :class="bodyTextClass">
        <span v-if="layout.template === 'technical'">
          <ul class="list-disc list-inside space-y-1">
            <li v-for="line in exp.description.split('\n')" :key="line">{{ line }}</li>
          </ul>
        </span>
        <span v-else-if="layout.template === 'creative'">
          <ul class="font-serif space-y-2 text-sm leading-relaxed list-disc ml-4">
            <li v-for="line in exp.description.split('\n')" :key="line">{{ line }}</li>
          </ul>
        </span>
        <span v-else>{{ exp.description }}</span>
      </p>
      <p v-if="layout.template === 'technical'" class="text-[11px] font-mono font-medium text-blue-600">
        <span class="font-bold uppercase mr-1">Technologies used:</span> {{ exp.technologies || 'Not specified' }}
      </p>
    </div>
  </div>

  <!-- Education -->
  <div v-if="resume.education && resume.education.length > 0 && isSectionVisible('education')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">
      <span v-if="layout.template === 'academic'" class="text-center">
        Education
        <div class="academic-divider mx-auto w-1/4"></div>
      </span>
      <span v-else-if="layout.template === 'creative'">
        <span class="size-2 bg-primary rounded-full"></span>
        Education
      </span>
      <span v-else-if="layout.template === 'technical'">Education</span>
      <span v-else>Education</span>
    </h3>
    <div v-for="(edu, index) in resume.education" :key="index" :class="educationItemClass">
      <div :class="educationHeaderClass">
        <h4 v-if="layout.template === 'academic'" :class="schoolNameClass">{{ edu.school }}</h4>
        <h4 v-else-if="layout.template === 'creative'" :class="schoolNameClass">{{ edu.degree }} {{ edu.field }}</h4>
        <h4 v-else-if="layout.template === 'technical'" :class="schoolNameClass">{{ edu.degree }} {{ edu.field }} | {{ edu.school }}</h4>
        <h4 v-else :class="schoolNameClass">{{ edu.school }}</h4>
        <span :class="dateClass">
          {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
        </span>
      </div>
      <p v-if="layout.template === 'academic'" :class="degreeClass">
        {{ edu.degree }}{{ edu.degree && edu.field ? ', ' : '' }}{{ edu.field }}
      </p>
      <p v-else-if="layout.template === 'creative'" :class="degreeClass">{{ edu.school }}</p>
      <p v-if="layout.template === 'technical'" :class="degreeClass">{{ edu.coursework || 'Coursework not specified' }}</p>
      <p v-else :class="degreeClass" :style="{ color: style.accentColor }">
        {{ edu.degree }}{{ edu.degree && edu.field ? ', ' : '' }}{{ edu.field }}
      </p>
    </div>
  </div>

  <!-- Projects -->
  <div v-if="resume.projects && resume.projects.length > 0 && isSectionVisible('projects')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">
      <span v-if="layout.template === 'academic'" class="text-center">
        Publications
        <div class="academic-divider mx-auto w-1/4"></div>
      </span>
      <span v-else-if="layout.template === 'creative'">
        <span class="size-2 bg-primary rounded-full"></span>
        Recent Projects
      </span>
      <span v-else-if="layout.template === 'technical'">Selected Projects</span>
      <span v-else>Projects</span>
    </h3>
    <div v-if="layout.template === 'academic'" class="space-y-4">
      <h4 class="text-sm font-bold italic border-b border-gray-100 pb-1">Publications</h4>
      <div
        v-for="(project, index) in resume.projects"
        :key="index"
        :class="projectItemClass"
      >
        <span class="text-sm font-bold min-w-[20px]">[{{ index + 1 }}]</span>
        <p class="text-sm">{{ project.name }}</p>
      </div>
    </div>
    <div v-else-if="layout.template === 'creative'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="(project, index) in resume.projects"
        :key="index"
        :class="projectItemClass"
      >
        <h4 :class="projectNameClass">{{ project.name }}</h4>
        <p v-if="project.link" :class="projectLinkClass">Link</p>
        <p class="text-xs text-slate-600 leading-snug">{{ project.description }}</p>
      </div>
    </div>
    <div v-else-if="layout.template === 'technical'" class="grid grid-cols-2 gap-6">
      <div
        v-for="(project, index) in resume.projects"
        :key="index"
        :class="projectItemClass"
      >
        <h3 :class="projectNameClass">{{ project.name }}</h3>
        <p :class="projectLinkClass">{{ project.description }}</p>
        <p v-if="project.technologies" class="text-[10px] font-mono text-blue-600">{{ project.technologies }}</p>
      </div>
    </div>
    <div v-else>
      <div v-for="(project, index) in resume.projects" :key="index" :class="projectItemClass">
        <div :class="projectHeaderClass">
          <h4 :class="projectNameClass">{{ project.name }}</h4>
          <a v-if="project.link" :href="project.link" target="_blank" :class="projectLinkClass">Link</a>
        </div>
        <p v-if="project.description" :style="bodyStyle" :class="bodyTextClass">{{ project.description }}</p>
      </div>
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
    <h3 :class="sectionHeaderClass" :style="sectionHeaderStyle">
      <span v-if="layout.template === 'creative'">Core Skills</span>
      <span v-else-if="layout.template === 'technical'">Technical Skills</span>
      <span v-else>Expertise</span>
    </h3>
    <div v-if="layout.template === 'technical'" :class="skillsContainerClass">
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Languages</h3>
        <p class="text-sm mt-1">{{ resume.skills.slice(0, 4).join(', ') }}</p>
      </div>
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Frameworks</h3>
        <p class="text-sm mt-1">{{ resume.skills.slice(4, 8).join(', ') }}</p>
      </div>
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Tools & Infra</h3>
        <p class="text-sm mt-1">{{ resume.skills.slice(8, 12).join(', ') }}</p>
      </div>
    </div>
    <div v-else-if="layout.template === 'creative'" :class="skillsContainerClass">
      <div class="space-y-4">
        <div v-for="skill in resume.skills.slice(0, Math.min(3, resume.skills.length))" :key="skill.name || skill">
          <div class="flex justify-between mb-1">
            <span class="text-xs font-bold text-slate-700">{{ skill.name || skill }}</span>
            <span class="text-xs font-bold text-primary">{{ skill.level || '85%' }}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-1.5">
            <div class="bg-primary h-1.5 rounded-full" :style="{ width: skill.level || '85%' }"></div>
          </div>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <span
          v-for="skill in resume.skills.slice(3)"
          :key="skill.name || skill"
          class="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase"
        >
          {{ skill.name || skill }}
        </span>
      </div>
    </div>
    <div v-else :class="skillsContainerClass">
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
    case 'academic':
      return `${base} text-lg font-bold uppercase tracking-widest inline-block pb-1 mb-8`
    case 'creative':
      return `${base} text-2xl font-black mb-4 flex items-center gap-3`
    case 'technical':
      return `${base} text-xs font-bold tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3`
    default:
      return `${base} text-xs font-bold tracking-[0.2em] text-gray-400 mb-2 border-b border-gray-100 pb-1`
  }
})

const sectionHeaderStyle = computed(() => {
  switch (props.layout.template) {
    case 'classic':
    case 'professional':
      return { color: props.style.accentColor, fontFamily: fontFamilies[props.style.headingFont] }
    case 'academic':
      return { fontFamily: fontFamilies[props.style.headingFont] }
    case 'creative':
      return { fontFamily: fontFamilies[props.style.headingFont] }
    case 'technical':
      return { fontFamily: "'JetBrains Mono', monospace" }
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
    case 'academic':
      return 'text-black whitespace-pre-wrap'
    case 'creative':
      return 'font-serif text-slate-600 leading-relaxed text-lg italic'
    case 'technical':
      return 'text-slate-700 whitespace-pre-wrap'
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
    case 'academic':
      return 'flex justify-between items-start mb-6'
    case 'creative':
      return 'relative pl-6 border-l-2 border-slate-100'
    case 'technical':
      return 'flex flex-col gap-2'
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
    case 'academic':
      return ''
    case 'creative':
      return 'flex flex-wrap justify-between items-start mb-2'
    case 'technical':
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
    case 'academic':
      return 'font-bold'
    case 'creative':
      return 'text-lg font-bold text-slate-900 leading-tight'
    case 'technical':
      return 'font-bold text-base uppercase'
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
    case 'academic':
      return 'italic'
    case 'creative':
      return 'text-primary font-semibold text-sm'
    case 'technical':
      return 'font-bold text-base uppercase'
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
    case 'academic':
      return 'text-sm shrink-0'
    case 'creative':
      return 'text-xs font-bold bg-slate-100 px-3 py-1 rounded text-slate-500'
    case 'technical':
      return 'text-sm font-medium'
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
    case 'academic':
      return 'flex justify-between items-start mb-4'
    case 'creative':
      return 'flex justify-between items-center'
    case 'technical':
      return 'flex justify-between items-baseline'
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
    case 'academic':
      return ''
    case 'creative':
      return ''
    case 'technical':
      return ''
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
    case 'academic':
      return 'font-bold'
    case 'creative':
      return 'font-bold text-slate-900'
    case 'technical':
      return 'font-bold text-sm uppercase'
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
    case 'academic':
      return 'italic'
    case 'creative':
      return 'text-sm text-slate-600'
    case 'technical':
      return 'text-xs italic text-slate-600'
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
    case 'academic':
      return 'flex gap-4 items-start mb-4'
    case 'creative':
      return 'group p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all hover:bg-slate-50'
    case 'technical':
      return 'flex flex-col gap-1'
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
    case 'academic':
      return ''
    case 'creative':
      return ''
    case 'technical':
      return ''
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
    case 'academic':
      return 'text-sm font-bold'
    case 'creative':
      return 'font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors'
    case 'technical':
      return 'font-bold text-sm uppercase underline decoration-primary/30 underline-offset-4'
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
    case 'academic':
      return 'text-sm text-gray-600'
    case 'creative':
      return 'text-xs font-serif text-slate-500 italic mb-2'
    case 'technical':
      return 'text-xs text-slate-700'
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
    case 'academic':
      return 'flex gap-4 items-start mb-4'
    case 'creative':
      return 'mb-2'
    case 'technical':
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
    case 'academic':
      return 'text-sm font-bold'
    case 'creative':
      return 'text-sm font-bold'
    case 'technical':
      return 'text-sm font-bold'
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
    case 'academic':
      return 'text-sm'
    case 'creative':
      return 'text-xs text-slate-600'
    case 'technical':
      return 'text-xs text-slate-600'
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
    case 'academic':
      return 'space-y-4'
    case 'creative':
      return 'flex flex-wrap gap-2 mt-2'
    case 'technical':
      return 'grid grid-cols-3 gap-4'
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
    case 'academic':
      return 'text-sm'
    case 'creative':
      return 'px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase'
    case 'technical':
      return 'text-sm mt-1'
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