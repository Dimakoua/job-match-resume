<script setup>
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <router-link to="/" class="flex items-center gap-3 text-foreground">
        <div class="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_terms)">
              <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_terms"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-tight">AI Resume Builder</h2>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-1 py-12 px-6">
      <div class="max-w-[800px] mx-auto bg-white dark:bg-card rounded-xl shadow-sm border border-border p-8 md:p-12">
        <h1 class="text-foreground text-4xl font-bold leading-tight mb-8">Terms of Service</h1>
        <p class="text-muted-foreground text-sm mb-6">Last updated: January 2026</p>

        <div class="space-y-8 text-foreground prose dark:prose-invert max-w-none">
          <section>
            <h2 class="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              By accessing and using the AI Resume Builder service, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">2. Use License</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on the AI Resume Builder website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the website</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or 'mirroring' the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The materials on the AI Resume Builder website are provided on an 'as is' basis. The AI Resume Builder makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">4. Limitations</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              In no event shall the AI Resume Builder or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the AI Resume Builder website.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The materials appearing on the AI Resume Builder website could include technical, typographical, or photographic errors. The AI Resume Builder does not warrant that any of the materials on the website are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">6. Links</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The AI Resume Builder has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by the AI Resume Builder of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">7. Modifications</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The AI Resume Builder may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">8. Governing Law</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which the service is provided, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
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
    <footer class="p-6 text-center text-xs text-muted-foreground">
      © 2024 AI Resume Builder. All rights reserved.
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.prose {
  color: inherit;
}

.prose h2 {
  color: inherit;
}

.prose p {
  color: inherit;
}

.prose ul {
  color: inherit;
}
</style>
