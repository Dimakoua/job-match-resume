<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold tracking-tight">Typography & Style</h2>
      <p class="text-sm text-gray-500 mt-1">Customize the global look and feel of your resume.</p>
    </div>

    <!-- Font Families -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"/>
          <line x1="9" y1="20" x2="15" y2="20"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
        <h3 class="text-lg font-bold">Font Families</h3>
      </div>
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Heading Font</label>
          <div class="relative">
            <select 
              v-model="localStyle.headingFont"
              class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm appearance-none cursor-pointer"
            >
              <option value="inter">Inter (Sans-Serif)</option>
              <option value="playfair">Playfair Display (Serif)</option>
              <option value="roboto">Roboto (Sans-Serif)</option>
              <option value="lora">Lora (Serif)</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Body Font</label>
          <div class="relative">
            <select 
              v-model="localStyle.bodyFont"
              class="w-full rounded-lg border-[#d0d7e7] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-primary focus:ring-1 focus:ring-primary p-3 text-sm appearance-none cursor-pointer"
            >
              <option value="inter">Inter (Sans-Serif)</option>
              <option value="lora">Lora (Serif)</option>
              <option value="open-sans">Open Sans (Sans-Serif)</option>
              <option value="roboto-mono">Roboto Mono (Monospace)</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="size-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Typography Scale -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <h3 class="text-lg font-bold">Typography Scale</h3>
      </div>
      <div class="space-y-8">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Base Font Size</label>
            <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ localStyle.fontSize }}pt</span>
          </div>
          <input 
            v-model.number="localStyle.fontSize"
            type="range" 
            min="8" 
            max="14" 
            step="0.5"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-[10px] text-gray-400 px-1">
            <span>Small</span>
            <span>Default</span>
            <span>Large</span>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Line Height</label>
            <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{{ localStyle.lineHeight }}</span>
          </div>
          <input 
            v-model.number="localStyle.lineHeight"
            type="range" 
            min="1.2" 
            max="2" 
            step="0.1"
            class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div class="flex justify-between text-[10px] text-gray-400 px-1">
            <span>Tight</span>
            <span>Normal</span>
            <span>Loose</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Accent Color -->
    <section class="mb-10">
      <div class="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="13.5" cy="6.5" r=".5"/>
          <circle cx="17.5" cy="10.5" r=".5"/>
          <circle cx="8.5" cy="7.5" r=".5"/>
          <circle cx="6.5" cy="12.5" r=".5"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
        </svg>
        <h3 class="text-lg font-bold">Accent Color</h3>
      </div>
      <div class="grid grid-cols-6 gap-3">
        <button 
          v-for="color in colors" 
          :key="color.value"
          @click="selectColor(color.value)"
          :class="[
            'size-10 rounded-full border-2 border-white shadow-sm transition-all',
            localStyle.accentColor === color.value ? 'ring-2 ring-offset-2' : 'hover:ring-2 hover:ring-offset-1'
          ]"
          :style="{ backgroundColor: color.value, '--tw-ring-color': color.value }"
          :title="color.name"
        ></button>
      </div>
      <div class="mt-6 flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-dashed border-[#d0d7e7] dark:border-gray-700">
        <span class="text-xs font-medium text-gray-500">Custom Hex Code</span>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400">#</span>
          <input 
            v-model="customHex"
            @blur="applyCustomColor"
            class="w-20 bg-transparent border-none p-0 text-xs font-mono focus:ring-0 uppercase" 
            type="text" 
            maxlength="6"
          />
        </div>
      </div>
    </section>

    <!-- AI Recommendation -->
    <div class="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
      <div class="flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <div>
          <p class="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider mb-1">AI Recommendation</p>
          <p class="text-sm text-violet-900 dark:text-violet-200 leading-relaxed">Based on your role, a clean Sans-Serif font with 1.4 line height is recommended for maximum readability by ATS systems.</p>
          <button @click="applyAIStyle" class="mt-3 text-xs font-bold text-violet-600 hover:underline">Apply AI Style</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  style: {
    type: Object,
    default: () => ({
      headingFont: 'inter',
      bodyFont: 'inter',
      fontSize: 11,
      lineHeight: 1.5,
      accentColor: '#2463eb'
    })
  }
})

const emit = defineEmits(['update:style'])

const localStyle = ref({ ...props.style })
const customHex = ref(props.style.accentColor?.replace('#', '') || '2463eb')

// Watch for parent prop changes and update local state
watch(() => props.style, (newVal) => {
  // Use deep comparison to avoid circular updates when parent re-renders 
  // with the same data we just emitted
  if (JSON.stringify(newVal) !== JSON.stringify(localStyle.value)) {
    localStyle.value = { ...newVal }
    customHex.value = newVal.accentColor?.replace('#', '') || '2463eb'
  }
}, { deep: true })

// Emit changes when local state changes
watch(localStyle, (newVal) => {
  emit('update:style', { ...newVal })
}, { deep: true })

const colors = [
  { name: 'Blue', value: '#2463eb' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Slate', value: '#0f172a' },
]

const selectColor = (color) => {
  localStyle.value.accentColor = color
  customHex.value = color.replace('#', '')
}

const applyCustomColor = () => {
  if (/^[0-9A-Fa-f]{6}$/.test(customHex.value)) {
    localStyle.value.accentColor = `#${customHex.value}`
  }
}

const applyAIStyle = () => {
  localStyle.value = {
    headingFont: 'inter',
    bodyFont: 'inter',
    fontSize: 11,
    lineHeight: 1.4,
    accentColor: '#2463eb'
  }
  customHex.value = '2463eb'
}
</script>
