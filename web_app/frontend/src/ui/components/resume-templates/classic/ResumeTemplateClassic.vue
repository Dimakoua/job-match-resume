<template>
  <div
    class="bg-white flex flex-col text-[#222] p-2"
    :style="previewStyle"
  >
    <ResumeHeaderClassic :resume="resume" :style="style" />
    <ClassicResumeSections
      :resume="resume"
      :layout="layout"
      :style="style"
      :sections="sections"
      :classes="classes"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResumeHeaderClassic from './ResumeHeaderClassic.vue'
import ClassicResumeSections from './ClassicResumeSections.vue'

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

const previewStyle = computed(() => ({
  aspectRatio: '1 / 1.414',
  minWidth: '600px',
  fontFamily: fontFamilies[props.style.bodyFont],
  padding: '24px 32px',
  boxSizing: 'border-box'
}))

const classes = computed(() => ({
  sectionHeaderClass: 'text-center font-semibold text-[12pt] mb-2',
  sectionHeaderStyle: { fontFamily: fontFamilies[props.style.headingFont], color: '#222' },
  bodyTextClass: 'text-gray-800 text-[10pt] whitespace-pre-wrap',
  experienceItemClass: 'mb-2',
  experienceHeaderClass: 'flex justify-between items-baseline mb-0.5',
  companyNameClass: 'font-bold text-[10pt]',
  jobTitleClass: 'italic text-[10pt] mb-1',
  dateClass: 'text-[9pt] text-gray-500 font-medium',
  educationItemClass: 'mb-1',
  educationHeaderClass: 'flex justify-between items-baseline',
  schoolNameClass: 'font-bold text-[10pt]',
  degreeClass: 'text-[10pt]',
  projectItemClass: 'mb-1',
  projectHeaderClass: 'flex justify-between items-baseline mb-0.5',
  projectNameClass: 'font-bold text-[10pt]',
  projectLinkClass: 'text-[9pt] text-primary hover:underline font-medium',
  certificationItemClass: 'mb-1',
  certificationNameClass: 'font-bold text-[10pt]',
  certificationIssuerClass: 'text-[10pt] text-gray-600',
  skillsContainerClass: 'flex flex-wrap gap-1',
  skillTagClass: 'px-2 py-0.5 text-[9pt] font-semibold rounded'
}))
</script>