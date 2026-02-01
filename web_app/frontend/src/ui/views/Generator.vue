<template>
  <div class="min-h-screen bg-[#f6f6f8] dark:bg-[#111621] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <!-- Stepper Header -->
      <div class="mb-12">
        <div class="flex items-center justify-center">
          <div class="flex items-center space-x-4">
            <div :class="['size-10 rounded-full flex items-center justify-center font-bold transition-colors', step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500']">1</div>
            <div :class="['h-0.5 w-12 transition-colors', step >= 2 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800']"></div>
            <div :class="['size-10 rounded-full flex items-center justify-center font-bold transition-colors', step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500']">2</div>
            <div :class="['h-0.5 w-12 transition-colors', step >= 3 ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800']"></div>
            <div :class="['size-10 rounded-full flex items-center justify-center font-bold transition-colors', step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500']">3</div>
          </div>
        </div>
        <div class="flex justify-center mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          <span class="w-24 text-center" :class="{ 'text-primary dark:text-primary': step === 1 }">Paste JD</span>
          <span class="w-12"></span>
          <span class="w-24 text-center" :class="{ 'text-primary dark:text-primary': step === 2 }">Select Template</span>
          <span class="w-12"></span>
          <span class="w-24 text-center" :class="{ 'text-primary dark:text-primary': step === 3 }">Generate</span>
        </div>
      </div>

      <!-- Step 1: Job Description -->
      <div v-if="step === 1" class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">What role are you applying for?</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">Paste the job description and your current resume. Our AI will tailor your experience to match the role requirements.</p>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Job Description <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="jobDescription"
                rows="8"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none custom-scrollbar"
                placeholder="Paste the full job description here..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Your Current Resume/CV <span class="text-red-500">*</span>
              </label>
              <textarea 
                v-model="userData"
                rows="8"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none custom-scrollbar"
                placeholder="Paste your current resume or key details: name, email, work experience, education, skills..."
              ></textarea>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">Include your contact info, work history, education, and skills. The AI will use this to create a tailored resume.</p>
            </div>
            
            <div v-if="error" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
              {{ error }}
            </div>
          </div>
        </div>
        <div class="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <router-link to="/dashboard" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium px-4 py-2 transition-colors">Cancel</router-link>
          <button 
            @click="nextStep"
            class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            Choose Template
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 2: Template Selection -->
      <div v-else-if="step === 2" class="animate-in fade-in slide-in-from-right-4 duration-500">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Choose your style</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 text-center">Select a template that best represents your professional brand.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div 
            v-for="template in templates" 
            :key="template.id"
            @click="selectTemplate(template.id)"
            :class="[
              'group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden cursor-pointer border-2 transition-all p-4',
              selectedTemplate === template.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-md'
            ]"
          >
            <div class="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
              <!-- Template Preview Placeholder -->
              <div class="flex flex-col gap-2 w-3/4 opacity-50">
                <div class="h-3 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div class="mt-4 flex gap-2">
                  <div class="size-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-900 dark:text-white">{{ template.name }}</span>
              <div v-if="selectedTemplate === template.id" class="size-5 bg-primary rounded-full flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
          {{ error }}
        </div>

        <div class="flex justify-between items-center">
          <button 
            @click="prevStep"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium px-4 py-2 flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to JD
          </button>
          <button 
            @click="handleGenerate"
            :disabled="isGenerating"
            class="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center gap-3 disabled:opacity-50"
          >
            Generate My Resume
            <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 3: Generating -->
      <div v-else-if="step === 3" class="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-12 text-center animate-in zoom-in duration-500">
        <div class="relative size-32 mx-auto mb-8">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div class="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.29 7 12 12 20.71 7"/>
              <line x1="12" y1="22" x2="12" y2="12"/>
            </svg>
          </div>
        </div>
        
        <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-4">Crafting your professional story...</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          Our AI is analyzing your career history and matching it to the role requirements. This usually takes about 15-30 seconds.
        </p>
        
        <div class="flex flex-col gap-4 max-w-xs mx-auto">
          <div class="flex items-center gap-3 text-sm text-green-500 font-medium">
            <div class="size-5 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            Analyzing Job Description
          </div>
          <div class="flex items-center gap-3 text-sm text-blue-500 font-medium animate-pulse">
            <div class="size-5 rounded-full bg-blue-100 flex items-center justify-center">
              <div class="size-2 rounded-full bg-blue-500"></div>
            </div>
            Extracting Key Keywords
          </div>
          <div class="flex items-center gap-3 text-sm text-gray-400 font-medium">
            <div class="size-5 rounded-full bg-gray-100 flex items-center justify-center"></div>
            Generating Achievement Statements
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGeneratorController } from '../composables/useGeneratorController.js'

const {
  step,
  jobDescription,
  userData,
  selectedTemplate,
  templates,
  isGenerating,
  error,
  nextStep,
  prevStep,
  selectTemplate,
  handleGenerate
} = useGeneratorController()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slide-in-from-bottom {
  from { transform: translateY(1rem); }
  to { transform: translateY(0); }
}
@keyframes slide-in-from-right {
  from { transform: translateX(1rem); }
  to { transform: translateX(0); }
}
@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-in {
  animation-fill-mode: both;
}
.fade-in {
  animation-name: fade-in;
}
.slide-in-from-bottom-4 {
  animation-name: slide-in-from-bottom;
}
.slide-in-from-right-4 {
  animation-name: slide-in-from-right;
}
.zoom-in {
  animation-name: zoom-in;
}
</style>

