<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FileQuestion class="w-12 h-12 text-gray-400" />
      </div>
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">页面不存在</h2>
      <p class="text-gray-600 mb-8">您访问的页面可能已被删除或移动到其他位置。</p>
      
      <div class="space-y-4">
        <button
          class="w-full bg-primary-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="goHome"
        >
          返回首页
        </button>
        
        <button
          class="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors"
          @click="goBack"
        >
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FileQuestion } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}
</script>