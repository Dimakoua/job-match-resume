<template>
  <div class="p-8">
    <!-- Personal Information -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <h2 class="text-xl font-bold tracking-tight">Personal Information</h2>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</span>
          <input 
            v-model="form.firstName"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="text" 
            placeholder="John"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</span>
          <input 
            v-model="form.lastName"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="text" 
            placeholder="Doe"
          />
        </label>
        <label class="flex flex-col gap-1.5 col-span-2">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Professional Title</span>
          <input 
            v-model="form.title"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="text" 
            placeholder="Senior Software Engineer"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</span>
          <input 
            v-model="form.email"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="email" 
            placeholder="john@email.com"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</span>
          <input 
            v-model="form.phone"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="tel" 
            placeholder="+1 (555) 123-4567"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</span>
          <input 
            v-model="form.location"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="text" 
            placeholder="San Francisco, CA"
          />
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">LinkedIn</span>
          <input 
            v-model="form.linkedin"
            class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm" 
            type="url" 
            placeholder="linkedin.com/in/johndoe"
          />
        </label>
      </div>
    </section>

    <!-- Professional Summary -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h2 class="text-xl font-bold tracking-tight">Professional Summary</h2>
        </div>
        <button 
          @click="$emit('aiEnhance', 'summary')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          AI Enhance
        </button>
      </div>
      <div class="relative group">
        <textarea 
          v-model="form.summary"
          class="w-full min-h-[160px] rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-violet-600 focus:ring-1 focus:ring-violet-600 p-4 text-sm leading-relaxed" 
          placeholder="Write a brief overview of your experience, skills, and career goals..."
        ></textarea>
        <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="bg-violet-100 text-violet-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">AI Powered</div>
        </div>
      </div>
    </section>

    <!-- Work Experience -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
          <h2 class="text-xl font-bold tracking-tight">Work Experience</h2>
        </div>
        <button 
          @click="addExperience"
          class="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </button>
      </div>
      
      <!-- Experience Cards -->
      <div 
        v-for="(exp, index) in form.experience" 
        :key="index"
        class="p-5 rounded-xl border border-[#d0d7e7] dark:border-gray-700 bg-white dark:bg-gray-900 mb-4 shadow-sm relative group"
      >
        <div class="absolute -left-2 top-6 h-12 w-1 bg-primary rounded-full hidden group-hover:block"></div>
        <button 
          @click="removeExperience(index)"
          class="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Company</span>
              <input 
                v-model="exp.company"
                class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm" 
                type="text" 
                placeholder="Company Name"
              />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Title</span>
              <input 
                v-model="exp.title"
                class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm" 
                type="text" 
                placeholder="Senior Engineer"
              />
            </label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</span>
              <input 
                v-model="exp.startDate"
                class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm" 
                type="text" 
                placeholder="Jan 2020"
              />
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date</span>
              <input 
                v-model="exp.endDate"
                class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm" 
                type="text" 
                placeholder="Present"
              />
            </label>
          </div>
          <label class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</span>
              <button 
                @click="$emit('aiEnhance', 'experience', index)"
                class="text-violet-600 text-xs font-bold hover:underline"
              >
                AI Enhance
              </button>
            </div>
            <textarea 
              v-model="exp.description"
              class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2.5 text-sm min-h-[80px]"
              placeholder="Describe your responsibilities and achievements..."
            ></textarea>
          </label>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <h2 class="text-xl font-bold tracking-tight">Skills</h2>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 mb-4">
        <span 
          v-for="(skill, index) in form.skills" 
          :key="index"
          class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm font-medium rounded-lg flex items-center gap-2 group"
        >
          {{ skill }}
          <button 
            @click="removeSkill(index)"
            class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
      </div>
      <div class="flex gap-2">
        <input 
          v-model="newSkill"
          @keyup.enter="addSkill"
          class="flex-1 rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-2.5 text-sm" 
          type="text" 
          placeholder="Add a skill..."
        />
        <button 
          @click="addSkill"
          class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      summary: '',
      experience: [],
      skills: []
    })
  }
})

const emit = defineEmits(['update:modelValue', 'aiEnhance'])

const form = ref(JSON.parse(JSON.stringify(props.modelValue)))
const newSkill = ref('')

watch(form, (newVal) => {
  emit('update:modelValue', JSON.parse(JSON.stringify(newVal)))
}, { deep: true })

watch(() => props.modelValue, (newVal) => {
  form.value = JSON.parse(JSON.stringify(newVal))
}, { deep: true })

const addExperience = () => {
  form.value.experience.push({
    company: '',
    title: '',
    startDate: '',
    endDate: '',
    description: ''
  })
}

const removeExperience = (index) => {
  form.value.experience.splice(index, 1)
}

const addSkill = () => {
  if (newSkill.value.trim()) {
    form.value.skills.push(newSkill.value.trim())
    newSkill.value = ''
  }
}

const removeSkill = (index) => {
  form.value.skills.splice(index, 1)
}
</script>
