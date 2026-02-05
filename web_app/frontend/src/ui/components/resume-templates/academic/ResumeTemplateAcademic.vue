<template>
  <div class="cv-page bg-white text-black font-display">
    <!-- Header -->
    <ResumeHeaderAcademic
      :resume="resume"
      :style="style"
      :layout="layout"
    />

    <!-- Sections -->
    <ResumeSections
      :resume="resume"
      :style="style"
      :layout="layout"
      :customSections="customSections"
    />
  </div>
</template>

<script setup>
import ResumeHeaderAcademic from './ResumeHeaderAcademic.vue'
import ResumeSections from '../ResumeSections.vue'

defineProps({
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
  }
})
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