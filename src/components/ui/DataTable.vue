<template>
  <div class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :style="{ width: column.width }"
            >
              <div class="flex items-center space-x-1">
                <span>{{ column.title }}</span>
                <button
                  v-if="column.sortable"
                  class="p-1 hover:bg-gray-200 rounded"
                  @click="handleSort(column.key)"
                >
                  <ChevronUp 
                    v-if="sortBy === column.key && sortOrder === 'asc'"
                    class="w-3 h-3"
                  />
                  <ChevronDown 
                    v-else-if="sortBy === column.key && sortOrder === 'desc'"
                    class="w-3 h-3"
                  />
                  <ChevronsUpDown 
                    v-else
                    class="w-3 h-3 text-gray-400"
                  />
                </button>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Loading rows -->
          <tr v-if="loading" v-for="i in 5" :key="`loading-${i}`">
            <td v-for="column in columns" :key="column.key" class="px-6 py-4">
              <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
            </td>
          </tr>
          
          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, index) in sortedData"
            :key="getRowKey(row, index)"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="$emit('row-click', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
            >
              <slot
                v-if="column.slot"
                :name="column.slot"
                :row="row"
                :column="column"
                :index="index"
              >
                {{ getCellValue(row, column.key) }}
              </slot>
              
              <span v-else class="text-sm text-gray-900">
                {{ getCellValue(row, column.key) }}
              </span>
            </td>
          </tr>
          
          <!-- Empty state -->
          <tr v-if="!loading && sortedData.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <div class="text-gray-500">
                <Inbox class="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>暂无数据</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div
      v-if="pagination && !loading && sortedData.length > 0"
      class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between"
    >
      <div class="text-sm text-gray-500">
        显示 {{ (pagination.page - 1) * pagination.size + 1 }} 到 
        {{ Math.min(pagination.page * pagination.size, pagination.total) }} 
        条，共 {{ pagination.total }} 条
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="pagination.page <= 1"
          @click="$emit('page-change', pagination.page - 1)"
        >
          上一页
        </button>
        
        <span class="px-3 py-1 text-sm">
          第 {{ pagination.page }} 页
        </span>
        
        <button
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="pagination.page >= Math.ceil(pagination.total / pagination.size)"
          @click="$emit('page-change', pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-vue-next'

interface Column {
  key: string
  title: string
  width?: string
  sortable?: boolean
  slot?: string
}

interface Pagination {
  page: number
  size: number
  total: number
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  pagination?: Pagination
  rowKey?: string
}

interface Emits {
  (e: 'row-click', row: any): void
  (e: 'page-change', page: number): void
  (e: 'sort-change', field: string, order: 'asc' | 'desc' | null): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: 'id'
})

const emit = defineEmits<Emits>()

const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc' | null>(null)

const sortedData = computed(() => {
  if (!sortBy.value || !sortOrder.value) {
    return props.data
  }
  
  return [...props.data].sort((a, b) => {
    const aValue = getCellValue(a, sortBy.value)
    const bValue = getCellValue(b, sortBy.value)
    
    if (aValue === bValue) return 0
    
    const result = aValue > bValue ? 1 : -1
    return sortOrder.value === 'asc' ? result : -result
  })
})

const getCellValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row) ?? ''
}

const getRowKey = (row: any, index: number) => {
  return getCellValue(row, props.rowKey) || index
}

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? null : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  
  if (!sortOrder.value) {
    sortBy.value = ''
  }
  
  emit('sort-change', sortBy.value, sortOrder.value)
}
</script>