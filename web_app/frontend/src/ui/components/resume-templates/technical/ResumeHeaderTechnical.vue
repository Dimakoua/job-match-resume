<template>
  <!-- Header -->
  <div class="border-b-2 border-slate-900 pb-4">
    <h1 class="resume-header text-4xl font-black uppercase tracking-tighter">{{ resume.firstName }} {{ resume.lastName }}</h1>
    <p class="resume-header text-lg font-medium text-primary mt-1" v-html="resume.title"></p>
    <div class="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm font-medium text-slate-600">
      <span v-if="resume.email" class="flex items-center gap-1">
        <span class="material-symbols-outlined text-base">mail</span> {{ resume.email }}
      </span>
      <span v-if="resume.location" class="flex items-center gap-1">
        <span class="material-symbols-outlined text-base">location_on</span> {{ resume.location }}
      </span>
      <span v-if="resume.linkedin" class="flex items-center gap-1">
        <span class="material-symbols-outlined text-base">link</span> {{ resume.linkedin }}
      </span>
      <span v-if="resume.website" class="flex items-center gap-1">
        <span class="material-symbols-outlined text-base">link</span> {{ resume.website }}
      </span>
    </div>
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
  }
})
</script>

<style scoped>
.resume-header {
  font-family: 'JetBrains Mono', monospace;
}
</style>