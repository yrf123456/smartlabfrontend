<template>
  <div class="space-y-6">
    <nav class="flex items-center space-x-2 text-sm text-gray-500">
      <router-link to="/labs" class="hover:text-primary-500">Laboratories</router-link>
      <ChevronRight class="w-4 h-4" />
      <router-link 
        v-if="!isCreateMode && lab" 
        :to="`/labs/${$route.params.labId}`" 
        class="hover:text-primary-500"
      >
        {{ lab.name || 'Details' }}
      </router-link>
      <ChevronRight v-if="!isCreateMode && lab" class="w-4 h-4" />
      <span class="text-gray-900">{{ isCreateMode ? 'Create' : 'Edit' }}</span>
    </nav>

    <div class="bg-white rounded-2xl border border-gray-200">
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-gray-900">{{ isCreateMode ? 'Create Laboratory' : 'Edit Laboratory' }}</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading laboratory data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="p-6 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Laboratory</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="$router.push('/labs')"
          class="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
        >
          Back to Labs
        </button>
      </div>

      <!-- Form -->
      <LabForm
        v-else
        :lab="lab ?? undefined"
        @submit="handleSubmit"
        @cancel="$router.back()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { useLabStore } from '@/stores/lab'
import LabForm from '@/components/lab/LabForm.vue'
import type { Lab } from '@/types'

const route = useRoute()
const router = useRouter()
const labStore = useLabStore()

const lab = ref<Lab | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const isCreateMode = computed(() => route.params.labId === 'new')

const fetchLab = async () => {
  // If creating new lab, no need to fetch
  if (isCreateMode.value) {
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const labId = route.params.labId as string
    console.log('Lab ID from route:', labId) // Debug log
    
    if (!labId || labId === 'new') {
      console.log('Skipping fetch - create mode or invalid ID')
      return
    }
    
    lab.value = await labStore.fetchLabById(labId)
  } catch (err: any) {
    console.error('Failed to fetch lab:', err)
    error.value = err.message || 'Failed to load laboratory data'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (labData: Omit<Lab, 'id'>) => {
  try {
    if (isCreateMode.value) {
      // Create new lab
      await labStore.createLab(labData)
      router.push('/labs')
    } else {
      // Update existing lab
      const labId = route.params.labId as string
      await labStore.updateLab(labId, labData)
      router.push(`/labs/${labId}`)
    }
  } catch (error) {
    console.error('Save failed:', error)
    // Here you could show a toast notification or error message
  }
}

onMounted(() => {
  console.log('Route params on mount:', route.params) // Debug log
  console.log('Is create mode:', isCreateMode.value) // Debug log
  fetchLab()
})

// Watch for route changes
watch(() => route.params.labId, (newLabId, oldLabId) => {
  console.log('Route param changed:', oldLabId, '->', newLabId)
  if (newLabId !== oldLabId) {
    // Reset state
    lab.value = null
    error.value = null
    fetchLab()
  }
}, { immediate: false })
</script>