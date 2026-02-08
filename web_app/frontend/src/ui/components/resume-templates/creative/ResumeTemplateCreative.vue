<template>
  <div class="max-w-[1000px] w-full bg-white shadow-2xl rounded-xl flex flex-col md:flex-row">
    <!-- Left Column (1/3 Sidebar) -->
    <aside class="w-full md:w-1/3 bg-slate-50 p-8 flex flex-col gap-10">
      <!-- Profile Section -->
      <div class="flex flex-col items-center text-center gap-4">
        <div class="size-40 rounded-2xl bg-primary/10 overflow-hidden border-4 border-white shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
          <div v-if="resume.photo" class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url(${resume.photo})` }"></div>
          <div v-else class="w-full h-full bg-slate-200 flex items-center justify-center">
            <svg class="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
        <div class="mt-4">
          <h1 class="text-3xl font-black text-slate-900 leading-tight">{{ resume.firstName }}<br/>{{ resume.lastName }}</h1>
          <p class="text-primary font-bold tracking-widest text-xs uppercase mt-2">{{ resume.title }}</p>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="flex flex-col gap-4">
        <h3 class="text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-primary/20 pb-2">Contact</h3>
        <div class="flex flex-col gap-3">
          <div v-if="resume.email" class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">mail</span>
            <span class="text-sm text-slate-600">{{ resume.email }}</span>
          </div>
          <div v-if="resume.phone" class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">phone_iphone</span>
            <span class="text-sm text-slate-600">{{ resume.phone }}</span>
          </div>
          <div v-if="resume.location" class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">location_on</span>
            <span class="text-sm text-slate-600">{{ resume.location }}</span>
          </div>
          <div v-if="resume.website" class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl">language</span>
            <span class="text-sm text-slate-600">{{ resume.website }}</span>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="flex flex-col gap-6">
        <h3 class="text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-primary/20 pb-2">Core Skills</h3>
        <div class="space-y-4">
          <div v-for="skill in resume.skills?.slice(0, Math.min(3, resume.skills.length)) || []" :key="skill">
            <div class="flex justify-between mb-1">
              <span class="text-xs font-bold text-slate-700">{{ skill.name || skill }}</span>
              <span class="text-xs font-bold text-primary">{{ skill.level || '85%' }}</span>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5">
              <div class="bg-primary h-1.5 rounded-full" :style="{ width: skill.level || '85%' }"></div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="skill in resume.skills?.slice(3) || []"
            :key="skill.name || skill"
            class="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase"
          >
            {{ skill.name || skill }}
          </span>
        </div>
      </div>
    </aside>

    <!-- Right Column (2/3 Main Content) -->
    <article class="w-full md:w-2/3 p-10 flex flex-col gap-12 bg-white">
      <!-- Profile Summary -->
      <section v-if="resume.summary">
        <h2 class="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Profile
        </h2>
        <p class="font-serif text-slate-600 leading-relaxed text-lg italic">
          {{ resume.summary }}
        </p>
      </section>

      <!-- Experience Section -->
      <section v-if="resume.experience && resume.experience.length > 0">
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Experience
        </h2>
        <div class="space-y-8">
          <div
            v-for="(exp, index) in resume.experience"
            :key="index"
            class="relative pl-6 border-l-2 border-slate-100"
          >
            <div class="absolute -left-[9px] top-0 size-4 bg-primary rounded-full ring-4 ring-white"></div>
            <div class="flex flex-wrap justify-between items-start mb-2">
              <div>
                <h4 class="text-lg font-bold text-slate-900 leading-tight" v-html="exp.title"></h4>
                <p class="text-primary font-semibold text-sm" v-html="exp.company"></p>
              </div>
              <span class="text-xs font-bold bg-slate-100 px-3 py-1 rounded text-slate-500" v-html="exp.startDate + (exp.startDate && exp.endDate ? ' — ' : '') + exp.endDate"></span>
            </div>
            <p v-if="exp.description" class="font-serif text-slate-600 space-y-2 text-sm leading-relaxed" v-html="exp.description"></p>
          </div>
        </div>
      </section>

      <!-- Projects Section -->
      <section v-if="resume.projects && resume.projects.length > 0">
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Recent Projects
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="(project, index) in resume.projects"
            :key="index"
            class="group p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-all hover:bg-slate-50"
          >
            <h4 class="font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{{ project.name }}</h4>
            <p class="text-xs font-serif text-slate-500 italic mb-2">Project</p>
            <p class="text-xs text-slate-600 leading-snug">{{ project.description }}</p>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section v-if="resume.education && resume.education.length > 0">
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Education
        </h2>
        <div
          v-for="(edu, index) in resume.education"
          :key="index"
          class="flex justify-between items-center"
        >
          <div>
            <h4 class="font-bold text-slate-900">{{ edu.degree }} {{ edu.field }}</h4>
            <p class="text-sm text-slate-600">{{ edu.school }}</p>
          </div>
          <span class="text-xs font-bold text-primary italic">
            {{ edu.startDate }}{{ edu.startDate && edu.endDate ? ' — ' : '' }}{{ edu.endDate }}
          </span>
        </div>
      </section>
    </article>
  </div>
</template>

<script setup>
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