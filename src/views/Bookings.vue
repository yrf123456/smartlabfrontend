<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.bookings') }}</h1>
        <p class="text-gray-600 mt-1">管理实验室预约和日程</p>
      </div>
      
      <button class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600">
        <Plus class="w-4 h-4 inline mr-2" />
        新建预约
      </button>
    </div>

    <div class="text-center py-20">
      <Calendar class="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">预约管理功能</h3>
      <p class="text-gray-500">该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, Plus } from 'lucide-vue-next'
</script>
