<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.settings') }}</h1>
      <p class="text-gray-600 mt-1">系统配置和个人设置</p>
    </div>

    <div class="text-center py-20">
      <Settings class="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">系统设置功能</h3>
      <p class="text-gray-500">该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
</script>
