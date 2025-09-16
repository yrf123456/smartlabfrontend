<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-sm transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
        
        <div v-if="trend !== undefined" class="flex items-center mt-2">
          <component 
            :is="trend >= 0 ? TrendingUp : TrendingDown" 
            class="w-4 h-4 mr-1"
            :class="trend >= 0 ? 'text-green-500' : 'text-red-500'"
          />
          <span 
            class="text-sm font-medium"
            :class="trend >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ Math.abs(trend) }}%
          </span>
          <span v-if="hint" class="text-sm text-gray-500 ml-1">{{ hint }}</span>
        </div>
      </div>
      
      <div v-if="icon" class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
        <component :is="getIcon(icon)" class="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Monitor, 
  AlertTriangle,
  Activity
} from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  trend?: number
  hint?: string
  icon?: string
}

defineProps<Props>()

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    Calendar,
    Monitor,
    AlertTriangle,
    TrendingUp: Activity
  }
  return icons[iconName] || Activity
}
</script>