<script setup>
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <router-link to="/" class="flex items-center gap-3 text-foreground">
        <div class="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_privacy)">
              <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_privacy"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-tight">AI Resume Builder</h2>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="flex-1 py-12 px-6">
      <div class="max-w-[800px] mx-auto bg-white dark:bg-card rounded-xl shadow-sm border border-border p-8 md:p-12">
        <h1 class="text-foreground text-4xl font-bold leading-tight mb-8">Privacy Policy</h1>
        <p class="text-muted-foreground text-sm mb-6">Last updated: January 2026</p>

        <div class="space-y-8 text-foreground">
          <section>
            <h2 class="text-2xl font-bold mb-4">1. Introduction</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              AI Resume Builder ("we" or "us" or "our") operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">2. Information Collection and Use</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 class="text-xl font-semibold mb-3 text-foreground">Types of Data Collected:</h3>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li><strong class="text-foreground">Personal Data:</strong> Email address, name, phone number, address, cookies and usage data</li>
              <li><strong class="text-foreground">Usage Data:</strong> Information about how you use our website, including the types of content you interact with, the search queries you submit, and how you interact with other users</li>
              <li><strong class="text-foreground">Device Information:</strong> Browser type, IP address, pages visited, and the time and date of your visit</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">3. Use of Data</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              AI Resume Builder uses the collected data for various purposes:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">4. Security of Data</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">5. Changes to This Privacy Policy</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">6. Contact Us</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us by email at support@airesumenbuilder.com
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">7. Your Rights</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul class="text-muted-foreground space-y-2 ml-6 list-disc">
              <li>Access your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold mb-4">8. Cookies</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Our Service uses cookies to enhance your experience. You have the choice to either accept or refuse these cookies. However, if you refuse the cookies, you may not be able to use some portions of our Service.
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
</style>
