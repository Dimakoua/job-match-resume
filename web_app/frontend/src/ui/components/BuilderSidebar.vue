<template>
  <aside class="w-16 border-r border-[#e7ebf3] dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col items-center py-6 gap-6">
    <button 
      v-for="item in menuItems" 
      :key="item.id"
      @click="$emit('select', item.id)"
      :class="[
        'p-2 rounded-lg transition-all',
        activeTab === item.id 
          ? 'bg-primary/10 text-primary' 
          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
      ]"
      :title="item.label"
    >
      <svg v-if="item.icon === 'edit'" xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <svg v-else-if="item.icon === 'sections'" xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      <svg v-else-if="item.icon === 'layout'" xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
      <svg v-else-if="item.icon === 'style'" xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"/>
        <line x1="9" y1="20" x2="15" y2="20"/>
        <line x1="12" y1="4" x2="12" y2="20"/>
      </svg>
    </button>
    
    <button 
      @click="$emit('select', 'history')"
      :class="[
        'mt-auto p-2 rounded-lg transition-all',
        activeTab === 'history' 
          ? 'bg-primary/10 text-primary' 
          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
      ]"
      title="History"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3v5h5"/>
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
        <path d="M12 7v5l4 2"/>
      </svg>
    </button>
  </aside>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    default: 'edit'
  }
})

defineEmits(['select'])

const menuItems = [
  { id: 'edit', icon: 'edit', label: 'Edit Content' },
  { id: 'sections', icon: 'sections', label: 'Manage Sections' },
  { id: 'layout', icon: 'layout', label: 'Layout' },
  { id: 'style', icon: 'style', label: 'Typography & Style' },
]
</script>
