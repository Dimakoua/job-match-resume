<template>
  <div class="scrolling-text-container" :title="text">
    <span class="scrolling-text" :style="{ animationDuration: duration + 's' }">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speed: {
    type: Number,
    default: 25 // characters per second approx
  }
});

const duration = computed(() => {
  return Math.max(5, props.text.length / props.speed);
});
</script>

<style scoped>
.scrolling-text-container {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  max-width: 100%;
}

.scrolling-text {
  display: inline-block;
  animation: scroll linear infinite;
}

@keyframes scroll {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>