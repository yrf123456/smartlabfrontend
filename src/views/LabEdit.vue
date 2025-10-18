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
          <AlertCircle class="w-12 h-12 mx-auto mb-2" />
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

      <!-- Permission Denied State -->
      <div v-else-if="!hasRequiredPermission" class="p-6 text-center">
        <div class="text-yellow-500 mb-4">
          <Shield class="w-12 h-12 mx-auto mb-2" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Permission Denied</h3>
        <p class="text-gray-600 mb-2">
          You do not have permission to {{ isCreateMode ? 'create' : 'edit' }} laboratories.
        </p>
        <p class="text-sm text-gray-500 mb-4">
          Required permission: {{ isCreateMode ? 'LAB_CREATE' : 'LAB_EDIT' }}
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Please contact your administrator if you believe this is an error.
        </p>
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
import { ChevronRight, AlertCircle, Shield } from 'lucide-vue-next'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import LabForm from '@/components/lab/LabForm.vue'
import type { Lab } from '@/types'

const route = useRoute()
const router = useRouter()
const labStore = useLabStore()
const authStore = useAuthStore()

const lab = ref<Lab | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const isCreateMode = computed(() => route.params.labId === 'new')

// Permission-based access control
const canCreate = computed(() => authStore.hasPermission('LAB_CREATE'))
const canEdit = computed(() => authStore.hasPermission('LAB_EDIT'))

const hasRequiredPermission = computed(() => {
  if (isCreateMode.value) {
    return canCreate.value
  }
  return canEdit.value
})

const fetchLab = async () => {
  // If creating new lab, no need to fetch
  if (isCreateMode.value) {
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const labId = route.params.labId as string
    console.log('📡 Fetching lab ID:', labId)
    
    if (!labId || labId === 'new') {
      console.log('⭐️ Skipping fetch - create mode or invalid ID')
      return
    }
    
    lab.value = await labStore.fetchLabById(labId)
    console.log('✅ Lab data loaded:', lab.value.name)
  } catch (err: any) {
    console.error('❌ Failed to fetch lab:', err)
    error.value = err.message || 'Failed to load laboratory data'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (labData: Omit<Lab, 'id'>) => {
  try {
    if (isCreateMode.value) {
      console.log('🆕 Creating new lab...')
      await labStore.createLab(labData)
      console.log('✅ Lab created successfully')
      router.push('/labs')
    } else {
      const labId = route.params.labId as string
      console.log('📝 Updating lab:', labId)
      await labStore.updateLab(labId, labData)
      console.log('✅ Lab updated successfully')
      router.push(`/labs/${labId}`)
    }
  } catch (error: any) {
    console.error('❌ Save failed:', error)
    // Error will be handled by the form component
  }
}

onMounted(async () => {
  console.log('🏢 Lab Edit page mounted')
  console.log('📋 Route params:', route.params)
  console.log('📋 Is create mode:', isCreateMode.value)
  
  // Check permissions
  const requiredPermission = isCreateMode.value ? 'LAB_CREATE' : 'LAB_EDIT'
  console.log(`🔐 Checking ${requiredPermission} permission...`)
  console.log('👤 Current user permissions:', authStore.user?.permissions)
  
  if (!hasRequiredPermission.value) {
    console.warn(`❌ Access denied: User does not have ${requiredPermission} permission`)
    // Don't redirect immediately, let the UI show the permission denied message
    return
  }
  
  console.log(`✅ Permission check passed: ${requiredPermission}`)
  console.log('📋 User permissions:', {
    create: canCreate.value,
    edit: canEdit.value
  })
  
  await fetchLab()
})

// Watch for route changes
watch(() => route.params.labId, (newLabId, oldLabId) => {
  console.log('🔄 Route param changed:', oldLabId, '->', newLabId)
  if (newLabId !== oldLabId) {
    // Reset state
    lab.value = null
    error.value = null
    
    // Check permission again
    if (!hasRequiredPermission.value) {
      console.warn('❌ Access denied after route change')
      return
    }
    
    fetchLab()
  }
}, { immediate: false })
</script>