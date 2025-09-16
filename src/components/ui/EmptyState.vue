<template>
  <div class="text-center py-12">
    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <component 
        :is="icon" 
        class="w-10 h-10 text-gray-400"
      />
    </div>
    
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {{ title }}
    </h3>
    
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      {{ description }}
    </p>
    
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

interface Props {
  title: string
  description: string
  icon?: any
}

const props = withDefaults(defineProps<Props>(), {
  icon: Inbox
})
</script>