<template>
  <div id="app" class="min-h-screen">
    <!-- Global initialization loading state -->
    <div
      v-if="!appInitialized"
      class="min-h-screen bg-background flex items-center justify-center"
    >
      <div class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Smart Lab</h3>
        <p class="text-gray-600">{{ initializationStatus }}</p>
        
        <!-- Initialization progress -->
        <div class="w-64 bg-gray-200 rounded-full h-1 mt-4">
          <div 
            class="bg-primary-500 h-1 rounded-full transition-all duration-300"
            :style="{ width: initializationProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Main application content -->
    <router-view v-else-if="!initializationError" />
    
    <!-- Initialization error state -->
    <div
      v-else
      class="min-h-screen bg-background flex items-center justify-center"
    >
      <div class="text-center max-w-md">
        <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Initialization Failed</h3>
        <p class="text-gray-600 mb-6">{{ initializationError }}</p>
        <button
          class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="retryInitialization"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const appInitialized = ref(false)
const initializationError = ref('')
const initializationStatus = ref('Initializing...')
const initializationProgress = ref(0)

const updateInitializationStatus = (step: string, progress: number) => {
  initializationStatus.value = step
  initializationProgress.value = progress
}

const initializeApp = async () => {
  try {
    console.log('🚀 App: Starting initialization...')
    
    // Step 1: Load configuration
    updateInitializationStatus('Loading configuration...', 20)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Step 2: Initialize theme
    updateInitializationStatus('Initializing theme...', 40)
    uiStore.initTheme()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Step 3: Initialize auth state
    updateInitializationStatus('Verifying authentication...', 70)
    await authStore.initAuth()
    
    // Ensure auth state is fully initialized
    let retryCount = 0
    while (!authStore.initialized && retryCount < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount++
    }
    
    if (!authStore.initialized) {
      throw new Error('Authentication initialization timeout')
    }
    
    // Step 4: Prepare interface
    updateInitializationStatus('Preparing interface...', 100)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('✅ App: Initialization completed')
    console.log('👤 Current user:', authStore.user?.name || 'Not authenticated')
    console.log('🔓 Authentication status:', authStore.isAuthenticated)
    console.log('🔑 User roles:', authStore.user?.roles)
    console.log('🎫 User permissions:', authStore.user?.permissions)
    
    appInitialized.value = true
    initializationError.value = ''
    
  } catch (error: any) {
    console.error('❌ App: Initialization failed:', error)
    initializationError.value = error.message || 'An error occurred during initialization'
    appInitialized.value = false
  }
}

const retryInitialization = () => {
  console.log('🔄 App: Retrying initialization...')
  initializationError.value = ''
  appInitialized.value = false
  initializationProgress.value = 0
  initializeApp()
}

// Capture component errors
onErrorCaptured((error, instance, info) => {
  console.error('🚨 App: Component error caught:', error, info)
  
  uiStore.addNotification({
    type: 'error',
    title: 'Page Error',
    message: 'Page rendering issue, please refresh and try again'
  })
  
  return false
})

// Listen for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('🚨 Global error:', event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled promise rejection:', event.reason)
  })
}

onMounted(async () => {
  console.log('🔧 App: Component mounted')
  console.log('🧭 Current route:', route.path)
  
  await initializeApp()
})

// Development environment debugging
if (import.meta.env.DEV) {
  (window as any).$debug = () => {
    console.log('🛠 Global Debug Info:')
    console.log('  - App initialized:', appInitialized.value)
    console.log('  - Auth initialized:', authStore.initialized)
    console.log('  - Is authenticated:', authStore.isAuthenticated)
    console.log('  - Current user:', authStore.user)
    console.log('  - User roles:', authStore.user?.roles)
    console.log('  - User permissions:', authStore.user?.permissions)
    console.log('  - Current route:', route.path)
    console.log('  - Initialization error:', initializationError.value)
  }
  
  console.log('🛠 Debug: Type window.$debug() to see global state')
}
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>