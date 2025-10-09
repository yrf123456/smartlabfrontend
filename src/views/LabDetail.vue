<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center space-x-2 text-sm text-gray-500">
      <router-link to="/labs" class="hover:text-primary-500">Laboratories</router-link>
      <span>></span>
      <span class="text-gray-900">{{ labName || 'Detail Page' }}</span>
    </nav>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-center py-20">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div class="icon icon-labs text-red-400 icon-xl"></div>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Laboratory Not Found</h3>
      <p class="text-gray-500 mb-6">{{ error }}</p>
      <button
        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        @click="$router.push('/labs')"
      >
        Back to Laboratory List
      </button>
    </div>

    <!-- Success state with basic lab info -->
    <div v-else-if="lab" class="space-y-6">
      <!-- Basic lab info card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ lab.name }}</h1>
            <div class="flex items-center text-gray-600 mb-4">
              <div class="icon icon-key text-gray-400 mr-2"></div>
              <span>{{ lab.location }}</span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p class="text-sm text-gray-500">Capacity</p>
                <p class="text-lg font-semibold text-gray-900">{{ lab.capacity }} people</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Status</p>
                <span 
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(lab.status)"
                >
                  {{ getStatusText(lab.status) }}
                </span>
              </div>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-2">Tags</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in lab.tags"
                  :key="tag"
                  class="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-if="lab.desc" class="mb-4">
              <p class="text-sm text-gray-500 mb-2">Description</p>
              <p class="text-gray-700">{{ lab.desc }}</p>
            </div>

            <div class="mb-4">
              <p class="text-sm text-gray-500 mb-2">Opening Hours</p>
              <p class="text-gray-700">{{ lab.openHours }}</p>
            </div>
          </div>

          <div class="ml-6 flex flex-col space-y-2">
            
            <button
              v-if="canEdit"
              class="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              @click="$router.push(`/labs/${lab.id}/edit`)"
            >
              Edit Laboratory
            </button>
          </div>
        </div>
      </div>

      <!-- Managers info -->
      <div v-if="lab.managers && lab.managers.length > 0" class="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Managers</h3>
        <div class="space-y-3">
          <div
            v-for="manager in lab.managers"
            :key="manager.id"
            class="flex items-center space-x-3"
          >
            <img
              :src="manager.avatarUrl"
              :alt="manager.name"
              class="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p class="font-medium text-gray-900">{{ manager.name }}</p>
              <p class="text-sm text-gray-500">{{ manager.email }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Development notice -->
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import type { Lab } from '@/types'

const route = useRoute()
const authStore = useAuthStore()

const lab = ref<Lab | null>(null)
const loading = ref(true)
const error = ref('')

const labName = computed(() => lab.value?.name)

const canEdit = computed(() => {
  return authStore.hasRole('SYS_ADMIN') || authStore.hasRole('DEPT_ADMIN')
})

const getStatusClass = (status: Lab['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'full':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: Lab['status']) => {
  switch (status) {
    case 'available':
      return 'Available'
    case 'maintenance':
      return 'Under Maintenance'
    case 'full':
      return 'Full'
    default:
      return 'Unknown'
  }
}

const handleBooking = () => {
  // Navigate to booking page (under development)
  alert('Booking functionality is under development!')
}

const fetchLab = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const labId = route.params.labId as string
    console.log('📡 Fetching lab ID:', labId)
    
    const response = await api.labs.getById(labId)
    lab.value = response.data
    
    console.log('✅ Lab loaded:', lab.value.name)
  } catch (err: any) {
    console.error('❌ Failed to load lab:', err)
    error.value = 'Unable to load laboratory information. Please check if the laboratory ID is correct.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('🏢 Lab Detail page: Loading lab ID:', route.params.labId)
  fetchLab()
})
</script>