<template>
  <div class="cv-page bg-white text-black font-display">
    <!-- Header -->
    <ResumeHeaderAcademic
      :resume="resume"
      :style="style"
      :layout="layout"
    />

    <!-- Sections -->
    <AcademicResumeSections
      :resume="resume"
      :style="style"
      :layout="layout"
      :sections="customSections"
      :classes="classes"
      :hide-empty-sections="hideEmptySections"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResumeHeaderAcademic from './ResumeHeaderAcademic.vue'
import AcademicResumeSections from './AcademicResumeSections.vue'

const props = defineProps({
  resume: {
    type: Object,
    required: true
  },
  style: {
    type: Object,
    required: true
  },
  layout: {
    type: Object,
    required: true
  },
  customSections: {
    type: Array,
    default: () => []
  },
  hideEmptySections: {
    type: Boolean,
    default: false
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

const classes = computed(() => ({
  sectionHeaderClass: 'text-lg font-bold uppercase tracking-widest inline-block pb-1 mb-8',
  sectionHeaderStyle: { fontFamily: fontFamilies[props.style.headingFont] },
  bodyTextClass: 'text-black whitespace-pre-wrap',
  experienceItemClass: 'flex justify-between items-start mb-6',
  experienceHeaderClass: '',
  companyNameClass: 'font-bold',
  jobTitleClass: 'italic',
  dateClass: 'text-sm shrink-0',
  educationItemClass: 'flex justify-between items-start mb-4',
  educationHeaderClass: '',
  schoolNameClass: 'font-bold',
  degreeClass: 'italic',
  projectItemClass: 'flex gap-4 items-start mb-4',
  projectHeaderClass: '',
  projectNameClass: 'text-sm font-bold',
  projectLinkClass: 'text-sm text-gray-600',
  certificationItemClass: 'flex gap-4 items-start mb-4',
  certificationNameClass: 'text-sm font-bold',
  certificationIssuerClass: 'text-sm',
  skillsContainerClass: 'space-y-4',
  skillTagClass: 'text-sm'
}))
</script>

<style scoped>
.cv-page {
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
  min-height: 29.7cm;
  width: 21cm;
  padding: 2.5cm;
}

.academic-divider {
  border-bottom: 0.5px solid #333;
  margin-bottom: 1.5rem;
}
</style>