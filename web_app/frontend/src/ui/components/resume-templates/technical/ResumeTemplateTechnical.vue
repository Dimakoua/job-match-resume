<template>
  <div class="bg-white text-slate-900 p-12 min-h-[1100px] flex flex-col gap-6 resume-container ats-optimized shadow-2xl">
    <!-- Header -->
    <ResumeHeaderTechnical
      :resume="resume"
      :style="style"
      :layout="layout"
    />

    <!-- Summary -->
    <section>
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
      <div v-if="resume.summary">
        <p class="text-sm">
          {{ resume.summary }}
        </p>
      </div>
      <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-sm">Add a professional summary highlighting your key strengths</p>
      </div>
    </section>

    <!-- Technical Skills (Top-level grid for engineers) -->
    <section>
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">Technical Skills</h2>
      <div v-if="resume.skills && resume.skills.length > 0">
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
      </div>
      <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <p class="text-sm">Add your technical skills and expertise</p>
      </div>
    </section>

    <!-- Professional Experience -->
    <section class="flex flex-col gap-6">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-1">Professional Experience</h2>
      <div v-if="resume.experience && resume.experience.length > 0">
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
      </div>
      <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
        </svg>
        <p class="text-sm">Add your work experience</p>
      </div>
    </section>

    <!-- Selected Projects -->
    <section class="flex flex-col gap-4">
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-1">Selected Projects</h2>
      <div v-if="resume.projects && resume.projects.length > 0">
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
      </div>
      <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p class="text-sm">Add your projects and achievements</p>
      </div>
    </section>

    <!-- Education -->
    <section>
      <h2 class="resume-header text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 mb-3">Education</h2>
      <div v-if="resume.education && resume.education.length > 0">
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
      </div>
      <div v-else class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-gray-400">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
        </svg>
        <p class="text-sm">Add your educational background</p>
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