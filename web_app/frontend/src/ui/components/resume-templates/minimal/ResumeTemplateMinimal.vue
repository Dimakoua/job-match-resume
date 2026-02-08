<template>
  <div
    class="bg-white shadow-2xl rounded-sm flex flex-col text-[#222] p-4"
    :style="previewStyle"
  >
    <ResumeHeaderMinimal :resume="resume" :style="style" />
    <MinimalResumeSections
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
import ResumeHeaderMinimal from './ResumeHeaderMinimal.vue'
import MinimalResumeSections from './MinimalResumeSections.vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({
      template: 'minimal',
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
  sectionHeaderClass: 'uppercase text-xs font-semibold tracking-widest border-b border-slate-100 pb-2',
  sectionHeaderStyle: { fontFamily: fontFamilies[props.style.headingFont] },
  bodyTextClass: 'text-slate-600 font-light leading-relaxed',
  experienceItemClass: 'flex flex-col gap-1 mb-4',
  experienceHeaderClass: 'flex justify-between items-baseline',
  companyNameClass: 'text-slate-900 font-medium text-base',
  jobTitleClass: 'text-slate-500 font-light text-xs',
  dateClass: 'text-slate-500 text-xs font-light',
  educationItemClass: 'flex justify-between items-baseline mb-4',
  educationHeaderClass: '',
  schoolNameClass: 'text-slate-900 font-medium text-base',
  degreeClass: 'text-slate-500 text-sm font-light',
  projectItemClass: 'mb-4',
  projectHeaderClass: 'flex justify-between items-baseline',
  projectNameClass: 'text-slate-900 font-medium text-base',
  projectLinkClass: 'text-slate-500 text-xs',
  certificationItemClass: 'mb-2',
  certificationNameClass: 'text-slate-900 font-medium text-sm',
  certificationIssuerClass: 'text-slate-500 text-xs',
  skillsContainerClass: 'flex flex-wrap gap-x-8 gap-y-3',
  skillTagClass: 'text-xs font-medium uppercase tracking-tighter'
}))
</script>