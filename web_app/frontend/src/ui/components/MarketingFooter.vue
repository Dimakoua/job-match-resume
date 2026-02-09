<template>
  <footer class="py-12 bg-white border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="size-6 bg-slate-900 rounded flex items-center justify-center text-white">
              <span class="material-symbols-outlined text-sm">auto_fix_high</span>
            </div>
            <span class="text-lg font-extrabold tracking-tight">AI Resume Builder</span>
          </div>
          <p class="text-slate-500 text-xs leading-relaxed mb-6">Empowering job seekers with professional AI tools to navigate their career journey with confidence.</p>
        </div>
        <div>
          <h5 class="font-bold mb-4 text-slate-900 text-sm">Product</h5>
          <ul class="space-y-3 text-xs text-slate-500">
            <li><router-link to="/builder" class="hover:text-primary">Resume Builder</router-link></li>
            <li><router-link to="/saved-jobs" class="hover:text-primary">Job Tracker</router-link></li>
            <li><router-link to="/generator" class="hover:text-primary">ATS Scanner</router-link></li>
          </ul>
        </div>
        <div>
          <h5 class="font-bold mb-4 text-slate-900 text-sm">Resources</h5>
          <ul class="space-y-3 text-xs text-slate-500">
            <li><a class="hover:text-primary" href="#">Career Blog</a></li>
            <li><a class="hover:text-primary" href="#">Templates</a></li>
            <li><router-link to="/help" class="hover:text-primary">Help Center</router-link></li>
          </ul>
        </div>
        <div>
          <h5 class="font-bold mb-4 text-slate-900 text-sm">Legal</h5>
          <ul class="space-y-3 text-xs text-slate-500">
            <li><router-link to="/privacy" class="hover:text-primary">Privacy Policy</router-link></li>
            <li><router-link to="/terms" class="hover:text-primary">Terms of Service</router-link></li>
            <li><router-link to="/contact" class="hover:text-primary">Contact Us</router-link></li>
          </ul>
        </div>
      </div>
      <div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-[10px] text-slate-400">© {{ new Date().getFullYear() }} AI Resume Builder. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-2 text-[10px] text-slate-400"><span class="size-1.5 rounded-full bg-emerald-500"></span> Systems Operational</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'MarketingFooter'
}
</script>

<style scoped>
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>