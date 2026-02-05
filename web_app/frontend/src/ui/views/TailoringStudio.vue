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
              <div class="flex gap-2">
                <button v-if="!isGenerating" @click="handleLinkResumeClick"
                  class="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span class="material-symbols-outlined text-sm">link</span>
                  <span class="truncate">Link Resume</span>
                </button>
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
          </div>
          <!-- Dynamic Content Area Based on Active Section -->
          <div class="flex-1 overflow-hidden">
            <!-- Job Details Section -->
            <div v-if="activeSection === 'details'" class="bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col overflow-hidden">
              <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">work</span>
                  Job Details
                </h3>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase">Details</span>
                  <span v-if="jobKeywords.length > 0" class="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase">{{ jobKeywords.length }} Keywords</span>
                </div>
              </div>
              <div class="p-6 overflow-y-auto">
                <div v-if="isLoadingJob" class="flex items-center justify-center h-64">
                  <div class="text-center">
                    <div class="animate-spin mb-4"><span class="material-symbols-outlined text-4xl text-gray-400">hourglass_empty</span></div>
                    <p class="text-gray-400">Loading job details...</p>
                  </div>
                </div>
                <div v-else-if="job" class="space-y-6">
                  <!-- Job Header -->
                  <div class="border-b border-gray-100 dark:border-white/10 pb-6">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ job.position }}</h1>
                        <p class="text-lg text-gray-600 dark:text-gray-300 mb-1">{{ job.company }}</p>
                        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span v-if="job.location" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">location_on</span>
                            {{ job.location }}
                          </span>
                          <span v-if="job.salary" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">attach_money</span>
                            {{ job.salary }}
                          </span>
                          <span v-if="job.jobType" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">work</span>
                            {{ job.jobType }}
                          </span>
                        </div>
                      </div>
                      <div class="text-right">
                        <span :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', getStatusBadgeClass(job.status)]">
                          {{ job.status || 'pending' }}
                        </span>
                        <p v-if="job.appliedDate" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Applied {{ formatDate(job.appliedDate) }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Job Description -->
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg">description</span>
                      Job Description
                    </h2>
                    <div class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                      <p v-if="job.jobDescription" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {{ job.jobDescription }}
                      </p>
                      <p v-else class="text-gray-400 italic">No job description available</p>
                    </div>
                  </div>

                  <!-- Requirements & Skills -->
                  <div v-if="job.requirements || jobKeywords.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-if="job.requirements">
                      <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">checklist</span>
                        Requirements
                      </h3>
                      <div class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ job.requirements }}</p>
                      </div>
                    </div>

                    <div v-if="jobKeywords.length > 0">
                      <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span class="material-symbols-outlined text-lg">lightbulb</span>
                        Key Skills & Keywords
                      </h3>
                      <div class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                        <div class="flex flex-wrap gap-2">
                          <span v-for="keyword in jobKeywords" :key="keyword"
                            class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {{ keyword }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Application Notes -->
                  <div v-if="job.notes">
                    <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg">note</span>
                      Application Notes
                    </h3>
                    <div class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ job.notes }}</p>
                    </div>
                  </div>

                  <!-- Contact Information -->
                  <div v-if="job.contactName || job.contactEmail || job.contactPhone">
                    <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span class="material-symbols-outlined text-lg">contact_mail</span>
                      Contact Information
                    </h3>
                    <div class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                      <div class="space-y-2 text-sm">
                        <p v-if="job.contactName" class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-gray-500">person</span>
                          <span class="text-gray-700 dark:text-gray-300">{{ job.contactName }}</span>
                        </p>
                        <p v-if="job.contactEmail" class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-gray-500">email</span>
                          <a :href="`mailto:${job.contactEmail}`" class="text-primary hover:underline">{{ job.contactEmail }}</a>
                        </p>
                        <p v-if="job.contactPhone" class="flex items-center gap-2">
                          <span class="material-symbols-outlined text-sm text-gray-500">phone</span>
                          <a :href="`tel:${job.contactPhone}`" class="text-primary hover:underline">{{ job.contactPhone }}</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex items-center justify-center h-64">
                  <div class="text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">work_off</span>
                    <p class="text-gray-400">No job details available</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Editor Section (Split View) -->
            <div v-if="activeSection === 'editor'" class="flex gap-6 overflow-hidden">
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
                    <div v-if="displaySections && displaySections.length > 0" class="space-y-6">
                      <div v-for="(section, idx) in displaySections" :key="idx" class="mb-6">
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

            <!-- Suggestions Section -->
            <div v-if="activeSection === 'suggestions'" class="bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col overflow-hidden">
              <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 class="text-sm font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">lightbulb</span>
                  AI Suggestions
                </h3>
                <span class="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-800 rounded uppercase">AI Powered</span>
              </div>
              <div class="p-6 overflow-y-auto">
                <!-- Generate Suggestions Button -->
                <div v-if="!job || !resume" class="text-center py-12">
                  <span class="material-symbols-outlined text-6xl text-gray-300 mb-4">lightbulb</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Suggestions</h3>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">Link a resume to this job application to get personalized AI recommendations.</p>
                </div>

                <div v-else-if="suggestions.length === 0 && !isGeneratingSuggestions" class="text-center py-12">
                  <span class="material-symbols-outlined text-6xl text-blue-300 mb-4">auto_awesome</span>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready for AI Analysis</h3>
                  <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Get personalized recommendations to improve your resume match for this job.</p>
                  <button @click="handleGenerateSuggestions"
                    class="flex items-center gap-2 rounded-lg h-10 px-6 bg-primary text-white text-sm font-semibold mx-auto hover:bg-primary/90 transition-colors">
                    <span class="material-symbols-outlined text-sm">auto_awesome</span>
                    Generate Suggestions
                  </button>
                </div>

                <!-- Loading State -->
                <div v-else-if="isGeneratingSuggestions" class="text-center py-12">
                  <div class="animate-spin mb-4"><span class="material-symbols-outlined text-6xl text-blue-400">auto_awesome</span></div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzing Your Resume</h3>
                  <p class="text-gray-500 dark:text-gray-400 text-sm">AI is generating personalized suggestions...</p>
                </div>

                <!-- Suggestions List -->
                <div v-else-if="suggestions.length > 0" class="space-y-4">
                  <!-- Success Feedback -->
                  <div v-if="lastAppliedSuggestion" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 animate-fade-in">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-green-500">check_circle</span>
                      <div>
                        <h4 class="text-sm font-medium text-green-900 dark:text-green-100">Suggestion Applied!</h4>
                        <p class="text-xs text-green-700 dark:text-green-300">
                          "{{ lastAppliedSuggestion.category }}" improvement has been applied to your resume.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Recommendations</h3>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Personalized suggestions to improve your resume match
                        <span v-if="appliedSuggestions.length > 0" class="text-green-600 dark:text-green-400 font-medium">
                          • {{ appliedSuggestions.length }} applied
                        </span>
                      </p>
                    </div>
                    <button @click="handleGenerateSuggestions"
                      :disabled="isGeneratingSuggestions"
                      class="flex items-center gap-2 rounded-lg h-8 px-3 bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                      <span class="material-symbols-outlined text-sm">refresh</span>
                      {{ isGeneratingSuggestions ? 'Analyzing...' : 'Refresh' }}
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div v-for="suggestion in suggestions" :key="suggestion.id"
                      class="bg-gradient-to-r from-gray-50 to-white dark:from-background-dark/50 dark:to-background-dark/30 rounded-lg p-4 border border-gray-200 dark:border-white/10 hover:border-primary/30 transition-colors">
                      <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 mt-1">
                          <span :class="['material-symbols-outlined text-sm', getSuggestionIconClass(suggestion.type)]">
                            {{ getSuggestionIcon(suggestion.type) }}
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-2">
                            <span :class="['inline-flex items-center px-2 py-1 rounded-md text-xs font-medium', getSuggestionTypeClass(suggestion.type)]">
                              {{ getSuggestionCategoryLabel(suggestion.category) }}
                            </span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">AI Recommendation</span>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ suggestion.text }}</p>
                          <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center gap-2">
                              <button @click="applySuggestion(suggestion)"
                                class="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                                <span class="material-symbols-outlined text-sm">check_circle</span>
                                Apply Suggestion
                              </button>
                              <button @click="dismissSuggestion(suggestion)"
                                class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors">
                                <span class="material-symbols-outlined text-sm">close</span>
                                Dismiss
                              </button>
                            </div>
                            <div v-if="suggestion.applied" class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                              <span class="material-symbols-outlined text-sm">check_circle</span>
                              Applied
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-blue-500 mt-0.5">lightbulb</span>
                      <div>
                        <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">How to Use These Suggestions</h4>
                        <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Click "Apply Suggestion" to mark recommendations as implemented, or switch to the Editor tab to manually incorporate changes.
                          Each suggestion is tailored to improve your ATS score and job match potential.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ATS Analysis Section -->
            <div v-if="activeSection === 'analysis'" class="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
              <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div class="lg:col-span-1 flex flex-col items-center justify-center border-r border-[#e7ebf3] dark:border-white/10 pr-6">
                  <div class="relative size-32 flex items-center justify-center">
                    <svg class="size-full" viewBox="0 0 100 100">
                      <circle class="text-gray-100 dark:text-white/5" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" stroke-width="8"></circle>
                      <circle class="text-success" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" :stroke-dasharray="264" :stroke-dashoffset="264 - (atsScorePercent ? atsScorePercent * 2.64 : 0)" stroke-linecap="round" stroke-width="8"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="text-3xl font-bold text-success">{{ atsScorePercent || '--' }}%</span>
                      <span class="text-[10px] uppercase font-bold text-[#4d6599]">Match Score</span>
                    </div>
                  </div>
                </div>
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8 pl-2">
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Skill Relevance</span>
                      <span class="text-sm font-bold">{{ atsSkillRelevance || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-primary" :style="{ width: (atsSkillRelevance || 0) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Strong overlap in core competencies</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Format Score</span>
                      <span class="text-sm font-bold">{{ atsFormatScore || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-warning" :style="{ width: (atsFormatScore || 0) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Minor adjustments needed in layout</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Keyword Density</span>
                      <span class="text-sm font-bold">{{ atsKeywordDensity || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-danger" :style="{ width: (atsKeywordDensity || 0) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Lacking critical technical terms</p>
                  </div>
                </div>
              </div>
              <div class="flex flex-col bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">compare_arrows</span>
                    Keyword Match Matrix
                  </h3>
                  <div class="flex gap-4">
                    <div class="flex items-center gap-2">
                      <div class="size-2 rounded-full bg-success"></div>
                      <span class="text-[10px] font-medium">Matched</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="size-2 rounded-full bg-danger"></div>
                      <span class="text-[10px] font-medium">Missing</span>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-2">
                  <div class="border-r border-[#e7ebf3] dark:border-white/10">
                    <div class="px-6 py-3 border-b border-[#e7ebf3] dark:border-white/10 bg-gray-50/30 dark:bg-transparent">
                      <span class="text-xs font-bold uppercase tracking-wider text-[#4d6599]">Required Keywords (Job Description)</span>
                    </div>
                    <div class="p-6 space-y-4">
                      <div v-for="keyword in atsJobKeywords" :key="keyword" class="flex items-center justify-between p-3 rounded-lg border" :class="atsMatchedKeywords.includes(keyword) ? 'border-success/20 bg-success/5' : 'border-danger/20 bg-danger/5'">
                        <span class="text-sm font-medium">{{ keyword }}</span>
                        <span class="material-symbols-outlined" :class="atsMatchedKeywords.includes(keyword) ? 'text-success' : 'text-danger'">{{ atsMatchedKeywords.includes(keyword) ? 'check_circle' : 'cancel' }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="px-6 py-3 border-b border-[#e7ebf3] dark:border-white/10 bg-gray-50/30 dark:bg-transparent">
                      <span class="text-xs font-bold uppercase tracking-wider text-[#4d6599]">Your Resume Presence</span>
                    </div>
                    <div class="p-6 space-y-4">
                      <div v-for="keyword in atsJobKeywords" :key="keyword + '-presence'" class="flex items-center justify-between p-3">
                        <span class="text-sm" v-if="atsMatchedKeywords.includes(keyword)">Found in <span class="font-bold">Experience, Skills</span></span>
                        <span class="text-sm text-danger italic" v-else>Not found in any section</span>
                        <span class="text-xs font-bold" :class="atsMatchedKeywords.includes(keyword) ? 'text-success' : 'text-danger'">{{ atsMatchedKeywords.includes(keyword) ? '1 Occurrence' : '0 Occurrences' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2 bg-danger/10 text-danger rounded-lg">
                    <span class="material-symbols-outlined">report</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Missing Critical Keywords</h3>
                    <p class="text-sm text-[#4d6599]">These keywords have a high weighting in the JD and are missing from your resume.</p>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div v-for="keyword in atsMissedKeywords" :key="keyword + '-missed'" class="p-4 rounded-xl border border-dashed border-[#e7ebf3] dark:border-white/10 flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer group">
                    <div class="flex flex-col">
                      <span class="text-sm font-bold group-hover:text-primary transition-colors">{{ keyword }}</span>
                      <span class="text-[10px] text-[#4d6599]">Weight: Medium</span>
                    </div>
                    <button class="flex items-center gap-1 text-[10px] font-bold text-primary px-3 py-1.5 bg-primary/5 rounded-full">
                      <span class="material-symbols-outlined text-sm">add</span>
                      Auto-insert
                    </button>
                  </div>
                </div>
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
    <!-- Link Resume Modal -->
    <div v-if="showLinkResumeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-background-dark rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-bold">Link Existing Resume</h3>
            <button @click="closeLinkResumeModal" class="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div v-if="isLoadingResumes" class="flex items-center justify-center py-8">
            <div class="animate-spin"><span class="material-symbols-outlined text-2xl">hourglass_empty</span></div>
            <span class="ml-2">Loading your resumes...</span>
          </div>

          <div v-else-if="userResumes.length === 0" class="text-center py-8">
            <span class="material-symbols-outlined text-4xl text-gray-400 mb-4">description</span>
            <p class="text-gray-600 dark:text-gray-400 mb-4">You don't have any resumes yet.</p>
            <button @click="closeLinkResumeModal" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              Create Your First Resume
            </button>
          </div>

          <div v-else class="space-y-3 max-h-96 overflow-y-auto">
            <div v-for="userResume in userResumes" :key="userResume.id"
              @click="selectResume(userResume.id)"
              class="p-4 border border-gray-200 dark:border-white/10 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white">{{ userResume.title }}</h4>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Updated {{ new Date(userResume.updatedAt).toLocaleDateString() }}
                  </p>
                </div>
                <span class="material-symbols-outlined text-primary">chevron_right</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeLinkResumeModal"
              class="flex-1 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">
              Cancel
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

// UI state for feedback
const appliedSuggestions = ref([]);
const lastAppliedSuggestion = ref(null);
const showGenerationModal = ref(false);

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
  displaySections,
  generationSettings,
  userResumes,
  isLoadingResumes,
  showLinkResumeModal,

  // ATS Analysis
  atsMatchedKeywords,
  atsMissedKeywords,
  atsJobKeywords,
  atsSkillRelevance,
  atsFormatScore,
  atsKeywordDensity,

  // AI Suggestions
  suggestions,
  isGeneratingSuggestions,

  loadApplication,
  generateTailoredResume,
  improveSection,
  updateResume,
  switchSection,
  loadUserResumes,
  linkResumeToApplication,
  generateSuggestions
} = useTailoringStudioController(applicationId);

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

const handleLinkResumeClick = async () => {
  await loadUserResumes();
  showLinkResumeModal.value = true;
};

const closeLinkResumeModal = () => {
  showLinkResumeModal.value = false;
};

const selectResume = async (resumeId) => {
  try {
    await linkResumeToApplication(resumeId);
    showLinkResumeModal.value = false;
  } catch (err) {
    console.error('Failed to link resume:', err);
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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// AI Suggestions Methods
const handleGenerateSuggestions = async () => {
  try {
    await generateSuggestions();
  } catch (err) {
    console.error('Failed to generate suggestions:', err);
  }
};

const getSuggestionIcon = (type) => {
  switch (type) {
    case 'keywords': return 'label';
    case 'experience': return 'work';
    case 'summary': return 'description';
    case 'education': return 'school';
    default: return 'lightbulb';
  }
};

const getSuggestionIconClass = (type) => {
  switch (type) {
    case 'keywords': return 'text-blue-500';
    case 'experience': return 'text-green-500';
    case 'summary': return 'text-purple-500';
    case 'education': return 'text-orange-500';
    default: return 'text-yellow-500';
  }
};

const getSuggestionTypeClass = (type) => {
  switch (type) {
    case 'keywords': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'experience': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'summary': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'education': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getSuggestionTypeLabel = (type) => {
  switch (type) {
    case 'keywords': return 'Keywords';
    case 'experience': return 'Experience';
    case 'summary': return 'Summary';
    case 'education': return 'Education';
    default: return 'General';
  }
};

const getSuggestionCategoryLabel = (category) => {
  switch (category) {
    case 'keywords': return 'Keywords';
    case 'summary': return 'Summary';
    case 'experience': return 'Experience';
    case 'skills': return 'Skills';
    case 'education': return 'Education';
    case 'quantify': return 'Quantify';
    case 'ats': return 'ATS';
    case 'impact': return 'Impact';
    default: return 'General';
  }
};

const applySuggestion = async (suggestion) => {
  if (!resume.value) {
    console.error('No resume available to apply suggestion');
    return;
  }

  try {
    // Mark suggestion as applied
    suggestion.applied = true;
    appliedSuggestions.value.push(suggestion);
    lastAppliedSuggestion.value = suggestion;

    // Parse and apply the suggestion based on category
    switch (suggestion.category.toLowerCase()) {
      case 'keywords':
        await applyKeywordSuggestion(suggestion);
        break;
      case 'skills':
        await applySkillsSuggestion(suggestion);
        break;
      case 'summary':
        await applySummarySuggestion(suggestion);
        break;
      case 'experience':
        await applyExperienceSuggestion(suggestion);
        break;
      case 'quantify':
        await applyQuantifySuggestion(suggestion);
        break;
      case 'impact':
        await applyImpactSuggestion(suggestion);
        break;
      default:
        // For other suggestions, just mark as applied and show a message
        console.log('Applied suggestion:', suggestion.text);
        break;
    }

    // Auto-clear feedback after 3 seconds
    setTimeout(() => {
      if (lastAppliedSuggestion.value === suggestion) {
        lastAppliedSuggestion.value = null;
      }
    }, 3000);

  } catch (error) {
    console.error('Failed to apply suggestion:', error);
    suggestion.applied = false; // Reset if application failed
    appliedSuggestions.value = appliedSuggestions.value.filter(s => s.id !== suggestion.id);
  }
};

const applyKeywordSuggestion = async (suggestion) => {
  // Extract keywords from the suggestion text
  const keywordMatches = suggestion.text.match(/(?:add|include|incorporate|use)\s+(?:these\s+)?keywords?:?\s*([^.!?]+)|[""]([^""]+)[""]/gi);
  const keywords = [];

  if (keywordMatches) {
    keywordMatches.forEach(match => {
      const extracted = match.replace(/(?:add|include|incorporate|use)\s+(?:these\s+)?keywords?:?\s*/i, '').replace(/[""]/g, '');
      keywords.push(...extracted.split(',').map(k => k.trim()).filter(k => k.length > 0));
    });
  }

  if (keywords.length > 0) {
    // Add keywords to the skills section
    const skillsSection = resume.value.sections.skills || [];
    const newSkills = [...new Set([...skillsSection, ...keywords])]; // Remove duplicates

    await updateResume({
      id: resume.value.id,
      sections: {
        ...resume.value.sections,
        skills: newSkills
      }
    });

    console.log('Added keywords to skills:', keywords);
  }
};

const applySkillsSuggestion = async (suggestion) => {
  // Extract skills from the suggestion text
  const skillMatches = suggestion.text.match(/(?:add|include|highlight|emphasize)\s+(?:these\s+)?skills?:?\s*([^.!?]+)|[""]([^""]+)[""]/gi);
  const skills = [];

  if (skillMatches) {
    skillMatches.forEach(match => {
      const extracted = match.replace(/(?:add|include|highlight|emphasize)\s+(?:these\s+)?skills?:?\s*/i, '').replace(/[""]/g, '');
      skills.push(...extracted.split(',').map(s => s.trim()).filter(s => s.length > 0));
    });
  }

  if (skills.length > 0) {
    const skillsSection = resume.value.sections.skills || [];
    const newSkills = [...new Set([...skillsSection, ...skills])];

    await updateResume({
      id: resume.value.id,
      sections: {
        ...resume.value.sections,
        skills: newSkills
      }
    });

    console.log('Added skills:', skills);
  }
};

const applySummarySuggestion = async (suggestion) => {
  // For summary suggestions, we'll create an improved version
  // This is more complex, so for now we'll just mark it as applied
  // In a full implementation, this would use AI to generate an improved summary
  console.log('Summary improvement suggestion applied:', suggestion.text);

  // TODO: Implement AI-powered summary improvement
  // const improvedSummary = await improveSection('summary', suggestion.text);
  // await updateResume({
  //   sections: {
  //     ...resume.value.sections,
  //     summary: improvedSummary
  //   }
  // });
};

const applyExperienceSuggestion = async (suggestion) => {
  // For experience suggestions, mark as applied
  // Full implementation would require more sophisticated parsing
  console.log('Experience improvement suggestion applied:', suggestion.text);

  // TODO: Implement experience section improvements
  // This could involve:
  // - Adding quantifiable achievements
  // - Improving action verbs
  // - Better formatting
};

const applyQuantifySuggestion = async (suggestion) => {
  // For quantification suggestions, mark as applied
  console.log('Quantification suggestion applied:', suggestion.text);

  // TODO: Implement automatic quantification of achievements
  // This would analyze experience descriptions and add metrics
};

const applyImpactSuggestion = async (suggestion) => {
  // For impact suggestions, mark as applied
  console.log('Impact improvement suggestion applied:', suggestion.text);

  // TODO: Implement impact enhancement
  // This could involve strengthening action verbs and achievements
};

const dismissSuggestion = (suggestion) => {
  // Remove the suggestion from the list
  const index = suggestions.value.findIndex(s => s.id === suggestion.id);
  if (index > -1) {
    suggestions.value.splice(index, 1);
  }
};
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  vertical-align: middle;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>