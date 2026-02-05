<template>
  <div class="flex h-full grow flex-col">
    <AppHeader></AppHeader>

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Breadcrumbs & Headline -->
      <div class="px-6 py-4 flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <a class="text-[#4d6599] dark:text-gray-400 text-sm font-medium hover:underline" href="/saved-jobs">Jobs</a>
          <span class="material-symbols-outlined text-xs text-[#4d6599]">chevron_right</span>
          <span class="text-sm font-medium">{{ job?.position || 'Loading...' }} - {{ job?.company || '' }}</span>
        </div>
        <div class="flex justify-between items-end">
          <h1 class="text-2xl font-bold tracking-tight">AI Resume Tailoring Studio</h1>
          <div v-if="!isLoadingJob" class="flex items-center gap-4">
            <div class="flex flex-col items-end">
              <span class="text-xs font-semibold text-[#4d6599] uppercase tracking-wider">ATS Match Score</span>
              <div class="flex items-center gap-2">
                <div class="w-32 h-2 bg-[#e7ebf3] dark:bg-white/10 rounded-full overflow-hidden">
                  <div v-if="atsScorePercent" class="bg-green-500 h-full transition-all duration-500" :style="{ width: atsScorePercent + '%' }"></div>
                  <div v-else class="bg-gray-300 h-full w-1/3"></div>
                </div>
                <span v-if="atsScorePercent" class="text-lg font-bold text-green-500">{{ atsScorePercent }}%</span>
                <span v-else class="text-lg font-bold text-gray-400">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Layout Container: SideNav + Split View -->
      <div class="flex flex-1 px-6 pb-6 gap-6 overflow-hidden">
        <!-- SideNavBar -->
        <aside class="w-64 flex flex-col gap-6 bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl p-4 shrink-0">
          <div class="flex flex-col">
            <h3 class="text-base font-bold">{{ job?.company || 'Loading...' }}</h3>
            <p class="text-[#4d6599] dark:text-gray-400 text-xs">{{ job?.position || '' }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <button @click="switchSection('details')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'details' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl">work</span>
              <p class="text-sm font-medium">Job Details</p>
            </button>
            <button @click="switchSection('editor')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'editor' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">description</span>
              <p class="text-sm font-medium">Resume Editor</p>
            </button>
            <button @click="switchSection('suggestions')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'suggestions' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl">auto_fix_high</span>
              <p class="text-sm font-medium">AI Suggestions</p>
            </button>
            <button @click="switchSection('analysis')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'analysis' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl">analytics</span>
              <p class="text-sm font-medium">ATS Analysis</p>
            </button>
          </div>
          <div class="mt-auto p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p class="text-xs font-bold text-primary uppercase mb-2">Pro Tip</p>
            <p class="text-xs leading-relaxed text-[#4d6599] dark:text-gray-300">{{ jobKeywords.slice(0, 3).join(', ') }} are key terms in this job. Highlight them to boost your ATS score.</p>
          </div>
        </aside>
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col gap-6 overflow-hidden">
          <!-- ActionPanel (AI Link) -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl border border-primary/30 bg-white dark:bg-background-dark/50 p-4 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="p-2 bg-primary/10 rounded-lg text-primary">
                <span class="material-symbols-outlined">link</span>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-bold">Application Connection</p>
                <p class="text-xs text-[#4d6599] dark:text-gray-400">Current Stage: <span :class="getStatusBadgeClass(job?.status)">{{ job?.status || 'pending' }}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div class="size-8 rounded-full border-2 border-white dark:border-background-dark bg-gray-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                <div class="size-8 rounded-full border-2 border-white dark:border-background-dark bg-primary flex items-center justify-center text-[10px] font-bold text-white">{{ resume ? 'CV' : 'N/A' }}</div>
              </div>
              <button v-if="!isGenerating" @click="handleGenerateClick"
                class="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-md transition-all">
                <span class="material-symbols-outlined text-sm">auto_awesome</span>
                <span class="truncate">Generate Tailored Resume</span>
              </button>
              <button v-else disabled
                class="flex items-center gap-2 cursor-wait rounded-lg h-9 px-4 bg-primary/50 text-white text-sm font-medium">
                <div class="animate-spin"><span class="material-symbols-outlined text-sm">hourglass_empty</span></div>
                <span>Generating...</span>
              </button>
            </div>
          </div>
          <!-- Split Screen View -->
          <div class="flex-1 flex gap-6 overflow-hidden">
            <!-- Left Side: Job Description -->
            <div class="flex-1 bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col overflow-hidden">
              <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">description</span>
                  Job Description
                </h3>
                <span v-if="jobKeywords.length > 0" class="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase">{{ jobKeywords.length }} Keywords Found</span>
              </div>
              <div class="p-6 overflow-y-auto prose prose-sm dark:prose-invert max-w-none">
                <p v-if="isLoadingJob" class="text-gray-400">Loading job description...</p>
                <p v-else-if="job?.jobDescription" class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{{ job.jobDescription }}</p>
                <p v-else class="text-gray-400">No job description available</p>
              </div>
            </div>
            <!-- Right Side: Resume Editor -->
            <div class="flex-1 bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-2xl">
              <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-white dark:bg-background-dark">
                <div class="flex items-center gap-3">
                  <h3 class="text-sm font-bold flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined text-lg">edit_note</span>
                    Resume Editor
                  </h3>
                  <span v-if="resume?.title" class="text-[10px] text-[#4d6599] italic">{{ resume.title }}</span>
                </div>
                <div class="flex gap-2">
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">undo</span></button>
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">redo</span></button>
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">download</span></button>
                </div>
              </div>
              <div class="p-8 overflow-y-auto bg-gray-50 dark:bg-background-dark/30 flex-1">
                <!-- Resume Content -->
                <div v-if="isLoadingResume" class="flex items-center justify-center h-full">
                  <p class="text-gray-400">Loading resume...</p>
                </div>
                <div v-else-if="resume" class="bg-white dark:bg-background-dark p-10 shadow-lg border border-gray-100 dark:border-white/5">
                  <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold uppercase tracking-widest">{{ resume.title || 'Resume' }}</h2>
                  </div>
                  <div v-if="resume.sections && resume.sections.length > 0" class="space-y-6">
                    <div v-for="(section, idx) in resume.sections" :key="idx" class="mb-6">
                      <h4 class="text-xs font-bold text-primary uppercase mb-2 border-b border-gray-100 dark:border-white/5 pb-1">{{ section.title }}</h4>
                      <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{{ section.content }}</p>
                    </div>
                  </div>
                  <div v-else class="text-center py-8 text-gray-400">
                    <p>No resume sections available. Generate a tailored resume to see content here.</p>
                  </div>
                </div>
                <div v-else class="flex items-center justify-center h-full">
                  <div class="text-center">
                    <p class="text-gray-400 mb-4">No resume linked to this application</p>
                    <button @click="handleGenerateClick" v-if="!isGenerating"
                      class="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-semibold mx-auto">
                      <span class="material-symbols-outlined">auto_awesome</span>
                      Create Resume
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="isGenerating || isCalculatingAts" class="p-3 bg-primary text-white text-[10px] font-medium flex items-center justify-center gap-2 animate-pulse">
                <span class="material-symbols-outlined text-sm">bolt</span>
                AI Tailoring Active: Processing your resume...
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Generation Settings Modal -->
    <div v-if="showGenerationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-background-dark rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold">AI Generation Settings</h3>
            <button @click="closeGenerationModal" class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Tone Selection -->
            <div>
              <label class="block text-sm font-medium mb-3">Resume Tone</label>
              <div class="grid grid-cols-2 gap-3">
                <button @click="generationSettings.tone = 'professional'"
                  :class="['p-3 rounded-lg border text-sm font-medium transition-colors',
                    generationSettings.tone === 'professional'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50']">
                  Professional
                </button>
                <button @click="generationSettings.tone = 'formal'"
                  :class="['p-3 rounded-lg border text-sm font-medium transition-colors',
                    generationSettings.tone === 'formal'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50']">
                  Formal
                </button>
                <button @click="generationSettings.tone = 'creative'"
                  :class="['p-3 rounded-lg border text-sm font-medium transition-colors',
                    generationSettings.tone === 'creative'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50']">
                  Creative
                </button>
                <button @click="generationSettings.tone = 'concise'"
                  :class="['p-3 rounded-lg border text-sm font-medium transition-colors',
                    generationSettings.tone === 'concise'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-white/10 hover:border-primary/50']">
                  Concise
                </button>
              </div>
            </div>

            <!-- Target ATS Score -->
            <div>
              <label class="block text-sm font-medium mb-3">Target ATS Score</label>
              <div class="space-y-2">
                <input v-model.number="generationSettings.targetAtsScore"
                  type="range" min="70" max="100" step="5"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-white/10">
                <div class="flex justify-between text-xs text-gray-500">
                  <span>70%</span>
                  <span class="font-medium">{{ generationSettings.targetAtsScore }}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button @click="closeGenerationModal"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">
              Cancel
            </button>
            <button @click="startGeneration"
              :disabled="isGenerating"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isGenerating" class="flex items-center justify-center gap-2">
                <div class="animate-spin"><span class="material-symbols-outlined text-sm">hourglass_empty</span></div>
                Generating...
              </span>
              <span v-else>Generate Resume</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <AppFooter></AppFooter>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTailoringStudioController } from '../composables/useTailoringStudioController.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

const route = useRoute();
const authStore = useAuthStore();

// Get applicationId from route params
const applicationId = computed(() => route.params.id);

// Use the controller composable
const {
  job,
  resume,
  atsScore,
  isLoadingJob,
  isLoadingResume,
  isCalculatingAts,
  isGenerating,
  error,
  activeSection,
  jobKeywords,
  resumeText,
  atsScorePercent,
  generationSettings,
  loadApplication,
  generateTailoredResume,
  improveSection,
  updateResume,
  switchSection
} = useTailoringStudioController(applicationId);

// Modal state
const showGenerationModal = ref(false);

onMounted(async () => {
  if (applicationId.value) {
    await loadApplication();
  }
});

// UI Methods
const handleGenerateClick = () => {
  showGenerationModal.value = true;
};

const closeGenerationModal = () => {
  showGenerationModal.value = false;
};

const startGeneration = async () => {
  try {
    await generateTailoredResume(generationSettings.value);
    showGenerationModal.value = false;
  } catch (err) {
    console.error('Generation failed:', err);
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'saved': return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
    case 'applied': return 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    case 'interviewing': return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'rejected': return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-900/20 dark:text-gray-400';
  }
};
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  vertical-align: middle;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>