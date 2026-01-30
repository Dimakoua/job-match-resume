<script setup>
import { ref, reactive } from 'vue'

// State management
const form = reactive({
  email: '',
  password: ''
})

const isPasswordVisible = ref(false)

const handleLogin = () => {
  console.log('Logging in with:', form.email, form.password)
  // Add your authentication logic here
}

const togglePassword = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <div class="bg-[#f8fafc] dark:bg-background min-h-screen flex flex-col font-sans">
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 py-3 bg-white dark:bg-card">
      <div class="flex items-center gap-4 text-primary">
        <div class="size-8">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="text-primary">
            <path clip-rule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fill-rule="evenodd"></path>
          </svg>
        </div>
        <h2 class="text-foreground text-lg font-bold leading-tight tracking-[-0.015em]">AI Resume Builder</h2>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground hidden sm:block">Need help?</span>
        <router-link 
          to="/signup"
          class="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-primary-foreground text-sm font-bold"
        >
          Sign up
        </router-link>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-[440px] bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div class="p-8 sm:p-10 flex flex-col items-center">
          <div class="mb-6 p-3 bg-primary/10 rounded-full">
            <span class="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
          </div>

          <h1 class="text-foreground tracking-light text-[32px] font-bold leading-tight text-center pb-2">Welcome back</h1>
          <p class="text-muted-foreground text-base font-normal leading-normal pb-8 text-center">Log in to your account to continue</p>

          <form @submit.prevent="handleLogin" class="w-full space-y-5">
            <div class="flex flex-col w-full">
              <label class="flex flex-col w-full">
                <span class="text-foreground text-sm font-semibold leading-normal pb-2">Email Address</span>
                <input 
                  v-model="form.email"
                  class="form-input flex w-full rounded-lg text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-input bg-white dark:bg-transparent focus:border-primary h-12 placeholder:text-muted-foreground p-[15px] text-base font-normal" 
                  placeholder="Enter your email" 
                  type="email" 
                  required
                />
              </label>
            </div>

            <div class="flex flex-col w-full">
              <div class="flex justify-between items-end pb-2">
                <span class="text-foreground text-sm font-semibold leading-normal">Password</span>
                <router-link to="/forgot-password" class="text-sm font-medium text-primary hover:underline">Forgot password?</router-link>
              </div>
              <div class="flex w-full items-stretch rounded-lg">
                <input 
                  v-model="form.password"
                  class="form-input flex w-full min-w-0 flex-1 rounded-lg rounded-r-none text-foreground focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-input bg-white dark:bg-transparent focus:border-primary h-12 placeholder:text-muted-foreground p-[15px] border-r-0 pr-2 text-base font-normal" 
                  placeholder="Enter your password" 
                  :type="isPasswordVisible ? 'text' : 'password'"
                  required
                />
                <button 
                  type="button"
                  @click="togglePassword"
                  class="text-muted-foreground flex border border-input bg-white dark:bg-transparent items-center justify-center px-3 rounded-r-lg border-l-0"
                >
                  <span class="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary">
                    {{ isPasswordVisible ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <button class="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 rounded-lg transition-colors flex items-center justify-center gap-2" type="submit">
              Log In
            </button>

            <div class="relative py-4">
              <div aria-hidden="true" class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-border"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white dark:bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <button class="w-full flex items-center justify-center gap-3 bg-white dark:bg-secondary border border-border h-12 rounded-lg hover:bg-secondary transition-colors" type="button">
              <img alt="Google" class="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"/>
              <span class="text-foreground font-semibold text-sm">Continue with Google</span>
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-sm text-muted-foreground">
              Don't have an account? 
              <router-link to="/signup" class="text-primary font-bold hover:underline">Sign up</router-link>
            </p>
          </div>
        </div>
        <div class="h-1 bg-primary"></div>
      </div>
    </main>

    <footer class="py-6 text-center text-xs text-muted-foreground">
      <p>© 2024 AI Resume Builder. All rights reserved.</p>
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