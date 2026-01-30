<script setup>
import { ref } from 'vue'

const email = ref('')
const isSubmitted = ref(false)

const handleSubmit = () => {
  console.log('Password reset requested for:', email.value)
  isSubmitted.value = true
  // Add your password reset logic here
}
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <router-link to="/" class="flex items-center gap-3 text-foreground">
        <div class="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_forgot)">
              <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_forgot"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-tight">AI Resume Builder</h2>
      </router-link>
      <div class="flex items-center gap-4">
        <router-link 
          to="/login"
          class="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-primary-foreground text-sm font-bold leading-normal transition-colors hover:bg-primary/90"
        >
          Log in
        </router-link>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-[440px] bg-white dark:bg-card shadow-xl rounded-xl border border-border p-8">
        <!-- Success State -->
        <div v-if="isSubmitted" class="text-center">
          <div class="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-full inline-flex">
            <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">mark_email_read</span>
          </div>
          <h1 class="text-foreground tracking-tight text-2xl font-bold leading-tight text-center pb-2">Check your email</h1>
          <p class="text-muted-foreground text-base font-normal leading-normal text-center mb-6">
            We've sent a password reset link to <strong class="text-foreground">{{ email }}</strong>
          </p>
          <router-link 
            to="/login"
            class="inline-flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-primary-foreground text-base font-bold leading-normal transition-all hover:bg-primary/90"
          >
            Back to Login
          </router-link>
        </div>

        <!-- Form State -->
        <div v-else>
          <div class="mb-8 text-center">
            <div class="mb-4 p-3 bg-primary/10 rounded-full inline-flex">
              <span class="material-symbols-outlined text-primary text-3xl">lock_reset</span>
            </div>
            <h1 class="text-foreground tracking-tight text-2xl font-bold leading-tight text-center pb-2">Forgot your password?</h1>
            <p class="text-muted-foreground text-base font-normal leading-normal text-center">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-1" for="email">Email address</label>
              <input 
                v-model="email"
                class="w-full rounded-lg border border-input bg-white dark:bg-transparent text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-0 h-11 px-3 placeholder:text-muted-foreground" 
                id="email" 
                placeholder="name@company.com" 
                type="email"
                required
              />
            </div>

            <button 
              type="submit"
              class="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary text-primary-foreground text-base font-bold leading-normal transition-all hover:bg-primary/90 shadow-sm"
            >
              Send Reset Link
            </button>
          </form>

          <div class="mt-8 text-center">
            <router-link to="/login" class="text-primary font-medium hover:underline inline-flex items-center gap-1">
              <span class="material-symbols-outlined text-lg">arrow_back</span>
              Back to Login
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="p-6 text-center text-xs text-muted-foreground">
      © 2024 AI Resume Builder. All rights reserved.
      <div class="flex justify-center gap-4 mt-2">
        <router-link to="/terms" class="hover:text-primary">Terms of Service</router-link>
        <router-link to="/privacy" class="hover:text-primary">Privacy Policy</router-link>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>