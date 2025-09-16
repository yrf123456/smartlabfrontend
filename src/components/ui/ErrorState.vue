<template>
  <div class="text-center py-12">
    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle class="w-10 h-10 text-red-500" />
    </div>
    
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {{ title }}
    </h3>
    
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      {{ message }}
    </p>
    
    <button
      class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
      @click="$emit('retry')"
    >
      <RefreshCw class="w-4 h-4 inline mr-2" />
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

interface Props {
  title?: string
  message: string
}

interface Emits {
  (e: 'retry'): void
}

withDefaults(defineProps<Props>(), {
  title: '加载失败'
})

defineEmits<Emits>()
</script>