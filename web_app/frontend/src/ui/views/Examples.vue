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
            <router-link to="/dashboard" class="text-primary hover:underline text-sm font-medium mb-4 inline-block focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">← Back to Dashboard</router-link>
            <h1 class="text-[#0e121b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Resume Examples</h1>
            <p class="text-[#4d6599] dark:text-gray-400 text-base font-normal leading-normal mt-2 max-w-2xl">Choose from professionally-designed templates that have helped thousands succeed. Each template is fully customizable to match your unique experience and style.</p>
          </div>

          <!-- Examples Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            <div 
              v-for="(example, index) in examples" 
              :key="example.id"
              role="listitem"
              class="group bg-white dark:bg-[#1a202c] rounded-xl border border-[#e7ebf3] dark:border-[#2d364f] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary"
            >
              <!-- Preview -->
              <div class="aspect-[3/4] bg-slate-100 dark:bg-slate-900 overflow-hidden group-hover:bg-slate-200 dark:group-hover:bg-slate-800 transition-colors cursor-pointer" @click="openPreviewModal(example)">
                <div class="scale-[0.65] origin-top-left w-[153.8%] h-[153.8%] group-hover:scale-[0.67] transition-transform duration-300">
                  <ResumePreview 
                    :resume="example.resumeData"
                    :sections="[]"
                    :layout="example.layout"
                    :style="example.style"
                  />
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
                  @click="openPreviewModal(example)"
                  :aria-label="`Preview ${example.title} template`"
                  class="w-full bg-primary hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 rounded-lg transition-colors text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Preview Template
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

    <!-- Preview Modal -->
    <div v-if="previewModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click="closePreviewModal">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" @click.stop>
        <div class="flex flex-col lg:flex-row">
          <!-- Preview Section -->
          <div class="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 h-[600px] overflow-hidden">
              <ResumePreview 
                :resume="previewModal.example?.resumeData"
                :sections="[]"
                :layout="previewModal.example?.layout"
                :style="previewModal.example?.style"
              />
            </div>
          </div>

          <!-- Info Section -->
          <div class="lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ previewModal.example?.title }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ previewModal.example?.description }}</p>
              </div>
              <button @click="closePreviewModal" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <span class="material-symbols-outlined text-gray-400">close</span>
              </button>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span 
                v-for="tag in previewModal.example?.tags" 
                :key="tag"
                class="text-xs px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary rounded-full"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <button 
                @click="handleUseTemplate(previewModal.example)"
                class="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                Use This Template
              </button>
              <button 
                @click="closePreviewModal"
                class="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import ResumePreview from '../components/ResumePreview.vue'

const router = useRouter()

