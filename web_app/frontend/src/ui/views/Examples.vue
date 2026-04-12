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
                    :hide-empty-sections="true"
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
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto" @click.stop>
        <div class="flex flex-col lg:flex-row">
          <!-- Preview Section -->
          <div class="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
            <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 h-[600px] overflow-auto">
              <ResumePreview 
                :resume="previewModal.example?.resumeData"
                :sections="[]"
                :layout="previewModal.example?.layout"
                :style="previewModal.example?.style"
                :hide-empty-sections="true"
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

// Professional example templates for user inspiration
const examples = ref([
  {
    id: 1,
    title: 'Senior Software Engineer',
    description: 'Clean modern layout for experienced engineers — highlights technical depth, scale, and team leadership.',
    tags: ['Engineering', 'Modern', 'Tech'],
    template: 'modern',
    resumeData: {
      firstName: 'Marcus',
      lastName: 'Chen',
      title: 'Staff Software Engineer',
      email: 'marcus.chen@email.com',
      phone: '+1 (415) 882-3410',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/marcuschen',
      website: 'github.com/marcuschen',
      summary: 'Senior software engineer with 8 years of experience building high-throughput distributed systems at scale. Led cross-functional teams of 6–10 engineers to ship products serving 20M+ users. Deep expertise in Go, Kubernetes, and cloud-native architecture.',
      experience: [
        {
          title: 'Staff Software Engineer',
          company: 'Stripe',
          startDate: '2022',
          endDate: 'Present',
          location: 'San Francisco, CA',
          description: 'Architected and delivered a real-time fraud detection pipeline processing 3B+ API calls/day with 99.99% uptime. Reduced infrastructure costs by $4.2M annually by migrating legacy batch jobs to streaming. Mentored 4 engineers promoted to senior level.'
        },
        {
          title: 'Senior Software Engineer',
          company: 'Airbnb',
          startDate: '2019',
          endDate: '2022',
          location: 'San Francisco, CA',
          description: 'Led backend rewrite of the payments service in Go, cutting p99 latency from 380ms to 45ms. Built internal developer platform adopted by 200+ engineers, reducing service deployment time by 60%. Owned incident response rotation for critical payment infrastructure.'
        },
        {
          title: 'Software Engineer',
          company: 'Dropbox',
          startDate: '2017',
          endDate: '2019',
          location: 'San Francisco, CA',
          description: 'Delivered end-to-end file sync engine improvements that eliminated 70% of client-reported sync errors. Shipped ML-based smart search feature that increased search engagement by 32%.'
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Computer Science',
          school: 'UC Berkeley',
          startDate: '2013',
          endDate: '2017'
        }
      ],
      skills: ['Go', 'Kubernetes', 'gRPC', 'PostgreSQL', 'Redis', 'AWS', 'Python', 'System Design']
    },
    layout: { template: 'modern', margins: 40, sectionSpacing: 20 },
    style: { headingFont: 'inter', bodyFont: 'inter', fontSize: 11, accentColor: '#2563eb' }
  },
  {
    id: 2,
    title: 'Product Manager',
    description: 'Executive-style layout that leads with business impact, strategy, and cross-functional leadership.',
    tags: ['Product', 'Professional', 'Leadership'],
    template: 'professional',
    resumeData: {
      firstName: 'Priya',
      lastName: 'Nair',
      title: 'Director of Product',
      email: 'priya.nair@email.com',
      phone: '+1 (646) 554-9023',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/priyanair',
      summary: 'Product leader with 9 years of experience defining and shipping consumer and B2B products used by 30M+ people. Track record of growing revenue, improving retention, and scaling cross-functional teams from 0 to 1 and 1 to 10. Former founder; MBA from Wharton.',
      experience: [
        {
          title: 'Director of Product',
          company: 'Notion',
          startDate: '2021',
          endDate: 'Present',
          location: 'New York, NY',
          description: 'Owned the collaboration and sharing product area serving 25M users. Launched real-time multiplayer editing, which increased daily active users by 41% and drove $18M in incremental ARR. Built and managed a team of 5 PMs and 3 designers.'
        },
        {
          title: 'Senior Product Manager',
          company: 'HubSpot',
          startDate: '2018',
          endDate: '2021',
          location: 'Boston, MA',
          description: 'Led CRM core product from 50K to 150K paying customers. Redesigned the deal pipeline UX — reduced time-to-close by 22% and improved NPS by 18 points. Collaborated with sales and marketing to define go-to-market strategy for SMB segment.'
        },
        {
          title: 'Product Manager',
          company: 'Squarespace',
          startDate: '2016',
          endDate: '2018',
          location: 'New York, NY',
          description: 'Shipped e-commerce checkout redesign that lifted conversion rate by 14%. Defined and executed roadmap for the mobile app team, resulting in 4.8-star App Store rating.'
        }
      ],
      education: [
        {
          degree: 'MBA',
          field: '',
          school: 'Wharton School, University of Pennsylvania',
          startDate: '2014',
          endDate: '2016'
        },
        {
          degree: 'B.S.',
          field: 'Business Administration',
          school: 'University of Michigan',
          startDate: '2010',
          endDate: '2014'
        }
      ],
      skills: ['Product Strategy', 'Roadmapping', 'A/B Testing', 'SQL', 'Figma', 'OKRs', 'User Research', 'Go-to-Market']
    },
    layout: { template: 'professional', margins: 44, sectionSpacing: 22 },
    style: { headingFont: 'inter', bodyFont: 'inter', fontSize: 11, accentColor: '#111827' }
  },
  {
    id: 3,
    title: 'UX / Product Designer',
    description: 'Creative layout that showcases design thinking, portfolio breadth, and measurable UX outcomes.',
    tags: ['Design', 'Creative', 'UX'],
    template: 'creative',
    resumeData: {
      firstName: 'Sofia',
      lastName: 'Reyes',
      title: 'Lead Product Designer',
      email: 'sofia.reyes@email.com',
      phone: '+1 (310) 773-4481',
      location: 'Los Angeles, CA',
      linkedin: 'linkedin.com/in/sofiareyes',
      website: 'sofiareyes.design',
      summary: 'Product designer with 7 years crafting intuitive digital experiences for fintech, healthcare, and consumer apps. Expert in end-to-end design — from discovery workshops to launch-ready Figma components. Passionate about accessibility and inclusive design.',
      experience: [
        {
          title: 'Lead Product Designer',
          company: 'Robinhood',
          startDate: '2021',
          endDate: 'Present',
          location: 'Menlo Park, CA (Remote)',
          description: 'Redesigned the options trading flow for first-time investors, reducing task-failure rate from 34% to 8% and increasing options activations by 55%. Built and maintained the Robinhood design system (900+ components) used by 40 designers. Won internal "Design Impact" award 2023.'
        },
        {
          title: 'Senior Product Designer',
          company: 'Oscar Health',
          startDate: '2018',
          endDate: '2021',
          location: 'New York, NY',
          description: 'Owned end-to-end UX for member portal serving 500K+ patients. Led a complete visual rebrand executed across web and mobile in 14 weeks. Increased member portal login engagement by 38% after redesigning the home dashboard.'
        },
        {
          title: 'UX Designer',
          company: 'IDEO',
          startDate: '2016',
          endDate: '2018',
          location: 'San Francisco, CA',
          description: "Facilitated design sprints for 10+ clients including Google, CVS, and Levi's. Delivered research-driven prototypes that shaped $25M+ in client product investments."
        }
      ],
      education: [
        {
          degree: 'BFA',
          field: 'Interaction Design',
          school: 'California College of the Arts',
          startDate: '2012',
          endDate: '2016'
        }
      ],
      skills: ['Figma', 'UX Research', 'Prototyping', 'Design Systems', 'Accessibility (WCAG)', 'User Testing', 'Motion Design', 'Framer']
    },
    layout: { template: 'creative', margins: 40, sectionSpacing: 20 },
    style: { headingFont: 'playfair', bodyFont: 'inter', fontSize: 11, accentColor: '#db2777' }
  },
  {
    id: 4,
    title: 'Data Scientist',
    description: 'Technical resume that leads with ML expertise, quantified research impact, and open-source contributions.',
    tags: ['Data Science', 'ML', 'Technical'],
    template: 'technical',
    resumeData: {
      firstName: 'James',
      lastName: 'Okafor',
      title: 'Senior Machine Learning Engineer',
      email: 'james.okafor@email.com',
      phone: '+1 (206) 441-8892',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/jamesokafor',
      website: 'github.com/jamesokafor',
      summary: 'Machine learning engineer and data scientist with 6 years of experience building production ML systems and NLP pipelines. Published researcher with 3 peer-reviewed papers. Experienced in taking models from Jupyter notebooks to serving 100M+ predictions/day.',
      experience: [
        {
          title: 'Senior Machine Learning Engineer',
          company: 'Amazon',
          startDate: '2021',
          endDate: 'Present',
          location: 'Seattle, WA',
          description: 'Built product ranking model for Amazon Search, improving click-through rate by 12% and increasing attributed revenue by $380M annually. Led cross-team initiative to standardize ML feature engineering platform (reduced feature dev time by 4×). Co-authored internal LLM fine-tuning playbook adopted company-wide.'
        },
        {
          title: 'Data Scientist',
          company: 'Spotify',
          startDate: '2019',
          endDate: '2021',
          location: 'New York, NY',
          description: 'Developed personalized podcast recommendation model using collaborative filtering + content embeddings, increasing podcast listening hours by 27%. Built real-time A/B testing pipeline supporting 500+ experiments simultaneously.'
        },
        {
          title: 'Data Analyst',
          company: 'McKinsey & Company',
          startDate: '2017',
          endDate: '2019',
          location: 'Chicago, IL',
          description: 'Delivered data-driven strategy reports for Fortune 500 clients in retail and CPG. Automated data pipeline reduced analyst reporting time from 12 hours to 45 minutes per week.'
        }
      ],
      education: [
        {
          degree: 'M.S.',
          field: 'Computer Science (Machine Learning)',
          school: 'Carnegie Mellon University',
          startDate: '2015',
          endDate: '2017'
        },
        {
          degree: 'B.S.',
          field: 'Statistics & Mathematics',
          school: 'University of Chicago',
          startDate: '2011',
          endDate: '2015'
        }
      ],
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Spark', 'SQL', 'Kubernetes', 'MLflow', 'Transformers (HuggingFace)', 'Scala']
    },
    layout: { template: 'technical', margins: 40, sectionSpacing: 20 },
    style: { headingFont: 'roboto-mono', bodyFont: 'inter', fontSize: 11, accentColor: '#0891b2' }
  },
  {
    id: 5,
    title: 'Marketing Director',
    description: 'Results-driven layout emphasizing revenue impact, brand growth, and cross-channel campaign performance.',
    tags: ['Marketing', 'Leadership', 'Growth'],
    template: 'classic',
    resumeData: {
      firstName: 'Lauren',
      lastName: 'Mitchell',
      title: 'Director of Marketing',
      email: 'lauren.mitchell@email.com',
      phone: '+1 (312) 664-5571',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/laurenmitchell',
      summary: 'Marketing director with 10 years of experience building iconic consumer brands and digital-first growth engines. Managed up to $15M in annual marketing budgets and teams of 12. Expertise in performance marketing, brand strategy, and integrated campaign execution.',
      experience: [
        {
          title: 'Director of Marketing',
          company: 'Grubhub',
          startDate: '2020',
          endDate: 'Present',
          location: 'Chicago, IL',
          description: "Launched \"Tonight's Dinner\" brand campaign reaching 40M households, driving a 29% increase in new user acquisition. Scaled performance marketing budget from $3M to $11M with 3.2× ROAS. Built and mentored a high-performing team of 12 across brand, performance, and content."
        },
        {
          title: 'Senior Marketing Manager',
          company: 'Groupon',
          startDate: '2017',
          endDate: '2020',
          location: 'Chicago, IL',
          description: 'Owned email and CRM marketing for 28M subscribers — improved open rates by 22% and revenue per email by 34% through segmentation and personalization. Led influencer and affiliate programs generating $7M in annual attributed revenue.'
        },
        {
          title: 'Marketing Manager',
          company: '1871 Chicago',
          startDate: '2015',
          endDate: '2017',
          location: 'Chicago, IL',
          description: 'Grew LinkedIn following from 4K to 28K and event attendance by 3× through organic content strategy. Produced 12 flagship industry events attended by 5,000+ professionals.'
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Marketing & Communications',
          school: 'Northwestern University',
          startDate: '2011',
          endDate: '2015'
        }
      ],
      skills: ['Brand Strategy', 'Performance Marketing', 'CRM & Email', 'Paid Social', 'Google Ads', 'Budget Management', 'Influencer Marketing', 'Analytics']
    },
    layout: { template: 'classic', margins: 44, sectionSpacing: 22 },
    style: { headingFont: 'inter', bodyFont: 'inter', fontSize: 11, accentColor: '#d97706' }
  },
  {
    id: 6,
    title: 'Financial Analyst',
    description: 'Clean, authoritative format for finance professionals — focuses on deals, modeling, and analytical rigor.',
    tags: ['Finance', 'Analyst', 'Classic'],
    template: 'classic',
    resumeData: {
      firstName: 'Tyler',
      lastName: 'Brooks',
      title: 'Vice President, Investment Banking',
      email: 'tyler.brooks@email.com',
      phone: '+1 (212) 993-7740',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/tylerbrooks',
      summary: 'CFA charterholder and financial analyst with 7 years of experience in investment banking and corporate finance. Closed $2.4B in M&A and capital markets transactions. Skilled in financial modeling, valuation, and board-level communications.',
      experience: [
        {
          title: 'Vice President, Investment Banking',
          company: 'Goldman Sachs',
          startDate: '2021',
          endDate: 'Present',
          location: 'New York, NY',
          description: 'Led execution of 6 M&A transactions totaling $1.8B in deal value across TMT and healthcare sectors. Built 3-statement LBO and DCF models supporting sell-side mandates. Managed 2 analysts and presented deal memos to C-suite and board audiences.'
        },
        {
          title: 'Associate, Corporate Development',
          company: 'Johnson & Johnson',
          startDate: '2018',
          endDate: '2021',
          location: 'New Brunswick, NJ',
          description: 'Evaluated acquisition targets in medtech with combined EV of $6B+. Owned financial due diligence and integration planning for 2 closed transactions. Reduced financial close reporting cycle from 8 days to 3 days through process automation.'
        },
        {
          title: 'Financial Analyst',
          company: 'Lazard',
          startDate: '2016',
          endDate: '2018',
          location: 'New York, NY',
          description: 'Supported structuring and closing of $600M cross-border acquisition. Built and maintained complex merger models, cap tables, and scenario analyses for client engagements.'
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Finance & Economics',
          school: 'University of Pennsylvania',
          startDate: '2012',
          endDate: '2016'
        }
      ],
      skills: ['Financial Modeling', 'Valuation (DCF, LBO, Comps)', 'M&A', 'Capital Markets', 'Excel & VBA', 'Bloomberg', 'PowerPoint', 'CFA']
    },
    layout: { template: 'classic', margins: 44, sectionSpacing: 22 },
    style: { headingFont: 'inter', bodyFont: 'inter', fontSize: 11, accentColor: '#1e3a5f' }
  },
  {
    id: 7,
    title: 'Academic Researcher',
    description: 'Publication-forward layout for PhD candidates, postdocs, and faculty — emphasizes grants, research, and teaching.',
    tags: ['Academic', 'Research', 'PhD'],
    template: 'academic',
    resumeData: {
      firstName: 'Amara',
      lastName: 'Osei',
      title: 'Postdoctoral Research Fellow',
      email: 'amara.osei@university.edu',
      phone: '+1 (617) 495-2200',
      location: 'Cambridge, MA',
      linkedin: 'linkedin.com/in/amaraosei',
      website: 'scholar.google.com/amaraosei',
      summary: 'Computational biologist and NIH-funded researcher specializing in single-cell genomics and machine learning applications to cancer biology. 18 peer-reviewed publications; 1,400+ citations. Seeking tenure-track faculty position.',
      experience: [
        {
          title: 'Postdoctoral Research Fellow',
          company: 'Broad Institute of MIT & Harvard',
          startDate: '2022',
          endDate: 'Present',
          location: 'Cambridge, MA',
          description: 'Led development of scRNA-seq computational pipeline adopted by 30+ labs worldwide (GitHub: 2.1K stars). First-authored Nature Methods paper on deep learning-based cell-type deconvolution (IF: 48.0). Secured $180K NIH K99 transitional award.'
        },
        {
          title: 'Graduate Research Assistant',
          company: 'Stanford University, Chang Lab',
          startDate: '2016',
          endDate: '2022',
          location: 'Stanford, CA',
          description: 'PhD dissertation: "Graph neural networks for spatial transcriptomics." Published 11 papers in Nature, Cell, and PNAS. Co-supervised 4 undergraduate research assistants. Won departmental best dissertation award 2022.'
        },
        {
          title: 'Teaching Assistant — Computational Biology',
          company: 'Stanford University',
          startDate: '2017',
          endDate: '2020',
          location: 'Stanford, CA',
          description: 'Led weekly lab sections for 45–60 students. Developed problem sets covering sequence alignment, hidden Markov models, and CRISPR data analysis used by 3 subsequent cohorts.'
        }
      ],
      education: [
        {
          degree: 'Ph.D.',
          field: 'Biomedical Informatics',
          school: 'Stanford University',
          startDate: '2016',
          endDate: '2022'
        },
        {
          degree: 'B.Sc.',
          field: 'Biochemistry (First Class Honours)',
          school: 'University of Ghana',
          startDate: '2012',
          endDate: '2016'
        }
      ],
      skills: ['Python (Scanpy, PyTorch)', 'R (Seurat, DESeq2)', 'Single-cell Genomics', 'Graph Neural Networks', 'CRISPR Analysis', 'NIH Grant Writing', 'Scientific Communication']
    },
    layout: { template: 'academic', margins: 44, sectionSpacing: 22 },
    style: { headingFont: 'lora', bodyFont: 'inter', fontSize: 11, accentColor: '#7c3aed' }
  },
  {
    id: 8,
    title: 'Operations Manager',
    description: 'Minimal, easy-to-read format for operations, supply chain, and general management professionals.',
    tags: ['Operations', 'Management', 'Minimal'],
    template: 'minimal',
    resumeData: {
      firstName: 'Kevin',
      lastName: 'Park',
      title: 'Senior Operations Manager',
      email: 'kevin.park@email.com',
      phone: '+1 (503) 218-4437',
      location: 'Portland, OR',
      linkedin: 'linkedin.com/in/kevinpark',
      summary: 'Operations manager with 8 years of experience scaling logistics and fulfillment operations for e-commerce and retail companies. Known for building lean processes, high-performing teams, and resilient supply chains in fast-growth environments.',
      experience: [
        {
          title: 'Senior Operations Manager',
          company: 'Zappos (Amazon subsidiary)',
          startDate: '2020',
          endDate: 'Present',
          location: 'Louisville, KY (Remote)',
          description: 'Oversaw daily operations for a 480-person fulfillment center processing 85K orders/day. Implemented lean Six Sigma improvements cutting picking error rate from 1.8% to 0.3%. Reduced overtime spend by $1.2M annually by reengineering shift scheduling model.'
        },
        {
          title: 'Operations Manager',
          company: 'Patagonia',
          startDate: '2017',
          endDate: '2020',
          location: 'Reno, NV',
          description: 'Managed 3 fulfillment shifts and 120 associates across peak and off-peak seasons. Led WMS implementation (Manhattan Associates) that improved inventory accuracy to 99.8%. Achieved 98.2% on-time shipping rate during the 2019 holiday season.'
        },
        {
          title: 'Operations Supervisor',
          company: 'UPS Supply Chain Solutions',
          startDate: '2015',
          endDate: '2017',
          location: 'Portland, OR',
          description: 'Supervised cross-dock operations for 3 key retail accounts. Trained and onboarded 45 new associates; reduced 90-day turnover by 18%.'
        }
      ],
      education: [
        {
          degree: 'B.S.',
          field: 'Supply Chain Management',
          school: 'Portland State University',
          startDate: '2011',
          endDate: '2015'
        }
      ],
      skills: ['Lean / Six Sigma (Green Belt)', 'Warehouse Management Systems', 'Supply Chain Optimization', 'P&L Management', 'Team Leadership', 'Process Improvement', 'SAP', 'KPI Reporting']
    },
    layout: { template: 'minimal', margins: 40, sectionSpacing: 20 },
    style: { headingFont: 'inter', bodyFont: 'inter', fontSize: 11, accentColor: '#374151' }
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
