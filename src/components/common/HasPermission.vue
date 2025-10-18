<template>
  <slot v-if="hasAccess"></slot>
  <slot v-else name="fallback"></slot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { Permission } from '@/types'

interface Props {
  permission?: Permission | string | (Permission | string)[]
  role?: string | string[]
  mode?: 'any' | 'all' // 'any' = OR logic, 'all' = AND logic
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any'
})

const authStore = useAuthStore()

const hasAccess = computed(() => {
  // Check permissions
  if (props.permission) {
    const permissions = Array.isArray(props.permission) ? props.permission : [props.permission]
    
    const hasPermission = props.mode === 'all'
      ? permissions.every(p => authStore.hasPermission(p))
      : permissions.some(p => authStore.hasPermission(p))
    
    if (!hasPermission) return false
  }

  // Check roles
  if (props.role) {
    const roles = Array.isArray(props.role) ? props.role : [props.role]
    
    const hasRole = props.mode === 'all'
      ? roles.every(r => authStore.hasRole(r))
      : roles.some(r => authStore.hasRole(r))
    
    if (!hasRole) return false
  }

  return true
})
</script>