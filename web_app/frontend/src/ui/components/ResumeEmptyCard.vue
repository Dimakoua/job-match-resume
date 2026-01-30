<template>
  <div class="flex flex-col group cursor-pointer h-full" @click="$emit('create')">
    <div class="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#d0d7e7] dark:border-[#2d364f] bg-white/50 dark:bg-[#1a202c]/50 px-6 py-20 hover:border-primary hover:bg-white dark:hover:bg-[#1a202c] transition-all aspect-[3/4]">
      <div class="bg-primary/10 p-4 rounded-full text-primary group-hover:scale-110 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div class="flex flex-col items-center gap-1 text-center">
        <p class="text-[#0e121b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Start from Scratch</p>
        <p class="text-[#4d6599] dark:text-gray-400 text-sm font-normal leading-normal max-w-[200px]">Begin with a blank canvas and build your own layout.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['create'])
</script>