// Sample example templates with preview data
const examples = ref([
  {
    id: 1,
    title: 'Software Engineer',
    description: 'Modern resume for tech roles with emphasis on projects and skills',
    tags: ['Tech', 'Modern', 'Minimal'],
    template: 'modern',
    resumeData: {
      firstName: 'Alex',
      lastName: 'Johnson',
      email: 'alex@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Full-stack engineer with 5+ years building scalable applications',
      linkedin: 'linkedin.com/in/alexjohnson',
      experience: [
        {
          position: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: '2021 - Present',
          location: 'San Francisco, CA',
          achievements: 'Led team of 5 engineers; reduced latency by 40%'
        },
        {
          position: 'Software Engineer',
          company: 'StartupXYZ',
          duration: '2019 - 2021',
          location: 'San Francisco, CA',
          achievements: 'Built microservices architecture; scaled to 10M requests/day'
        },
        {
          position: 'Junior Developer',
          company: 'Dev Agency',
          duration: '2017 - 2019',
          location: 'Mountain View, CA',
          achievements: 'Developed 15+ client projects using React and Node.js'
        }
      ],
      education: [
        {
          degree: 'B.S. Computer Science',
          university: 'Stanford University',
          years: '2017-2021'
        }
      ],
      skills: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL']
    },
    layout: { template: 'modern' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#3b82f6' }
  },
  {
    id: 2,
    title: 'Product Manager',
    description: 'Executive-focused template highlighting leadership and impact',
    tags: ['Business', 'Executive', 'Professional'],
    template: 'professional',
    resumeData: {
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah@example.com',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      summary: 'Strategic product leader driving innovation and user growth at scale',
      linkedin: 'linkedin.com/in/sarahwilliams',
      experience: [
        {
          position: 'Senior Product Manager',
          company: 'Innovation Inc',
          duration: '2020 - Present',
          location: 'New York, NY',
          achievements: 'Grew user base by 150%; managed $2M+ budget'
        },
        {
          position: 'Product Manager',
          company: 'Growth Startup',
          duration: '2018 - 2020',
          location: 'San Francisco, CA',
          achievements: 'Launched 8 major features; improved retention by 35%'
        },
        {
          position: 'Associate Product Manager',
          company: 'Tech Consulting',
          duration: '2016 - 2018',
          location: 'New York, NY',
          achievements: 'Managed feature roadmap for 3 products; $500K revenue impact'
        }
      ],
      education: [
        {
          degree: 'MBA',
          university: 'Harvard Business School',
          years: '2018-2020'
        }
      ],
      skills: ['Product Strategy', 'Analytics', 'Leadership', 'UX Design']
    },
    layout: { template: 'professional' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#1f2937' }
  },
  {
    id: 3,
    title: 'Designer',
    description: 'Creative resume showcasing design portfolio and visual hierarchy',
    tags: ['Creative', 'Design', 'Portfolio'],
    template: 'creative',
    resumeData: {
      firstName: 'Jordan',
      lastName: 'Chen',
      email: 'jordan@example.com',
      phone: '+1 (555) 345-6789',
      location: 'Los Angeles, CA',
      summary: 'Award-winning designer passionate about creating beautiful user experiences',
      linkedin: 'linkedin.com/in/jordanchen',
      experience: [
        {
          position: 'Lead Product Designer',
          company: 'Design Studio',
          duration: '2019 - Present',
          location: 'Los Angeles, CA',
          achievements: 'Designed mobile app used by 500K+ users; won 2 design awards'
        },
        {
          position: 'Product Designer',
          company: 'Creative Agency',
          duration: '2017 - 2019',
          location: 'Los Angeles, CA',
          achievements: 'Redesigned web platform; improved UX metrics by 45%'
        },
        {
          position: 'UI/UX Designer',
          company: 'Digital Co',
          duration: '2015 - 2017',
          location: 'San Francisco, CA',
          achievements: 'Created design systems used by 20+ startups'
        }
      ],
      education: [
        {
          degree: 'BFA Graphic Design',
          university: 'Rhode Island School of Design',
          years: '2016-2020'
        }
      ],
      skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Branding']
    },
    layout: { template: 'creative' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#ec4899' }
  },
  {
    id: 4,
    title: 'Marketing Manager',
    description: 'Results-driven template perfect for marketing professionals',
    tags: ['Marketing', 'Business', 'Results-Driven'],
    template: 'modern',
    resumeData: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      summary: 'Results-driven marketer specializing in growth strategy and brand development',
      linkedin: 'linkedin.com/in/emilyrodriguez',
      experience: [
        {
          position: 'Marketing Manager',
          company: 'Brand Co',
          duration: '2020 - Present',
          location: 'Chicago, IL',
          achievements: 'Increased brand awareness by 200%; led team of 4 marketers'
        },
        {
          position: 'Marketing Specialist',
          company: 'Growth Marketing Inc',
          duration: '2018 - 2020',
          location: 'Chicago, IL',
          achievements: 'Managed $500K marketing budget; grew leads by 120%'
        },
        {
          position: 'Content Marketing Coordinator',
          company: 'Digital Media',
          duration: '2016 - 2018',
          location: 'Milwaukee, WI',
          achievements: 'Created 200+ pieces of content; 2M+ total impressions'
        }
      ],
      education: [
        {
          degree: 'B.S. Marketing',
          university: 'Northwestern University',
          years: '2018-2022'
        }
      ],
      skills: ['Digital Marketing', 'Content Strategy', 'Analytics', 'Social Media']
    },
    layout: { template: 'modern' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#f59e0b' }
  },
  {
    id: 5,
    title: 'Data Scientist',
    description: 'Technical resume emphasizing data skills and analytics projects',
    tags: ['Data', 'Tech', 'Research'],
    template: 'professional',
    resumeData: {
      firstName: 'David',
      lastName: 'Kumar',
      email: 'david@example.com',
      phone: '+1 (555) 567-8901',
      location: 'Seattle, WA',
      summary: 'Data scientist with expertise in ML and statistical analysis',
      linkedin: 'linkedin.com/in/davidkumar',
      experience: [
        {
          position: 'Senior Data Scientist',
          company: 'Analytics Corp',
          duration: '2019 - Present',
          location: 'Seattle, WA',
          achievements: 'Built ML models improving prediction accuracy by 35%'
        },
        {
          position: 'Data Scientist',
          company: 'Tech Solutions',
          duration: '2017 - 2019',
          location: 'Seattle, WA',
          achievements: 'Developed recommendation engine; increased revenue by $1M'
        },
        {
          position: 'Data Analyst',
          company: 'Analytics Firm',
          duration: '2015 - 2017',
          location: 'Portland, OR',
          achievements: 'Built 50+ dashboards; trained 20+ analysts on ML basics'
        }
      ],
      education: [
        {
          degree: 'M.S. Data Science',
          university: 'University of Washington',
          years: '2019-2021'
        }
      ],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Tableau']
    },
    layout: { template: 'professional' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#06b6d4' }
  },
  {
    id: 6,
    title: 'HR Specialist',
    description: 'Comprehensive template for human resources professionals',
    tags: ['HR', 'Business', 'Professional'],
    template: 'professional',
    resumeData: {
      firstName: 'Michelle',
      lastName: 'Thompson',
      email: 'michelle@example.com',
      phone: '+1 (555) 678-9012',
      location: 'Boston, MA',
      summary: 'HR professional focused on talent development and organizational excellence',
      linkedin: 'linkedin.com/in/michellethompson',
      experience: [
        {
          position: 'HR Manager',
          company: 'People First Corp',
          duration: '2019 - Present',
          location: 'Boston, MA',
          achievements: 'Reduced turnover by 25%; implemented new talent program'
        },
        {
          position: 'HR Specialist',
          company: 'Human Resources Solutions',
          duration: '2017 - 2019',
          location: 'Boston, MA',
          achievements: 'Managed recruitment for 200+ hires; improved hiring time by 30%'
        },
        {
          position: 'HR Coordinator',
          company: 'Employee Services',
          duration: '2015 - 2017',
          location: 'Hartford, CT',
          achievements: 'Coordinated 50+ company events; increased engagement by 40%'
        }
      ],
      education: [
        {
          degree: 'B.A. Human Resources',
          university: 'Boston University',
          years: '2017-2021'
        }
      ],
      skills: ['Talent Management', 'HRIS', 'Recruitment', 'Employee Relations']
    },
    layout: { template: 'professional' },
    style: { headingFont: 'inter', bodyFont: 'inter', accentColor: '#10b981' }
  }
])

// Preview modal state
const previewModal = ref({
  show: false,
  example: null
})

const handleUseTemplate = (example) => {
  if (!example || !example.id) {
    console.error('Invalid template selected')
    return
  }
  
  // Navigate to builder with complete template configuration
  router.push({
    name: 'Builder',
    query: { 
      template: example.template,
      templateId: example.id,
      templateStyle: JSON.stringify(example.style)
    }
  })
}

const openPreviewModal = (example) => {
  previewModal.value.show = true
  previewModal.value.example = example
}

const closePreviewModal = () => {
  previewModal.value.show = false
  previewModal.value.example = null
}
</script>

<style scoped>
</style>
