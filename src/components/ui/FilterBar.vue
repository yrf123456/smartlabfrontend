<template>
  <div class="bg-white rounded-2xl p-6 border border-gray-200">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Keyword search -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('common.search') }}
        </label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            :value="keyword"
            type="text"
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="搜索关键词..."
            @input="$emit('update:keyword', ($event.target as HTMLInputElement).value)"
            @keyup.enter="$emit('search')"
          />
        </div>
      </div>

      <!-- Tags filter -->
      <div v-if="availableTags.length > 0">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          标签筛选
        </label>
        <select
          :value="tags[0] || ''"
          class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @change="handleTagChange($event)"
        >
          <option value="">全部标签</option>
          <option v-for="tag in availableTags" :key="tag" :value="tag">
            {{ tag }}
          </option>
        </select>
      </div>

      <!-- Status filter -->
      <div v-if="statusOptions.length > 0">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          状态筛选
        </label>
        <select
          :value="status"
          class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Actions -->
      <div class="flex items-end space-x-3">
        <button
          class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="$emit('search')"
        >
          {{ $t('common.search') }}
        </button>
        <button
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          @click="handleClear"
        >
          {{ $t('common.clear') }}
        </button>
      </div>
    </div>

    <!-- Active filters -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center space-x-2 flex-wrap">
        <span class="text-sm text-gray-500">已选筛选条件：</span>
        
        <span
          v-if="keyword"
          class="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-md"
        >
          关键词: {{ keyword }}
          <button
            class="ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-primary-200"
            @click="$emit('update:keyword', '')"
          >
            <X class="w-2 h-2" />
          </button>
        </span>

        <span
          v-for="tag in tags"
          :key="tag"
          class="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-md"
        >
          标签: {{ tag }}
          <button
            class="ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-primary-200"
            @click="handleRemoveTag(tag)"
          >
            <X class="w-2 h-2" />
          </button>
        </span>

        <span
          v-if="status"
          class="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-md"
        >
          状态: {{ getStatusLabel(status) }}
          <button
            class="ml-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-primary-200"
            @click="$emit('update:status', '')"
          >
            <X class="w-2 h-2" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  keyword: string
  tags: string[]
  status: string
  availableTags?: string[]
  statusOptions?: Array<{ value: string; label: string }>
}

interface Emits {
  (e: 'update:keyword', value: string): void
  (e: 'update:tags', value: string[]): void
  (e: 'update:status', value: string): void
  (e: 'search'): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  availableTags: () => [],
  statusOptions: () => []
})

const emit = defineEmits<Emits>()

const hasActiveFilters = computed(() => {
  return props.keyword || props.tags.length > 0 || props.status
})

const handleTagChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  if (value && !props.tags.includes(value)) {
    emit('update:tags', [value])
  } else if (!value) {
    emit('update:tags', [])
  }
}

const handleRemoveTag = (tag: string) => {
  const newTags = props.tags.filter(t => t !== tag)
  emit('update:tags', newTags)
}

const handleClear = () => {
  emit('update:keyword', '')
  emit('update:tags', [])
  emit('update:status', '')
  emit('clear')
}

const getStatusLabel = (status: string) => {
  const option = props.statusOptions.find(opt => opt.value === status)
  return option?.label || status
}
</script>