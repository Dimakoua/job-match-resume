<script setup>
import { ref } from 'vue'

const message = ref('Welcome to AI Resume Builder')
</script>

<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
    <div class="bg-white dark:bg-background-dark p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 class="text-3xl font-bold text-primary mb-4">{{ message }}</h1>
      <p class="text-gray-600 dark:text-gray-300">Tailwind CSS is working with custom colors!</p>
      <button class="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Test Button
      </button>
    </div>
  </div>
</template>