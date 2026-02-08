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
                  <div v-if="atsScorePercent" :class="['h-full transition-all duration-500', getAtsScoreBgColor(atsScorePercent)]" :style="{ width: atsScorePercent + '%' }"></div>
                  <div v-else class="bg-gray-300 h-full w-1/3"></div>
                </div>
                <span v-if="atsScorePercent" :class="['text-lg font-bold', getAtsScoreTextColor(atsScorePercent)]">{{ atsScorePercent }}%</span>
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
            <button @click="switchSection('notes')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'notes' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl">note</span>
              <p class="text-sm font-medium">Notes</p>
            </button>
            <button @click="switchSection('analysis')"
              :class="['flex items-center gap-3 px-3 py-2 rounded-lg transition-colors', activeSection === 'analysis' ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10']">
              <span class="material-symbols-outlined text-xl">analytics</span>
              <p class="text-sm font-medium">ATS Analysis</p>
            </button>
          </div>
          <div class="mt-auto p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p class="text-xs font-bold text-primary uppercase mb-2">Pro Tip</p>
            <p class="text-xs leading-relaxed text-[#4d6599] dark:text-gray-300">{{ atsJobKeywords.slice(0, 3).join(', ') }} are key terms in this job. Highlight them to boost your ATS score.</p>
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
                <p class="text-xs text-[#4d6599] dark:text-gray-400">Current Stage: <div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="getStatusBadgeClass(job?.status)">
                  <select v-if="job" v-model="job.status" @change.stop="updateStatus(job)" @click.stop class="bg-transparent border-0 text-xs font-medium outline-none cursor-pointer appearance-none" :class="getStatusBadgeClass(job?.status)">
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <span v-else class="text-xs font-medium text-gray-400">Loading...</span>
                </div></p>
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
                  <button v-if="!isEditingJob" @click="startEditingJob"
                    class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  <div v-else class="flex items-center gap-2">
                    <button @click="cancelEditingJob"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <span class="material-symbols-outlined text-sm">close</span>
                      Cancel
                    </button>
                    <button @click="saveJobChanges"
                      class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                      <span class="material-symbols-outlined text-sm">save</span>
                      Save
                    </button>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase">Details</span>
                  <span v-if="atsJobKeywords.length > 0" class="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase">{{ atsJobKeywords.length }} Keywords</span>
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
                      <div class="flex-1">
                        <div v-if="!isEditingJob" class="mb-2">
                          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ job.position }}</h1>
                          <p class="text-lg text-gray-600 dark:text-gray-300">{{ job.company }}</p>
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
                    <div v-if="!isEditingJob" class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-4">
                      <p v-if="job.jobDescription" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed" v-html="highlightKeywords(job.jobDescription)"></p>
                      <p v-else class="text-gray-400 italic">No job description available</p>
                    </div>
                  </div>

                  <!-- Edit Form -->
                  <div v-if="isEditingJob">
                    <JobApplicationForm
                      :initial-data="editedJob"
                      :resumes="userResumes"
                      :loading="false"
                      submit-button-text="Save Changes"
                      @submit="handleJobFormSubmit"
                      @cancel="cancelEditingJob"
                    />
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
            <div v-if="activeSection === 'editor'" class="flex gap-6 overflow-y-auto">
              <!-- Left Side: Job Description -->
              <div class="flex-1 bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col">
                <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                  <h3 class="text-sm font-bold flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">description</span>
                    Job Description
                  </h3>
                  <span v-if="atsJobKeywords.length > 0" class="text-[10px] font-bold px-2 py-1 bg-yellow-100 text-yellow-800 rounded uppercase">{{ atsJobKeywords.length }} Keywords Found</span>
                </div>
                <div class="p-6 prose prose-sm dark:prose-invert max-w-none">
                  <p v-if="isLoadingJob" class="text-gray-400">Loading job description...</p>
                  <p v-else-if="job?.jobDescription" class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300" v-html="highlightKeywords(job.jobDescription)"></p>
                  <p v-else class="text-gray-400">No job description available</p>
                </div>
              </div>
              <!-- Right Side: Resume Editor -->
              <div class="flex-[2] bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col shadow-2xl">
                <div class="p-4 border-b border-[#e7ebf3] dark:border-white/10 flex justify-between items-center bg-white dark:bg-background-dark">
                  <div class="flex items-center gap-3">
                    <h3 class="text-sm font-bold flex items-center gap-2 text-primary">
                      <span class="material-symbols-outlined text-lg">edit_note</span>
                      Resume Editor
                    </h3>
                    <span v-if="resume?.title" class="text-[10px] text-[#4d6599] italic">{{ resume.title }}</span>
                  </div>
                  <button v-if="resume" @click="handleEditResume" class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-sm">edit</span>
                    Edit Resume
                  </button>
                </div>
                <div class="p-2 bg-gray-50 dark:bg-background-dark/30 flex-1">
                  <!-- Resume Content -->
                  <div v-if="isLoadingResume" class="flex items-center justify-center h-full">
                    <p class="text-gray-400">Loading resume...</p>
                  </div>
                  <div v-else-if="resume" class="h-full">
                    <ResumePreview
                      :resume="resumePreviewData"
                      :layout="{ template: 'classic', margins: 24, sectionSpacing: 16 }"
                      :style="{ 
                        headingFont: 'inter', 
                        bodyFont: 'inter', 
                        fontSize: 12, 
                        lineHeight: 1.4, 
                        accentColor: '#2463eb' 
                      }"
                      :sections="[]"
                      :keywordsToHighlight="atsJobKeywords"
                    />
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

            <!-- Notes Section -->
            <div v-if="activeSection === 'notes'" class="bg-white dark:bg-background-dark/50 border border-[#e7ebf3] dark:border-white/10 rounded-xl flex flex-col overflow-hidden">
              <div class="p-6 border-b border-[#e7ebf3] dark:border-white/10">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg font-bold flex items-center gap-2">
                      <span class="material-symbols-outlined text-xl">note</span>
                      Application Notes
                    </h3>
                    <p class="text-sm text-[#4d6599] dark:text-gray-400 mt-1">Keep track of interview details, follow-ups, and important information</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded uppercase">Notes</span>
                  </div>
                </div>
              </div>
              <div class="flex-1 p-6 overflow-y-auto">
                <div class="max-w-4xl">
                  <!-- Notes Header -->
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-md font-semibold text-gray-900 dark:text-white">Application Notes</h4>
                      <button v-if="!isEditingNotes" @click="startEditingNotes"
                        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                        <span class="material-symbols-outlined text-sm">{{ job?.notes ? 'edit' : 'add' }}</span>
                        {{ job?.notes ? 'Edit Notes' : 'Add Notes' }}
                      </button>
                    </div>
                  </div>

                  <!-- Notes Display -->
                  <div v-if="!isEditingNotes" class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-6 min-h-64">
                    <div v-if="job?.notes" class="prose prose-sm dark:prose-invert max-w-none">
                      <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{{ job.notes }}</p>
                    </div>
                    <div v-else class="text-center py-12">
                      <span class="material-symbols-outlined text-4xl text-gray-300 mb-4">note</span>
                      <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No Notes Yet</h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Add notes to keep track of interview details, follow-up actions, contact information, and other important information about this job application.
                      </p>
                      <button @click="startEditingNotes"
                        class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                        <span class="material-symbols-outlined text-sm">add</span>
                        Add Your First Note
                      </button>
                    </div>
                  </div>

                  <!-- Notes Editing -->
                  <div v-else class="bg-gray-50 dark:bg-background-dark/50 rounded-lg p-6">
                    <div class="mb-4">
                      <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">Application Notes</label>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Use this space to track interview details, follow-up actions, contact information, and any other relevant notes.</p>
                    </div>
                    <textarea
                      v-model="editedNotes"
                      placeholder="Example:
