<template>
  <footer class="px-6 lg:px-40 py-8 border-t border-[#e7ebf3] dark:border-[#2d364f] text-[#4d6599] dark:text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#111621]">
    <p>© {{ currentYear }} AI Resume Builder. All rights reserved.</p>
    <div class="flex gap-6">
      <router-link to="/privacy" class="hover:text-primary transition-colors">Privacy Policy</router-link>
      <router-link to="/terms" class="hover:text-primary transition-colors">Terms of Service</router-link>
      <router-link to="/help" class="hover:text-primary transition-colors">Help Center</router-link>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
