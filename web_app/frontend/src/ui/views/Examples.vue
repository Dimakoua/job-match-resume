<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] dark:bg-[#111621]">
    <div class="flex h-full grow flex-col">
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="px-6 lg:px-40 flex flex-1 justify-center py-8">
        <div class="flex flex-col max-w-[1024px] flex-1">
          <!-- Page Heading -->
          <div class="pb-8">
            <router-link to="/dashboard" class="text-primary hover:underline text-sm font-medium mb-4 inline-block">← Back to Dashboard</router-link>
            <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Resume Examples</h1>
            <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal mt-2">Browse professionally-designed resume templates to inspire your next application</p>
          </div>

          <!-- Examples Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              v-for="(example, index) in examples" 
              :key="index"
              class="group bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d364f] overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
            >
              <!-- Preview -->
              <div class="aspect-[3/4] bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <div class="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="size-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-sm">Preview</p>
                </div>
              </div>

              <!-- Info -->
              <div class="p-4">
                <h3 class="font-bold text-[#0e121b] dark:text-white mb-1">{{ example.title }}</h3>
                <p class="text-sm text-[#4d6599] dark:text-gray-400 mb-4">{{ example.description }}</p>
                
                <!-- Tags -->
                <div class="flex flex-wrap gap-2 mb-4">
                  <span 
                    v-for="tag in example.tags" 
                    :key="tag"
                    class="text-xs px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded"
                  >
                    {{ tag }}
                  </span>
                </div>

                <!-- Actions -->
                <button 
                  @click="() => handleUseTemplate(example)"
                  class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State (fallback) -->
          <div v-if="examples.length === 0" class="text-center py-12">
            <p class="text-[#4d6599] dark:text-gray-400">Templates coming soon!</p>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const router = useRouter()

// Sample example templates
const examples = ref([
  {
    id: 1,
    title: 'Software Engineer',
    description: 'Modern resume for tech roles with emphasis on projects and skills',
    tags: ['Tech', 'Modern', 'Minimal'],
    template: 'modern'
  },
  {
    id: 2,
    title: 'Product Manager',
    description: 'Executive-focused template highlighting leadership and impact',
    tags: ['Business', 'Executive', 'Professional'],
    template: 'professional'
  },
  {
    id: 3,
    title: 'Designer',
    description: 'Creative resume showcasing design portfolio and visual hierarchy',
    tags: ['Creative', 'Design', 'Portfolio'],
    template: 'creative'
  },
  {
    id: 4,
    title: 'Marketing Manager',
    description: 'Results-driven template perfect for marketing professionals',
    tags: ['Marketing', 'Business', 'Results-Driven'],
    template: 'modern'
  },
  {
    id: 5,
    title: 'Data Scientist',
    description: 'Technical resume emphasizing data skills and analytics projects',
    tags: ['Data', 'Tech', 'Research'],
    template: 'professional'
  },
  {
    id: 6,
    title: 'HR Specialist',
    description: 'Comprehensive template for human resources professionals',
    tags: ['HR', 'Business', 'Professional'],
    template: 'professional'
  }
])

const handleUseTemplate = (example) => {
  // Navigate to builder with template (we can implement this later)
  router.push({
    name: 'Builder',
    query: { template: example.template }
  })
}
</script>

<style scoped>
</style>
