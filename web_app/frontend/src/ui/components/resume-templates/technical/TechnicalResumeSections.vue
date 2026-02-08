<template>
  <!-- Summary -->
  <div v-if="isSectionVisible('summary')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Profile</h3>
    <div v-if="resume.summary">
      <p :style="{ ...bodyStyle, whiteSpace: 'pre-wrap' }" :class="classes.bodyTextClass" v-html="resume.summary"></p>
    </div>
  </div>

  <!-- Experience -->
  <div v-if="isSectionVisible('experience')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Professional Experience</h3>
    <div v-if="filledExperiences.length > 0">
      <div
        v-for="(exp, index) in filledExperiences"
        :key="index"
        :class="classes.experienceItemClass"
      >
        <div :class="classes.experienceHeaderClass">
          <h4 :class="classes.companyNameClass">{{ exp.title }} | {{ exp.company }}</h4>
          <span :class="classes.dateClass">
            {{ exp.startDate }}{{ exp.startDate && exp.endDate ? ' — ' : '' }}{{ exp.endDate }}
          </span>
        </div>
        <p v-if="exp.description" :style="bodyStyle" :class="classes.bodyTextClass">
          <ul class="list-disc list-inside space-y-1">
            <li v-for="line in exp.description.split('\n')" :key="line" v-html="line"></li>
          </ul>
        </p>
        <p v-if="exp.technologies" class="text-[11px] font-mono font-medium text-blue-600">
          <span class="font-bold uppercase mr-1">Technologies used:</span> {{ exp.technologies || 'Not specified' }}
        </p>
      </div>
    </div>
  </div>

  <!-- Education -->
  <div v-if="isSectionVisible('education')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Education</h3>
    <div v-if="resume.education && resume.education.length > 0">
      <div v-for="(edu, index) in resume.education" :key="index" :class="classes.educationItemClass">
        <div :class="classes.educationHeaderClass">
          <h4 :class="classes.schoolNameClass" v-html="edu.degree + ' ' + edu.field + ' | ' + edu.school"></h4>
          <span :class="classes.dateClass">
            {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
          </span>
        </div>
        <p v-if="edu.coursework" :class="classes.degreeClass" v-html="edu.coursework"></p>
      </div>
    </div>
  </div>

  <!-- Projects -->
  <div v-if="isSectionVisible('projects')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Selected Projects</h3>
    <div v-if="resume.projects && resume.projects.length > 0" class="grid grid-cols-2 gap-6">
      <div
        v-for="(project, index) in resume.projects"
        :key="index"
        :class="classes.projectItemClass"
      >
        <h3 :class="classes.projectNameClass">{{ project.name }}</h3>
        <p :class="classes.projectLinkClass" v-html="project.description"></p>
        <p v-if="project.technologies" class="text-[10px] font-mono text-blue-600">{{ project.technologies }}</p>
      </div>
    </div>
  </div>

  <!-- Certifications -->
  <div v-if="isSectionVisible('certifications')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Certifications</h3>
    <div v-if="resume.certifications && resume.certifications.length > 0">
      <div v-for="(cert, index) in resume.certifications" :key="index" :class="classes.certificationItemClass">
        <div>
          <span :class="classes.certificationNameClass">{{ cert.name }}</span>
          <span v-if="cert.issuer" :class="classes.certificationIssuerClass"> • {{ cert.issuer }}</span>
        </div>
        <span :class="classes.dateClass">{{ cert.date }}</span>
      </div>
    </div>
  </div>

  <!-- Skills -->
  <div v-if="isSectionVisible('skills')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Technical Skills</h3>
    <div v-if="resume.skills && resume.skills.length > 0" :class="classes.skillsContainerClass">
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Languages</h3>
        <p class="text-sm mt-1" v-html="resume.skills.slice(0, 4).join(', ')"></p>
      </div>
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Frameworks</h3>
        <p class="text-sm mt-1" v-html="resume.skills.slice(4, 8).join(', ')"></p>
      </div>
      <div>
        <h3 class="text-[11px] font-bold text-slate-900 uppercase">Tools & Infra</h3>
        <p class="text-sm mt-1" v-html="resume.skills.slice(8, 12).join(', ')"></p>
      </div>
    </div>
  </div>

  <!-- Custom Sections -->
  <template v-for="customSection in (customSections || [])" :key="customSection?.id || 'unknown'">
    <div v-if="customSection?.id && isSectionVisible(customSection.id) && resume.customSections?.[customSection.id]" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
      <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle" class="capitalize">{{ customSection.label }}</h3>
      <p :style="bodyStyle" :class="classes.bodyTextClass">{{ resume.customSections[customSection.id] }}</p>
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
      template: 'technical',
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
  },
  classes: {
    type: Object,
    default: () => ({})
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
