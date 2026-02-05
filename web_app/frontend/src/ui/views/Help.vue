<script setup>
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <router-link to="/" class="flex items-center gap-3 text-foreground">
        <div class="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_help)">
              <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_help"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-tight">AI Resume Builder</h2>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-1 py-12 px-6">
      <div class="max-w-[800px] mx-auto bg-white dark:bg-card rounded-xl shadow-sm border border-border p-8 md:p-12">
        <h1 class="text-foreground text-4xl font-bold leading-tight mb-8">Help Center</h1>
        <p class="text-muted-foreground text-sm mb-6">Last updated: February 2026</p>

        <div class="space-y-8 text-foreground">
          <section>
            <h2 class="text-2xl font-bold mb-4">Getting Started</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Welcome to AI Resume Builder! Our platform helps you create professional resumes with the power of AI. Follow these steps to get started:
            </p>
            <ol class="text-muted-foreground space-y-2 ml-6 list-decimal">
              <li><strong class="text-foreground">Sign Up:</strong> Create your account using email or Google OAuth</li>
              <li><strong class="text-foreground">Create Your First Resume:</strong> Use our AI Generator or start from scratch in the Builder</li>
              <li><strong class="text-foreground">Customize:</strong> Edit sections, choose templates, and use AI improvements</li>
              <li><strong class="text-foreground">Export:</strong> Download your resume as PDF or DOCX</li>
            </ol>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Using the Resume Builder</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The Builder provides a split-screen interface for creating your resume:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Left Panel:</strong> Form inputs for your information</li>
              <li><strong class="text-foreground">Right Panel:</strong> Live preview of your resume</li>
              <li><strong class="text-foreground">AI Magic Wand:</strong> Click the wand icon next to text fields to improve content</li>
              <li><strong class="text-foreground">Template Switcher:</strong> Change resume layouts from the sidebar</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">AI Features</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Leverage AI to enhance your resume:
            </p>
            <h3 class="text-xl font-semibold mb-3 text-foreground">AI Generator:</h3>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Paste a job description and let AI create a tailored resume structure for you.
            </p>
            <h3 class="text-xl font-semibold mb-3 text-foreground">AI Improver:</h3>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Improve individual sections with AI suggestions for better wording and impact.
            </p>
            <h3 class="text-xl font-semibold mb-3 text-foreground">ATS Scoring:</h3>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Get a score showing how well your resume matches job requirements.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Job Application Tracking</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Organize your job search with our dashboard:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Job Lists:</strong> Create lists to organize your job search</li>
              <li><strong class="text-foreground">Saved Jobs:</strong> Save job postings and track their status</li>
              <li><strong class="text-foreground">Tailored Resumes:</strong> Link specific resume versions to applications</li>
              <li><strong class="text-foreground">Status Tracking:</strong> Monitor application progress</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Troubleshooting</h2>
            <h3 class="text-xl font-semibold mb-3 text-foreground">Common Issues:</h3>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Preview Not Updating:</strong> Ensure all required fields are filled</li>
              <li><strong class="text-foreground">AI Not Working:</strong> Check your internet connection and try again</li>
              <li><strong class="text-foreground">Export Failed:</strong> Try a different browser or clear cache</li>
              <li><strong class="text-foreground">Login Issues:</strong> Clear browser cookies or try incognito mode</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Templates and Customization</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Choose from multiple professional templates:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Modern:</strong> Clean, contemporary design</li>
              <li><strong class="text-foreground">Classic:</strong> Traditional resume format</li>
              <li><strong class="text-foreground">Creative:</strong> Unique layouts for creative fields</li>
              <li><strong class="text-foreground">Minimal:</strong> Simple, text-focused design</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">Contact Support</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Need more help? Our support team is here for you:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Email:</strong> support@airesumebuilder.com</li>
              <li><strong class="text-foreground">Response Time:</strong> We aim to respond within 24 hours</li>
              <li><strong class="text-foreground">Priority Support:</strong> Premium users get faster responses</li>
            </ul>
          </section>
        </div>

        <div class="mt-12 pt-8 border-t border-border">
          <router-link to="/login" class="inline-flex items-center gap-2 text-primary font-medium hover:underline">
            <span class="material-symbols-outlined text-lg">arrow_back</span>
            Back to Login
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>