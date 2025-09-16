<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.users') }}</h1>
      <p class="text-gray-600 mt-1">管理用户和角色权限</p>
    </div>

    <div class="text-center py-20">
      <Users class="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">用户管理功能</h3>
      <p class="text-gray-500">该功能正在开发中，敬请期待...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Users } from 'lucide-vue-next'
</script>
