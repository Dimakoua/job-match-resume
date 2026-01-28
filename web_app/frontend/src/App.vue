<script setup>
import { ref } from 'vue'

const message = ref('Welcome to AI Resume Builder')
</script>

<template>
  <div class="app">
    <h1>{{ message }}</h1>
  </div>
</template>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
}
</style>