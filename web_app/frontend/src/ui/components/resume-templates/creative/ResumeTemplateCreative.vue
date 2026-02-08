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
          <h1 v-if="resume.firstName || resume.lastName" class="text-3xl font-black text-slate-900 leading-tight">{{ resume.firstName }}<br/>{{ resume.lastName }}</h1>
          <h1 v-else class="text-3xl font-black text-slate-400 leading-tight">Your Name</h1>
          <p v-if="resume.title" class="text-primary font-bold tracking-widest text-xs uppercase mt-2">{{ resume.title }}</p>
          <p v-else class="text-slate-400 font-bold tracking-widest text-xs uppercase mt-2">Your Job Title</p>
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
          <div v-if="!resume.email && !resume.phone && !resume.location && !resume.website" class="text-center py-4 text-slate-400">
            <svg class="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <p class="text-xs">Add contact details</p>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div class="flex flex-col gap-6">
        <h3 class="text-slate-900 font-bold text-sm uppercase tracking-wider border-b border-primary/20 pb-2">Core Skills</h3>
        <div v-if="resume.skills && resume.skills.length > 0" class="space-y-4">
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
        <div v-if="resume.skills && resume.skills.length > 0" class="flex flex-wrap gap-2 mt-2">
          <span
            v-for="skill in resume.skills?.slice(3) || []"
            :key="skill.name || skill"
            class="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase"
          >
            {{ skill.name || skill }}
          </span>
        </div>
        <div v-if="!resume.skills || resume.skills.length === 0" class="text-center py-6 text-slate-400">
          <svg class="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          <p class="text-xs">Add your skills</p>
        </div>
      </div>
    </aside>

    <!-- Right Column (2/3 Main Content) -->
    <article class="w-full md:w-2/3 p-10 flex flex-col gap-12 bg-white">
      <!-- Profile Summary -->
      <section>
        <h2 class="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Profile
        </h2>
        <div v-if="resume.summary" class="font-serif text-slate-600 leading-relaxed text-lg italic">
          {{ resume.summary }}
        </div>
        <div v-else class="font-serif text-slate-400 leading-relaxed text-lg italic border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <div class="text-slate-500 mb-2">
            <svg class="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>
          <p class="text-sm">Add a professional summary to introduce yourself</p>
          <p class="text-xs text-slate-400 mt-1">This section will highlight your key strengths and career goals</p>
        </div>
      </section>

      <!-- Experience Section -->
      <section>
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Experience
        </h2>
        <div v-if="resume.experience && resume.experience.length > 0" class="space-y-8">
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
        <div v-else class="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <div class="text-slate-500 mb-2">
            <svg class="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4"></path>
            </svg>
          </div>
          <p class="text-sm">Add your work experience</p>
          <p class="text-xs text-slate-400 mt-1">Include your job titles, companies, and key achievements</p>
        </div>
      </section>

      <!-- Projects Section -->
      <section>
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Recent Projects
        </h2>
        <div v-if="resume.projects && resume.projects.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div v-else class="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <div class="text-slate-500 mb-2">
            <svg class="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <p class="text-sm">Showcase your projects</p>
          <p class="text-xs text-slate-400 mt-1">Highlight your technical skills and creative work</p>
        </div>
      </section>

      <!-- Education -->
      <section>
        <h2 class="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <span class="size-2 bg-primary rounded-full"></span>
          Education
        </h2>
        <div v-if="resume.education && resume.education.length > 0">
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
        </div>
        <div v-else class="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <div class="text-slate-500 mb-2">
            <svg class="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
            </svg>
          </div>
          <p class="text-sm">Add your educational background</p>
          <p class="text-xs text-slate-400 mt-1">Include degrees, institutions, and graduation dates</p>
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