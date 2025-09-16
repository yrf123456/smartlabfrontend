<template>
  <div id="app" class="min-h-screen">
    <!-- 全局初始化加载状态 -->
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
        
        <!-- 初始化进度 -->
        <div class="w-64 bg-gray-200 rounded-full h-1 mt-4">
          <div 
            class="bg-primary-500 h-1 rounded-full transition-all duration-300"
            :style="{ width: initializationProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 主应用内容 -->
    <router-view v-else-if="!initializationError" />
    
    <!-- 初始化错误状态 -->
    <div
      v-else
      class="min-h-screen bg-background flex items-center justify-center"
    >
      <div class="text-center max-w-md">
        <div class="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">初始化失败</h3>
        <p class="text-gray-600 mb-6">{{ initializationError }}</p>
        <button
          class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="retryInitialization"
        >
          重试
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
const initializationStatus = ref('正在初始化...')
const initializationProgress = ref(0)

// 初始化步骤
const initializationSteps = [
  { name: '加载配置', progress: 20 },
  { name: '初始化主题', progress: 40 },
  { name: '验证身份', progress: 70 },
  { name: '准备界面', progress: 100 }
]

const updateInitializationStatus = (step: string, progress: number) => {
  initializationStatus.value = step
  initializationProgress.value = progress
}

const initializeApp = async () => {
  try {
    console.log('🚀 App: Starting initialization...')
    
    // 步骤 1: 加载配置
    updateInitializationStatus('加载配置...', 20)
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 步骤 2: 初始化主题
    updateInitializationStatus('初始化主题...', 40)
    uiStore.initTheme()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 步骤 3: 初始化认证状态
    updateInitializationStatus('验证身份...', 70)
    await authStore.initAuth()
    
    // 确保认证状态已经完全初始化
    let retryCount = 0
    while (!authStore.initialized && retryCount < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      retryCount++
    }
    
    if (!authStore.initialized) {
      throw new Error('认证初始化超时')
    }
    
    // 步骤 4: 准备界面
    updateInitializationStatus('准备界面...', 100)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('✅ App: Initialization completed')
    console.log('👤 Current user:', authStore.user?.name || 'Not authenticated')
    console.log('🔐 Authentication status:', authStore.isAuthenticated)
    
    appInitialized.value = true
    initializationError.value = ''
    
  } catch (error: any) {
    console.error('❌ App: Initialization failed:', error)
    initializationError.value = error.message || '初始化过程中发生错误'
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

// 捕获组件错误
onErrorCaptured((error, instance, info) => {
  console.error('🚨 App: Component error caught:', error, info)
  
  // 显示用户友好的错误信息
  uiStore.addNotification({
    type: 'error',
    title: '页面错误',
    message: '页面渲染出现问题，请刷新重试'
  })
  
  return false
})

// 监听未处理的错误
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

// 开发环境调试
if (import.meta.env.DEV) {
  (window as any).$debug = () => {
    console.log('🐛 Global Debug Info:')
    console.log('  - App initialized:', appInitialized.value)
    console.log('  - Auth initialized:', authStore.initialized)
    console.log('  - Is authenticated:', authStore.isAuthenticated)
    console.log('  - Current user:', authStore.user)
    console.log('  - Current route:', route.path)
    console.log('  - Initialization error:', initializationError.value)
  }
}
</script>

<style scoped>
/* 加载动画 */
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

/* 进度条动画 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>