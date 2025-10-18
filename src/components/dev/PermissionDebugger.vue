<template>
  <div 
    v-if="isDev" 
    class="fixed bottom-4 right-4 z-50"
  >
    <!-- Toggle Button -->
    <button
      v-if="!showDebugger"
      @click="showDebugger = true"
      class="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      title="Open Permission Debugger"
    >
      <Shield class="w-5 h-5" />
    </button>

    <!-- Debugger Panel -->
    <div
      v-else
      class="bg-white rounded-xl shadow-2xl border-2 border-purple-600 w-96 max-h-[600px] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="bg-purple-600 text-white p-4 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Shield class="w-5 h-5" />
          <h3 class="font-bold">Permission Debugger</h3>
        </div>
        <button
          @click="showDebugger = false"
          class="hover:bg-purple-700 p-1 rounded transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- User Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 class="font-semibold text-blue-900 mb-2 flex items-center">
            <User class="w-4 h-4 mr-2" />
            Current User
          </h4>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Name:</span>
              <span class="font-medium">{{ authStore.user?.name || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Email:</span>
              <span class="font-mono text-xs">{{ authStore.user?.email || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">ID:</span>
              <span class="font-mono text-xs">{{ authStore.user?.id || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Authenticated:</span>
              <span :class="authStore.isAuthenticated ? 'text-green-600' : 'text-red-600'">
                {{ authStore.isAuthenticated ? '✓ Yes' : '✗ No' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Roles -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 class="font-semibold text-green-900 mb-2 flex items-center">
            <UserCog class="w-4 h-4 mr-2" />
            Roles ({{ userRoles.length }})
          </h4>
          <div class="space-y-1">
            <div
              v-for="role in userRoles"
              :key="role"
              class="flex items-center justify-between text-sm bg-white px-2 py-1 rounded"
            >
              <span class="font-medium">{{ role }}</span>
              <span class="text-green-600 text-xs">✓</span>
            </div>
            <div v-if="userRoles.length === 0" class="text-sm text-gray-500 italic">
              No roles assigned
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <h4 class="font-semibold text-purple-900 mb-2 flex items-center">
            <Key class="w-4 h-4 mr-2" />
            Permissions ({{ userPermissions.length }})
          </h4>
          <div class="space-y-1 max-h-60 overflow-y-auto">
            <div
              v-for="perm in userPermissions"
              :key="perm"
              class="flex items-center justify-between text-xs bg-white px-2 py-1 rounded"
            >
              <span class="font-mono">{{ perm }}</span>
              <span class="text-purple-600">✓</span>
            </div>
            <div v-if="userPermissions.length === 0" class="text-sm text-gray-500 italic">
              No permissions granted
            </div>
          </div>
        </div>

        <!-- Permission Test -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h4 class="font-semibold text-yellow-900 mb-2 flex items-center">
            <TestTube class="w-4 h-4 mr-2" />
            Test Permission
          </h4>
          <div class="space-y-2">
            <input
              v-model="testPermission"
              type="text"
              placeholder="e.g., LAB_CREATE"
              class="w-full px-3 py-2 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600">Has Permission:</span>
              <span
                :class="testResult ? 'text-green-600 font-bold' : 'text-red-600 font-bold'"
              >
                {{ testResult ? '✓ YES' : '✗ NO' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-2">
          <button
            @click="refreshAuth"
            class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            Refresh Auth State
          </button>
          
          <button
            @click="copyDebugInfo"
            class="w-full bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <Copy class="w-4 h-4 mr-2" />
            Copy Debug Info
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Shield, X, User, UserCog, Key, TestTube, RefreshCw, Copy } from 'lucide-vue-next'

const authStore = useAuthStore()
const showDebugger = ref(false)
const testPermission = ref('')

const isDev = computed(() => import.meta.env.DEV)

const userRoles = computed(() => authStore.user?.roles || [])
const userPermissions = computed(() => authStore.user?.permissions || [])

const testResult = computed(() => {
  if (!testPermission.value.trim()) return false
  return authStore.hasPermission(testPermission.value.trim())
})

const refreshAuth = async () => {
  try {
    await authStore.refresh()
    alert('✓ Auth state refreshed successfully!')
  } catch (error) {
    alert('✗ Failed to refresh auth state')
    console.error(error)
  }
}

const copyDebugInfo = () => {
  const info = {
    user: {
      id: authStore.user?.id,
      name: authStore.user?.name,
      email: authStore.user?.email
    },
    roles: userRoles.value,
    permissions: userPermissions.value,
    authenticated: authStore.isAuthenticated
  }
  
  navigator.clipboard.writeText(JSON.stringify(info, null, 2))
  alert('✓ Debug info copied to clipboard!')
}

// Auto-open on first mount in dev
if (isDev.value && !sessionStorage.getItem('debugger-shown')) {
  showDebugger.value = true
  sessionStorage.setItem('debugger-shown', 'true')
}
</script>