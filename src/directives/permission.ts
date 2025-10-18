import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Permission } from '@/types'

/**
 * Permission directive v-permission
 * Usage: 
 *   v-permission="'LAB_CREATE'"
 *   v-permission="['LAB_CREATE', 'LAB_EDIT']"
 *   v-permission="{ permission: 'LAB_CREATE', mode: 'all' }"
 */
export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const authStore = useAuthStore()
    const { value } = binding

    if (!value) {
      console.warn('[v-permission] No permission value provided')
      return
    }

    // Handle different value types
    let permissions: string[] = []
    let mode: 'any' | 'all' = 'any' // default: any permission matches

    if (typeof value === 'string') {
      permissions = [value]
    } else if (Array.isArray(value)) {
      permissions = value
    } else if (typeof value === 'object') {
      permissions = Array.isArray(value.permission) ? value.permission : [value.permission]
      mode = value.mode || 'any'
    }

    // Check permissions
    const hasPermission = mode === 'all'
      ? permissions.every(p => authStore.hasPermission(p))
      : permissions.some(p => authStore.hasPermission(p))

    if (!hasPermission) {
      // Remove element from DOM if no permission
      el.style.display = 'none'
      
      // Add debug info in dev mode
      if (import.meta.env.DEV) {
        console.log(`[v-permission] Element hidden - Required: ${permissions.join(', ')}, Mode: ${mode}`)
      }
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    // Re-check permissions when binding value updates
    const authStore = useAuthStore()
    const { value } = binding

    if (!value) return

    let permissions: string[] = []
    let mode: 'any' | 'all' = 'any'

    if (typeof value === 'string') {
      permissions = [value]
    } else if (Array.isArray(value)) {
      permissions = value
    } else if (typeof value === 'object') {
      permissions = Array.isArray(value.permission) ? value.permission : [value.permission]
      mode = value.mode || 'any'
    }

    const hasPermission = mode === 'all'
      ? permissions.every(p => authStore.hasPermission(p))
      : permissions.some(p => authStore.hasPermission(p))

    el.style.display = hasPermission ? '' : 'none'
  }
}

/**
 * Role directive v-role
 * Usage:
 *   v-role="'ADMIN'"
 *   v-role="['ADMIN', 'TEACHER']"
 */
export const role: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const authStore = useAuthStore()
    const { value } = binding

    if (!value) {
      console.warn('[v-role] No role value provided')
      return
    }

    const roles: string[] = Array.isArray(value) ? value : [value]
    const hasRole = roles.some(r => authStore.hasRole(r))

    if (!hasRole) {
      el.style.display = 'none'
      
      if (import.meta.env.DEV) {
        console.log(`[v-role] Element hidden - Required: ${roles.join(', ')}`)
      }
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const authStore = useAuthStore()
    const { value } = binding

    if (!value) return

    const roles: string[] = Array.isArray(value) ? value : [value]
    const hasRole = roles.some(r => authStore.hasRole(r))

    el.style.display = hasRole ? '' : 'none'
  }
}