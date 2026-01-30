<template>
  <footer class="p-6 text-center text-xs text-muted-foreground">
    <p>© 2024 AI Resume Builder. All rights reserved.</p>
    <div class="flex justify-center gap-4 mt-2">
      <router-link to="/terms" class="hover:text-primary">Terms of Service</router-link>
      <router-link to="/privacy" class="hover:text-primary">Privacy Policy</router-link>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
footer {
  border-top: 1px solid var(--color-border);
}
</style>
