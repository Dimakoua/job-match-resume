<template>
  <div
    class="bg-white shadow-2xl rounded-sm flex flex-col text-[#222] p-4"
    :style="previewStyle"
  >
    <ResumeHeaderBasic :resume="resume" :style="style" />
    <BasicResumeSections
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
import ResumeHeaderBasic from './ResumeHeaderBasic.vue'
import BasicResumeSections from './BasicResumeSections.vue'

const props = defineProps({
  resume: {
    type: Object,
    default: () => ({})
  },
  layout: {
    type: Object,
    default: () => ({
      template: 'basic',
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
  sectionHeaderClass: 'uppercase text-sm font-bold tracking-[0.1em] border-b border-black pb-1 mb-2',
  sectionHeaderStyle: { fontFamily: fontFamilies[props.style.headingFont] },
  bodyTextClass: 'text-justify',
  experienceItemClass: 'mb-4',
  experienceHeaderClass: 'flex justify-between items-baseline mb-0.5',
  companyNameClass: 'font-bold text-xs',
  jobTitleClass: 'text-[10px] font-semibold mb-1',
  dateClass: 'text-[9px] text-gray-500 font-medium italic',
  educationItemClass: 'mb-3',
  educationHeaderClass: 'flex justify-between items-baseline',
  schoolNameClass: 'font-bold text-xs',
  degreeClass: 'text-[10px] font-semibold',
  projectItemClass: 'mb-3',
  projectHeaderClass: 'flex justify-between items-baseline mb-0.5',
  projectNameClass: 'font-bold text-xs',
  projectLinkClass: 'text-[9px] text-primary hover:underline font-medium',
  certificationItemClass: 'flex justify-between items-baseline mb-1',
  certificationNameClass: 'font-bold text-xs',
  certificationIssuerClass: 'text-[10px] text-gray-600',
  skillsContainerClass: 'flex flex-wrap gap-1.5',
  skillTagClass: 'px-2 py-0.5 text-[9px] font-semibold rounded'
}))
</script>