<template>
  <div
    class="bg-white text-slate-900 shadow-2xl rounded-sm flex flex-col gap-6"
    :style="previewStyle"
  >
    <ResumeHeaderTechnical :resume="resume" :style="style" :layout="layout" />
    <TechnicalResumeSections
      :resume="resume"
      :layout="layout"
      :style="style"
      :sections="sections"
      :classes="classes"
      :hide-empty-sections="hideEmptySections"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResumeHeaderTechnical from './ResumeHeaderTechnical.vue'
import TechnicalResumeSections from './TechnicalResumeSections.vue'

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
      headingFont: 'roboto-mono',
      bodyFont: 'inter',
      fontSize: 11,
      lineHeight: 1.45,
      accentColor: '#2463eb'
    })
  },
  sections: {
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

const previewStyle = computed(() => ({
  aspectRatio: '1 / 1.414',
  minWidth: '600px',
  fontFamily: fontFamilies[props.style.bodyFont] || fontFamilies.inter,
  padding: `${props.layout.margins}px`,
  lineHeight: props.style.lineHeight
}))

const classes = computed(() => ({
  sectionHeaderClass: 'text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3',
  sectionHeaderStyle: {
    color: '#64748b',
    fontFamily: fontFamilies[props.style.headingFont] || fontFamilies['roboto-mono']
  },
  bodyTextClass: 'text-slate-700',
  experienceItemClass: 'flex flex-col gap-2 mb-6',
  experienceHeaderClass: 'flex justify-between items-baseline gap-4',
  companyNameClass: 'font-bold text-base uppercase',
  dateClass: 'text-sm font-medium text-slate-600',
  educationItemClass: 'mb-4',
  educationHeaderClass: 'flex justify-between items-baseline gap-4',
  schoolNameClass: 'font-bold text-sm uppercase',
  degreeClass: 'text-xs italic text-slate-600',
  projectItemClass: 'flex flex-col gap-1',
  projectNameClass: 'font-bold text-sm uppercase',
  projectLinkClass: 'text-xs text-slate-700',
  certificationItemClass: 'flex justify-between items-baseline mb-2',
  certificationNameClass: 'font-semibold text-sm',
  certificationIssuerClass: 'text-xs text-slate-600',
  skillsContainerClass: 'grid grid-cols-3 gap-4'
}))
</script>