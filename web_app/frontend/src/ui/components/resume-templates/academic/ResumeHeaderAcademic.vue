<template>
  <section class="text-center mb-10">
    <h1 class="text-3xl font-bold uppercase tracking-widest mb-2">{{ resume.firstName }} {{ resume.lastName }}</h1>
    <div class="text-sm italic leading-relaxed">
      <p v-if="resume.title">{{ resume.title }}</p>
      <p v-if="resume.location">{{ resume.location }}</p>
      <p v-if="resume.email || resume.phone || resume.linkedin || resume.website" class="mt-2">
        <span v-if="resume.email">{{ resume.email }}</span>
        <span v-if="resume.email && resume.phone"> | </span>
        <span v-if="resume.phone">{{ resume.phone }}</span>
        <span v-if="(resume.email || resume.phone) && (resume.linkedin || resume.website)"> | </span>
        <span v-if="resume.linkedin">{{ resume.linkedin }}</span>
        <span v-if="resume.linkedin && resume.website"> | </span>
        <span v-if="resume.website">{{ resume.website }}</span>
      </p>
    </div>
  </section>
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