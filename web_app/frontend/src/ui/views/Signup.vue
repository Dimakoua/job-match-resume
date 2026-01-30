<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  agreeToTerms: false
})

const isPasswordVisible = ref(false)

const handleSignup = () => {
  console.log('Signing up with:', form)
  // Add your registration logic here
}

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <!-- Top Navigation Bar -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <div class="flex items-center gap-3 text-foreground">
        <div class="size-8 text-primary">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_signup)">
              <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
            </g>
            <defs>
              <clipPath id="clip0_signup"><rect fill="white" height="48" width="48"></rect></clipPath>
            </defs>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-tight">AI Resume Builder</h2>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground hidden sm:inline">Already have an account?</span>
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
        <!-- Headline and Body Text -->
        <div class="mb-8">
          <h1 class="text-foreground tracking-tight text-3xl font-bold leading-tight text-center pb-2">Create your account</h1>
          <p class="text-muted-foreground text-base font-normal leading-normal text-center">Start building your professional resume in minutes.</p>
        </div>

        <!-- Social Sign-Up Button -->
        <div class="mb-6">
          <button 
            type="button"
            class="w-full flex cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-white dark:bg-secondary border border-border text-foreground gap-3 text-base font-semibold leading-normal hover:bg-secondary transition-colors"
          >
            <img 
              alt="Google Logo" 
              class="w-5 h-5" 
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            />
            <span>Sign up with Google</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative mb-6">
          <div aria-hidden="true" class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-card text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <!-- Sign-Up Form -->
        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-foreground mb-1" for="full-name">Full Name</label>
            <input 
              v-model="form.fullName"
              class="w-full rounded-lg border border-input bg-white dark:bg-transparent text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-0 h-11 px-3 placeholder:text-muted-foreground" 
              id="full-name" 
              placeholder="John Doe" 
              type="text"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-foreground mb-1" for="email">Email address</label>
            <input 
              v-model="form.email"
              class="w-full rounded-lg border border-input bg-white dark:bg-transparent text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-0 h-11 px-3 placeholder:text-muted-foreground" 
              id="email" 
              placeholder="name@company.com" 
              type="email"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-foreground mb-1" for="password">Password</label>
            <div class="relative">
              <input 
                v-model="form.password"
                class="w-full rounded-lg border border-input bg-white dark:bg-transparent text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-0 h-11 px-3 pr-10 placeholder:text-muted-foreground" 
                id="password" 
                placeholder="••••••••" 
                :type="isPasswordVisible ? 'text' : 'password'"
                required
              />
              <button 
                type="button"
                @click="togglePassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <span class="material-symbols-outlined text-xl">
                  {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
          </div>

          <div class="flex items-start gap-3 py-2">
            <div class="flex h-5 items-center">
              <input 
                v-model="form.agreeToTerms"
                class="h-4 w-4 rounded border-input text-primary focus:ring-primary" 
                id="terms" 
                name="terms" 
                type="checkbox"
                required
              />
            </div>
            <div class="text-sm">
              <label class="text-muted-foreground" for="terms">
                I agree to the 
                <router-link to="/terms" class="font-medium text-primary hover:underline">Terms of Service</router-link> 
                and 
                <router-link to="/privacy" class="font-medium text-primary hover:underline">Privacy Policy</router-link>
              </label>
            </div>
          </div>

          <!-- Primary Action Button -->
          <button 
            type="submit"
            class="w-full flex items-center justify-center rounded-lg h-12 px-5 bg-primary text-primary-foreground text-base font-bold leading-normal transition-all hover:bg-primary/90 shadow-sm"
          >
            Create Account
          </button>
        </form>

        <!-- Footer Navigation -->
        <div class="mt-8 text-center border-t border-border pt-6">
          <p class="text-muted-foreground text-sm">
            Already have an account? 
            <router-link to="/login" class="text-primary font-bold hover:underline">Log in</router-link>
          </p>
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