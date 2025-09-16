<template>
  <div class="min-h-screen bg-background">
    <!-- Mobile sidebar overlay -->
    <div 
      v-if="uiStore.sidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="uiStore.closeSidebar"
    ></div>

    <!-- Sidebar -->
    <Transition name="slide">
      <SidebarNav 
        v-if="uiStore.sidebarOpen || isDesktop"
        class="fixed inset-y-0 left-0 z-50 lg:z-30"
        :class="{ 'lg:translate-x-0': isDesktop }"
      />
    </Transition>

    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <Topbar />
      
      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <router-view />
      </main>
    </div>

    <!-- Global loading -->
    <div 
      v-if="uiStore.globalLoading"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-2xl p-6 flex items-center space-x-3">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        <span class="text-gray-700">{{ $t('common.loading') }}</span>
      </div>
    </div>

    <!-- Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="fade" tag="div">
        <div
          v-for="notification in uiStore.notifications"
          :key="notification.id"
          class="max-w-sm bg-white rounded-2xl shadow-lg border p-4"
          :class="{
            'border-green-200': notification.type === 'success',
            'border-red-200': notification.type === 'error',
            'border-yellow-200': notification.type === 'warning',
            'border-blue-200': notification.type === 'info',
          }"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5 text-green-500" />
              <XCircle v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-500" />
              <AlertTriangle v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-500" />
              <Info v-else class="h-5 w-5 text-blue-500" />
            </div>
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
              <p v-if="notification.message" class="text-sm text-gray-500 mt-1">{{ notification.message }}</p>
            </div>
            <button
              @click="uiStore.removeNotification(notification.id)"
              class="ml-4 flex-shrink-0 rounded-full p-1 hover:bg-gray-100"
            >
              <X class="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useUiStore } from '@/stores/ui'
import SidebarNav from '@/components/layout/SidebarNav.vue'
import Topbar from '@/components/layout/Topbar.vue'

const uiStore = useUiStore()
const { width } = useWindowSize()

const isDesktop = computed(() => width.value >= 1024)
</script>