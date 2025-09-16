<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.reports') }}</h1>
      <p class="text-gray-600 mt-1">查看和导出统计报表</p>
    </div>

    <div class="text-center py-20">
      <FileBarChart class="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">报表统计功能</h3>
      <p class="text-gray-500">该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileBarChart } from 'lucide-vue-next'
</script>
