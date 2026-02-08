<template>
  <!-- Summary -->
  <div v-if="isSectionVisible('summary')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">Profile</h3>
    <div v-if="resume.summary">
      <p :style="{ ...bodyStyle, whiteSpace: 'pre-wrap' }" :class="classes.bodyTextClass" v-html="resume.summary"></p>
    </div>
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      <p class="text-sm">Add a professional summary</p>
    </div>
  </div>

  <!-- Experience -->
  <div v-if="isSectionVisible('experience')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">
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
    <div v-if="filledExperiences.length > 0">
      <div
        v-for="(exp, index) in filledExperiences"
        :key="index"
        :class="classes.experienceItemClass"
      >
        <div v-if="layout.template === 'creative'" class="absolute -left-[9px] top-0 size-4 bg-primary rounded-full ring-4 ring-white"></div>
        <div :class="classes.experienceHeaderClass">
          <h4 v-if="layout.template === 'academic'" :class="classes.companyNameClass">{{ exp.company }}</h4>
          <h4 v-else-if="layout.template === 'creative'" :class="classes.companyNameClass">{{ exp.title }}</h4>
          <h4 v-else-if="layout.template === 'technical'" :class="classes.companyNameClass">{{ exp.title }} | {{ exp.company }}</h4>
          <h4 v-else :class="classes.companyNameClass">{{ exp.company }}</h4>
          <span :class="classes.dateClass">
            {{ exp.startDate }}{{ exp.startDate && exp.endDate ? ' — ' : '' }}{{ exp.endDate }}
          </span>
        </div>
        <p v-if="exp.title && layout.template !== 'creative' && layout.template !== 'technical'" :class="classes.jobTitleClass" :style="{ color: style.accentColor }" v-html="exp.title"></p>
        <p v-if="exp.title && layout.template === 'creative'" :class="classes.jobTitleClass">{{ exp.company }}</p>
        <p v-if="exp.description" :style="bodyStyle" :class="classes.bodyTextClass">
          <span v-if="layout.template === 'technical'">
            <ul class="list-disc list-inside space-y-1">
              <li v-for="line in exp.description.split('\n')" :key="line" v-html="line"></li>
            </ul>
          </span>
          <span v-else-if="layout.template === 'creative'">
            <ul class="font-serif space-y-2 text-sm leading-relaxed list-disc ml-4">
              <li v-for="line in exp.description.split('\n')" :key="line" v-html="line"></li>
            </ul>
          </span>
          <span v-else :style="{ whiteSpace: 'pre-wrap' }" v-html="exp.description"></span>
        </p>
        <p v-if="layout.template === 'technical'" class="text-[11px] font-mono font-medium text-blue-600">
          <span class="font-bold uppercase mr-1">Technologies used:</span> {{ exp.technologies || 'Not specified' }}
        </p>
      </div>
    </div>
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
      </svg>
      <p class="text-sm">Add your work experience</p>
    </div>
  </div>

  <!-- Education -->
  <div v-if="isSectionVisible('education')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">
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
    <div v-if="resume.education && resume.education.length > 0">
      <div v-for="(edu, index) in resume.education" :key="index" :class="educationItemClass">
        <div :class="educationHeaderClass">
          <h4 v-if="layout.template === 'academic'" :class="classes.schoolNameClass" v-html="edu.school"></h4>
          <h4 v-else-if="layout.template === 'creative'" :class="classes.schoolNameClass" v-html="edu.degree + ' ' + edu.field"></h4>
          <h4 v-else-if="layout.template === 'technical'" :class="classes.schoolNameClass" v-html="edu.degree + ' ' + edu.field + ' | ' + edu.school"></h4>
          <h4 v-else :class="classes.schoolNameClass" v-html="edu.school"></h4>
          <span :class="classes.dateClass">
            {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
          </span>
        </div>
        <p v-if="layout.template === 'academic'" :class="classes.degreeClass" v-html="edu.degree + (edu.degree && edu.field ? ', ' : '') + edu.field"></p>
        <p v-else-if="layout.template === 'creative'" :class="classes.degreeClass" v-html="edu.school"></p>
        <p v-if="layout.template === 'technical'" :class="classes.degreeClass" v-html="edu.coursework || 'Coursework not specified'"></p>
        <p v-else :class="classes.degreeClass" :style="{ color: style.accentColor }" v-html="edu.degree + (edu.degree && edu.field ? ', ' : '') + edu.field"></p>
      </div>
    </div>
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
      </svg>
      <p class="text-sm">Add your educational background</p>
    </div>
  </div>

  <!-- Projects -->
  <div v-if="isSectionVisible('projects')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">
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
    <div v-if="resume.projects && resume.projects.length > 0">
      <div v-if="layout.template === 'academic'" class="space-y-4">
        <h4 class="text-sm font-bold italic border-b border-gray-100 pb-1">Publications</h4>
        <div
          v-for="(project, index) in resume.projects"
          :key="index"
          :class="classes.projectItemClass"
        >
          <span class="text-sm font-bold min-w-[20px]">[{{ index + 1 }}]</span>
          <p class="text-sm">{{ project.name }}</p>
        </div>
      </div>
      <div v-else-if="layout.template === 'creative'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="(project, index) in resume.projects"
          :key="index"
          :class="classes.projectItemClass"
        >
          <h4 :class="classes.projectNameClass">{{ project.name }}</h4>
          <p v-if="project.link" :class="projectLinkClass">Link</p>
          <p class="text-xs text-slate-600 leading-snug" v-html="project.description"></p>
        </div>
      </div>
      <div v-else-if="layout.template === 'technical'" class="grid grid-cols-2 gap-6">
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
      <div v-else>
        <div v-for="(project, index) in resume.projects" :key="index" :class="classes.projectItemClass">
          <div :class="classes.projectHeaderClass">
            <h4 :class="classes.projectNameClass">{{ project.name }}</h4>
            <a v-if="project.link" :href="project.link" target="_blank" :class="classes.projectLinkClass">Link</a>
          </div>
          <p v-if="project.description" :style="bodyStyle" :class="classes.bodyTextClass" v-html="project.description"></p>
        </div>
      </div>
    </div>
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p class="text-sm">Add your projects and achievements</p>
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
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="text-sm">Add your certifications and credentials</p>
    </div>
  </div>

  <!-- Skills -->
  <div v-if="isSectionVisible('skills')" :style="{ marginBottom: `${layout.sectionSpacing}px` }">
    <h3 :class="classes.sectionHeaderClass" :style="classes.sectionHeaderStyle">
      <span v-if="layout.template === 'creative'">Core Skills</span>
      <span v-else-if="layout.template === 'technical'">Technical Skills</span>
      <span v-else>Expertise</span>
    </h3>
    <div v-if="resume.skills && resume.skills.length > 0">
      <div v-if="layout.template === 'technical'" :class="classes.skillsContainerClass">
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
      <div v-else-if="layout.template === 'creative'" :class="classes.skillsContainerClass">
        <div class="space-y-4">
          <div v-for="skill in resume.skills.slice(0, Math.min(3, resume.skills.length))" :key="skill.name || skill">
            <div class="flex justify-between mb-1">
              <span class="text-xs font-bold text-slate-700" v-html="skill.name || skill"></span>
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
      <div v-else :class="classes.skillsContainerClass">
          <span
          v-for="(skill, index) in resume.skills"
          :key="index"
          :class="classes.skillTagClass"
          :style="{ backgroundColor: style.accentColor + '15', color: style.accentColor }"
          v-html="skill"
        ></span>
      </div>
    </div>
    <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <p class="text-sm">Add your skills and expertise</p>
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