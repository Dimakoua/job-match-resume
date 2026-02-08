<template>
  <div class="bg-white text-slate-900 p-12 min-h-[1100px] flex flex-col gap-6 resume-container ats-optimized shadow-2xl">
    <!-- Header -->
    <ResumeHeaderTechnical
      :resume="resume"
      :style="style"
      :layout="layout"
    />

    <!-- Summary -->
    <section v-if="resume.summary">
      <p class="text-sm">
        {{ resume.summary }}
      </p>
    </section>

    <!-- Technical Skills (Top-level grid for engineers) -->
    <section v-if="resume.skills && resume.skills.length > 0">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">Technical Skills</h2>
      <div class="grid grid-cols-3 gap-4">
        <div v-if="resume.skillCategories?.languages">
          <h3 class="resume-header text-[11px] font-bold text-slate-900 uppercase">{{ resume.skillCategories.languages.title || 'Languages' }}</h3>
          <p class="text-sm mt-1">{{ resume.skillCategories.languages.skills.join(', ') }}</p>
        </div>
        <div v-if="resume.skillCategories?.frameworks">
          <h3 class="resume-header text-[11px] font-bold text-slate-900 uppercase">{{ resume.skillCategories.frameworks.title || 'Frameworks' }}</h3>
          <p class="text-sm mt-1">{{ resume.skillCategories.frameworks.skills.join(', ') }}</p>
        </div>
        <div v-if="resume.skillCategories?.tools">
          <h3 class="resume-header text-[11px] font-bold text-slate-900 uppercase">{{ resume.skillCategories.tools.title || 'Tools & Infra' }}</h3>
          <p class="text-sm mt-1">{{ resume.skillCategories.tools.skills.join(', ') }}</p>
        </div>
      </div>
      <!-- Fallback to simple skills list if no categories defined -->
      <div v-if="!resume.skillCategories" class="flex flex-wrap gap-2">
        <span
          v-for="skill in resume.skills"
          :key="skill"
          class="px-3 py-1 bg-slate-100 text-slate-900 text-sm rounded"
        >
          {{ skill }}
        </span>
      </div>
    </section>

    <!-- Professional Experience -->
    <section v-if="resume.experience && resume.experience.length > 0" class="flex flex-col gap-6">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-1">Professional Experience</h2>
      <div
        v-for="(exp, index) in resume.experience"
        :key="index"
        class="flex flex-col gap-2"
      >
        <div class="flex justify-between items-baseline">
          <h3 class="font-bold text-base resume-header uppercase" v-html="exp.title + ' | ' + exp.company"></h3>
          <span class="resume-header text-sm font-medium" v-html="exp.startDate + (exp.startDate && exp.endDate ? ' — ' : '') + exp.endDate"></span>
        </div>
        <ul v-if="exp.description" class="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li v-for="line in exp.description.split('\n')" :key="line" v-html="line"></li>
        </ul>
        <p v-if="exp.technologies" class="text-[11px] font-mono font-medium text-blue-600">
          <span class="font-bold uppercase mr-1">Technologies used:</span> <span v-html="exp.technologies"></span>
        </p>
      </div>
    </section>

    <!-- Selected Projects -->
    <section v-if="resume.projects && resume.projects.length > 0" class="flex flex-col gap-4">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-1">Selected Projects</h2>
      <div class="grid grid-cols-2 gap-6">
        <div
          v-for="(project, index) in resume.projects"
          :key="index"
          class="flex flex-col gap-1"
        >
          <h3 class="font-bold text-sm resume-header uppercase underline decoration-primary/30 underline-offset-4">{{ project.name }}</h3>
          <p class="text-xs text-slate-700">{{ project.description }}</p>
          <p v-if="project.technologies" class="text-[10px] font-mono text-blue-600">{{ project.technologies }}</p>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section v-if="resume.education && resume.education.length > 0">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">Education</h2>
      <div
        v-for="(edu, index) in resume.education"
        :key="index"
        class="flex justify-between items-baseline"
      >
        <div>
          <h3 class="font-bold text-sm resume-header uppercase">{{ edu.degree }} {{ edu.field }} | {{ edu.school }}</h3>
          <p v-if="edu.coursework" class="text-xs italic text-slate-600">{{ edu.coursework }}</p>
        </div>
        <span class="resume-header text-sm font-medium">
          {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
        </span>
      </div>
    </section>
  </div>
</template>

<script setup>
import ResumeHeaderTechnical from './ResumeHeaderTechnical.vue'

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
.resume-container {
  font-family: 'Inter', sans-serif;
}

.resume-header {
  font-family: 'JetBrains Mono', monospace;
}

.ats-optimized {
  line-height: 1.4;
  letter-spacing: -0.01em;
}
</style>