<template>
  <div class="flex h-full grow flex-col">
    <AppHeader></AppHeader>

    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Breadcrumbs & Headline -->
      <div class="px-6 py-4 flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <a class="text-[#4d6599] dark:text-gray-400 text-sm font-medium hover:underline" href="#">Jobs</a>
          <span class="material-symbols-outlined text-xs text-[#4d6599]">chevron_right</span>
          <span class="text-sm font-medium">{{ job?.position }} - {{ job?.company }}</span>
        </div>
        <div class="flex justify-between items-end">
          <h1 class="text-2xl font-bold tracking-tight">AI Resume Tailoring Studio</h1>
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-end">
              <span class="text-xs font-semibold text-[#4d6599] uppercase tracking-wider">ATS Match Score</span>
              <div class="flex items-center gap-2">
                <div class="w-32 h-2 bg-[#e7ebf3] dark:bg-white/10 rounded-full overflow-hidden">
                  <div class="bg-green-500 h-full w-[85%] rounded-full"></div>
                </div>
                <span class="text-lg font-bold text-green-500">85%</span>
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
            <h3 class="text-base font-bold">{{ job?.company }}</h3>
            <p class="text-[#4d6599] dark:text-gray-400 text-xs">{{ job?.position }}</p>
          </div>
          <div class="flex flex-col gap-1">
            <button class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined text-xl">work</span>
              <p class="text-sm font-medium">Job Details</p>
            </button>
            <button class="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors">
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">description</span>
              <p class="text-sm font-medium">Resume Editor</p>
            </button>
            <button class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined text-xl">auto_fix_high</span>
              <p class="text-sm font-medium">AI Suggestions</p>
            </button>
            <button class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined text-xl">analytics</span>
              <p class="text-sm font-medium">ATS Analysis</p>
            </button>
          </div>
          <div class="mt-auto p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p class="text-xs font-bold text-primary uppercase mb-2">Pro Tip</p>
            <p class="text-xs leading-relaxed text-[#4d6599] dark:text-gray-300">Highlighting keywords like "User Research" and "Figma" can boost your score by 12%.</p>
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
                <p class="text-xs text-[#4d6599] dark:text-gray-400">Current Stage: <span class="text-primary font-semibold">{{ job?.status }}</span></p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div class="size-8 rounded-full border-2 border-white dark:border-background-dark bg-gray-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                <div class="size-8 rounded-full border-2 border-white dark:border-background-dark bg-primary flex items-center justify-center text-[10px] font-bold text-white">CV</div>
              </div>
              <button class="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-md transition-all">
                <span>Link to this Resume</span>
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
                <span class="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase">8 Keywords Found</span>
              </div>
              <div class="p-6 overflow-y-auto no-scrollbar prose prose-sm dark:prose-invert">
                <h4 class="font-bold text-base mb-2">Role Overview</h4>
                <p class="mb-4">{{ job?.jobDescription }}</p>
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
                  <span class="text-[10px] text-[#4d6599] italic">Draft v2.4</span>
                </div>
                <div class="flex gap-2">
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">undo</span></button>
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">redo</span></button>
                  <button class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"><span class="material-symbols-outlined text-lg">download</span></button>
                </div>
              </div>
              <div class="p-8 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-background-dark/30">
                <!-- Resume Content Simulation -->
                <div class="bg-white dark:bg-background-dark p-10 shadow-lg min-h-[800px] border border-gray-100 dark:border-white/5">
                  <div class="text-center mb-8">
                    <h2 class="text-2xl font-bold uppercase tracking-widest">Alex Rivera</h2>
                    <div class="text-xs text-gray-500 mt-2">alex.rivera@design.com | +1 (555) 012-3456 | linkedin.com/in/alexrivera</div>
                  </div>
                  <div class="mb-6">
                    <h4 class="text-xs font-bold text-primary uppercase mb-2 border-b border-gray-100 dark:border-white/5 pb-1">Professional Summary</h4>
                    <p class="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      Innovative Senior Product Designer with 6 years of experience. Expert in building scalable Design Systems and conducting User Research to drive product excellence at scale.
                    </p>
                  </div>
                  <div class="mb-6">
                    <h4 class="text-xs font-bold text-primary uppercase mb-2 border-b border-gray-100 dark:border-white/5 pb-1">Experience</h4>
                    <div class="mb-4">
                      <div class="flex justify-between items-baseline">
                        <span class="text-sm font-bold">Lead Designer | TechFlow Inc.</span>
                        <span class="text-[10px] text-gray-500 uppercase">2020 – Present</span>
                      </div>
                      <ul class="mt-2 space-y-1 list-disc pl-4 text-xs text-gray-700 dark:text-gray-300">
                        <li>Directed Cross-functional Collaboration efforts between engineering and marketing.</li>
                        <li>Utilized Figma to develop a comprehensive mobile UI kit.</li>
                        <li>Integrated Business Requirements into user-centric product roadmaps.</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-primary uppercase mb-2 border-b border-gray-100 dark:border-white/5 pb-1">Skills</h4>
                    <div class="flex flex-wrap gap-2">
                      <span class="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Interaction Design</span>
                      <span class="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Prototyping</span>
                      <span class="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">Figma</span>
                      <span class="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold">User Research</span>
                      <span class="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">Agile</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-primary text-white text-[10px] font-medium flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">bolt</span>
                AI Tailoring Active: Auto-suggesting keyword placement
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter></AppFooter>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useJobApplicationController } from '../composables/useJobApplicationController.js';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';

const route = useRoute();
const jobId = route.params.id;

const { getApplication } = useJobApplicationController();

const job = ref(null);

onMounted(async () => {
  try {
    job.value = await getApplication(jobId, authStore.user.id);
  } catch (error) {
    console.error('Failed to load job:', error);
  }
});
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