• Interview scheduled for [date/time]
• Contact: [name] - [email/phone]
• Key requirements discussed: [list]
• Follow-up needed: [action items]
• Personal notes: [additional thoughts]"
                      class="w-full min-h-80 p-4 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-white text-sm resize-vertical focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxlength="2000"
                    ></textarea>
                    <div class="flex items-center justify-between mt-4">
                      <div class="flex items-center gap-4">
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{ editedNotes.length }}/2000 characters</span>
                        <div class="flex items-center gap-1 text-xs text-gray-400">
                          <span class="material-symbols-outlined text-sm">info</span>
                          <span>Supports line breaks and formatting</span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button @click="cancelEditingNotes"
                          class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">
                          Cancel
                        </button>
                        <button @click="saveNotes"
                          class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                          <span class="material-symbols-outlined text-sm mr-1">save</span>
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Quick Tips -->
                  <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                      <span class="material-symbols-outlined text-blue-500 mt-0.5">lightbulb</span>
                      <div>
                        <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Tips for Better Note-Taking</h4>
                        <ul class="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                          <li>• Record interview dates, times, and interviewer names</li>
                          <li>• Note key requirements or skills discussed</li>
                          <li>• Track follow-up actions and deadlines</li>
                          <li>• Include contact information for future reference</li>
                          <li>• Add personal impressions or reminders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ATS Analysis Section -->
            <div v-if="activeSection === 'analysis'" class="flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6">
              <!-- Overall Score & Key Metrics -->
              <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div class="lg:col-span-1 flex flex-col items-center justify-center border-r border-[#e7ebf3] dark:border-white/10 pr-6">
                  <div class="relative size-32 flex items-center justify-center">
                    <svg class="size-full" viewBox="0 0 100 100">
                      <circle class="text-gray-100 dark:text-white/5" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" stroke-width="8"></circle>
                      <circle :class="getAtsScoreTextColor(atsScorePercent)" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" :stroke-dasharray="264" :stroke-dashoffset="264 - (atsScorePercent ? atsScorePercent * 2.64 : 0)" stroke-linecap="round" stroke-width="8"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span :class="['text-3xl font-bold', getAtsScoreTextColor(atsScorePercent)]">{{ atsScorePercent || '--' }}%</span>
                      <span class="text-[10px] uppercase font-bold text-[#4d6599]">Match Score</span>
                    </div>
                  </div>
                </div>
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 pl-2">
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Keyword Match</span>
                      <span class="text-sm font-bold">{{ atsSkillRelevance || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-primary" :style="{ width: (atsSkillRelevance || 0) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">{{ atsMetadata?.matchedCount || 0 }} of {{ atsMetadata?.totalKeywords || 0 }} keywords matched</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Resume Keywords</span>
                      <span class="text-sm font-bold">{{ atsResumeKeywords.length }}</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-blue-500" :style="{ width: Math.min((atsResumeKeywords.length / 50) * 100, 100) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Keywords found in your resume</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Job Keywords</span>
                      <span class="text-sm font-bold">{{ atsJobKeywords.length }}</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-green-500" :style="{ width: Math.min((atsJobKeywords.length / 20) * 100, 100) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Keywords required by job</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Format Score</span>
                      <span class="text-sm font-bold">{{ atsFormatScore || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-500" :style="{ width: (atsFormatScore || 0) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Resume formatting quality</p>
                  </div>
                  <div class="flex flex-col justify-center">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-[#4d6599]">Keyword Density</span>
                      <span class="text-sm font-bold">{{ atsKeywordDensity || '--' }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-purple-500" :style="{ width: Math.min((atsKeywordDensity || 0), 100) + '%' }"></div>
                    </div>
                    <p class="text-[10px] mt-2 text-[#4d6599]">Resume vs job keyword ratio</p>
                  </div>
                </div>
              </div>

              <!-- Document Statistics -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                      <span class="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold">Resume Analysis</h3>
                      <p class="text-sm text-[#4d6599] dark:text-gray-400">Content breakdown</p>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Total Length</span>
                      <span class="text-sm font-medium">{{ atsMetadata?.resumeLength || 0 }} characters</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Keywords Found</span>
                      <span class="text-sm font-medium">{{ atsResumeKeywords.length }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Match Rate</span>
                      <span class="text-sm font-medium">{{ atsMetadata?.matchRate ? Math.round(atsMetadata.matchRate * 100) : 0 }}%</span>
                    </div>
                  </div>
                </div>

                <div class="bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                      <span class="material-symbols-outlined">work</span>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold">Job Requirements</h3>
                      <p class="text-sm text-[#4d6599] dark:text-gray-400">What the job asks for</p>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Total Length</span>
                      <span class="text-sm font-medium">{{ atsMetadata?.jobDescriptionLength || 0 }} characters</span>
                    </div>
                    <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-white/5">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Keywords Required</span>
                      <span class="text-sm font-medium">{{ atsJobKeywords.length }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Critical Keywords</span>
                      <span class="text-sm font-medium">{{ atsMissedKeywords.length }} missing</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Resume Keywords Cloud -->
              <div class="bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                    <span class="material-symbols-outlined">tag</span>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold">Resume Keywords</h3>
                    <p class="text-sm text-[#4d6599] dark:text-gray-400">Keywords detected in your resume</p>
                  </div>
                </div>
                <div v-if="atsResumeKeywords.length > 0" class="flex flex-wrap gap-2">
                  <span v-for="keyword in atsResumeKeywords.slice(0, 50)" :key="keyword"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200">
                    {{ keyword }}
                  </span>
                  <span v-if="atsResumeKeywords.length > 50" class="text-xs text-gray-500 dark:text-gray-400 px-2">
                    +{{ atsResumeKeywords.length - 50 }} more
                  </span>
                </div>
                <div v-else class="text-center py-8 text-gray-400">
                  <p>No keywords detected in your resume</p>
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
                      <div class="size-2 rounded-full bg-green-500"></div>
                      <span class="text-[10px] font-medium">Matched</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="size-2 rounded-full bg-red-500"></div>
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
                      <div v-for="keyword in atsJobKeywords" :key="keyword" class="flex items-center justify-between p-3 rounded-lg border" :class="atsMatchedKeywords.includes(keyword) ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'">
                        <span class="text-sm font-medium" :class="atsMatchedKeywords.includes(keyword) ? 'text-green-600' : 'text-red-600'">{{ keyword }}</span>
                        <span class="material-symbols-outlined" :class="atsMatchedKeywords.includes(keyword) ? 'text-green-600' : 'text-red-600'">{{ atsMatchedKeywords.includes(keyword) ? 'check_circle' : 'cancel' }}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div class="px-6 py-3 border-b border-[#e7ebf3] dark:border-white/10 bg-gray-50/30 dark:bg-transparent">
                      <span class="text-xs font-bold uppercase tracking-wider text-[#4d6599]">Your Resume Presence</span>
                    </div>
                    <div class="p-6 space-y-4">
                      <div v-for="keyword in atsJobKeywords" :key="keyword + '-presence'" class="flex items-center justify-between p-3">
                        <span class="text-sm text-green-600" v-if="atsMatchedKeywords.includes(keyword)">Found in <span class="font-bold">Experience, Skills</span></span>
                        <span class="text-sm text-red-600 italic" v-else>Not found in any section</span>
                        <span class="text-xs font-bold" :class="atsMatchedKeywords.includes(keyword) ? 'text-green-600' : 'text-red-600'">{{ atsMatchedKeywords.includes(keyword) ? '1 Occurrence' : '0 Occurrences' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-white dark:bg-background-dark border border-[#e7ebf3] dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-6">
                  <div class="p-2 bg-red-100 text-red-600 rounded-lg">
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
                    <button @click="handleAutoInsert(keyword)" class="flex items-center gap-1 text-[10px] font-bold text-primary px-3 py-1.5 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors">
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
            <!-- Resume Selection -->
            <div>
              <label class="block text-sm font-medium mb-3">Base Resume</label>
              <div v-if="userResumes.length === 0" class="p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg">
                <p class="text-sm text-gray-600 dark:text-gray-400">You need to create a resume first before generating a tailored version.</p>
              </div>
              <select v-else v-model="selectedResumeId" class="w-full p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-background-dark text-gray-900 dark:text-white">
                <option v-for="userResume in userResumes" :key="userResume.id" :value="userResume.id">
                  {{ userResume.title }}
                </option>
              </select>
              <p v-if="userResumes.length > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">Select the resume to tailor for this job application</p>
            </div>

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
              :disabled="isGenerating || !selectedResumeId"
              class="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isGenerating" class="flex items-center justify-center gap-2">
                <div class="animate-spin"><span class="material-symbols-outlined text-sm">hourglass_empty</span></div>
                Generating...
              </span>
              <span v-else>Generate Tailored Resume</span>
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
import { useRoute, useRouter } from 'vue-router';
import { useTailoringStudioController } from '../composables/useTailoringStudioController.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import AppHeader from '../components/AppHeader.vue';
import AppFooter from '../components/AppFooter.vue';
import JobApplicationForm from '../components/JobApplicationForm.vue';
import ResumePreview from '../components/ResumePreview.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Use the controller composable
const {
  job,
  resume,
  isLoadingJob,
  isLoadingResume,
  isCalculatingAts,
  isGenerating,
  activeSection,
  atsScorePercent,
  resumePreviewData,
  generationSettings,
  userResumes,
  isLoadingResumes,
  showLinkResumeModal,
  isEditingNotes,
  editedNotes,

  // ATS Analysis
  atsMatchedKeywords,
  atsMissedKeywords,
  atsJobKeywords,
  atsResumeKeywords,
  atsMetadata,
  atsSkillRelevance,
  atsFormatScore,
  atsKeywordDensity,

  // AI Suggestions
  suggestions,
  isGeneratingSuggestions,

  // UI state for feedback
  appliedSuggestions,
  lastAppliedSuggestion,
  showGenerationModal,
  selectedResumeId,

  // Job editing state
  isEditingJob,
  editedJob,

  loadApplication,
  switchSection,
  updateApplicationStatus,


  // UI Methods
  handleGenerateClick,
  closeGenerationModal,
  startGeneration,
  handleLinkResumeClick,
  closeLinkResumeModal,
  selectResume,
  getStatusBadgeClass,
  formatDate,
  handleGenerateSuggestions,
  getSuggestionIcon,
  getSuggestionIconClass,
  getSuggestionTypeClass,
  getSuggestionCategoryLabel,
  applySuggestion,
  dismissSuggestion,
  getAtsScoreTextColor,
  getAtsScoreBgColor,

  // Job Editing Methods
  startEditingJob,
  cancelEditingJob,
  handleJobFormSubmit,

  //Notes
  startEditingNotes,
  cancelEditingNotes,
  saveNotes
} = useTailoringStudioController();

const handleEditResume = () => {
  if (resume.value?.id) {
    router.push(`/builder?id=${resume.value.id}`);
  }
};

const updateStatus = async (job) => {
  try {
    await updateApplicationStatus(job.id, job.status, job);
  } catch (error) {
    console.error('Failed to update status:', error);
  }
};

const highlightKeywords = (text) => {
  if (!text || !atsJobKeywords.value?.length) return text;
  
  let highlightedText = text;
  atsJobKeywords.value.forEach(keyword => {
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-200 dark:bg-yellow-800/30 px-1 rounded font-semibold">$1</span>');
  });
  
  return highlightedText;
};

onMounted(async () => {
  await loadApplication();
});
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