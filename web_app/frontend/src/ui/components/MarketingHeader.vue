<template>
  <nav class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-xl">auto_fix_high</span>
        </div>
        <span class="text-xl font-extrabold tracking-tight">AI Resume Builder</span>
      </div>
      <div class="hidden md:flex items-center gap-8">
        <router-link to="/#features" class="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</router-link>
        <router-link to="/#how-it-works" class="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How It Works</router-link>
        <router-link to="/#job-tracker" class="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Job Tracker</router-link>
      </div>
      <div class="flex items-center gap-4">
        <button @click="$router.push('/login')" class="text-sm font-semibold text-slate-700 hover:text-primary">Log in</button>
        <button @click="$router.push('/signup')" class="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-blue-200">
          Start Building for Free
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'MarketingHeader'
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>