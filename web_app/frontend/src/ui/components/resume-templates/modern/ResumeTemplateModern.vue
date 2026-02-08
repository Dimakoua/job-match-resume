<template>
  <div
    class="bg-white shadow-2xl rounded-sm flex flex-col text-[#222] p-4"
    :style="previewStyle"
  >
    <ResumeHeaderModern :resume="resume" :style="style" />
    <ResumeSections
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
import ResumeHeaderModern from './ResumeHeaderModern.vue'
import ResumeSections from '../ResumeSections.vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({
      template: 'modern',
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
  padding: `${props.layout.margins}px`
}))

const classes = computed(() => ({
  sectionHeaderClass: 'uppercase text-lg font-bold tracking-widest mb-2',
  sectionHeaderStyle: { color: props.style.accentColor, fontFamily: fontFamilies[props.style.headingFont] },
  bodyTextClass: 'text-slate-700 leading-relaxed',
  experienceItemClass: 'flex flex-col gap-2 mb-6',
  experienceHeaderClass: 'flex justify-between items-baseline',
  companyNameClass: 'text-slate-900 font-bold text-lg',
  jobTitleClass: 'text-primary font-semibold italic',
  dateClass: 'text-slate-500 text-sm font-medium',
  educationItemClass: 'mb-4',
  educationHeaderClass: 'flex justify-between items-baseline',
  schoolNameClass: 'text-slate-900 font-bold',
  degreeClass: 'text-slate-600 text-sm',
  projectItemClass: 'flex flex-col gap-2 mb-4',
  projectHeaderClass: 'flex justify-between items-baseline',
  projectNameClass: 'text-slate-900 font-bold text-lg',
  projectLinkClass: 'text-slate-500 text-sm',
  certificationItemClass: 'flex justify-between items-baseline mb-2',
  certificationNameClass: 'text-slate-900 font-bold text-base',
  certificationIssuerClass: 'text-slate-600 text-sm',
  skillsContainerClass: 'flex flex-wrap gap-2',
  skillTagClass: 'px-3 py-1 text-sm font-medium rounded'
}))

</script>