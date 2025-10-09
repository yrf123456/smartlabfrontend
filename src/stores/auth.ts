import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { User, RegisterRequest } from '@/types'
import { UserRole, Permission } from '@/types'
import { api } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const initializationAttempts = ref(0)
  const maxInitializationAttempts = 3
  
  const forceUpdate = async () => {
    // Re-validate user status or fetch user info
    if (token.value) {
      await validate()
    }
  }
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const hasRole = (role: UserRole | string) => {
    if (!user.value?.roles) return false
    // Support both string and enum types
    return user.value.roles.includes(role as UserRole) || 
           user.value.roles.map(r => r.toString()).includes(role.toString())
  }

  const hasPermission = (permission: Permission | string) => {
    if (!user.value?.permissions) return false
    // Support both string and enum types
    return user.value.permissions.includes(permission as Permission) ||
           user.value.permissions.map(p => p.toString()).includes(permission.toString())
  }

  const can = (permission: Permission | string) => {
    return hasPermission(permission)
  }

  // Check if user is system admin
  const isSystemAdmin = computed(() => hasRole(UserRole.SYSTEM_ADMIN))
  
  // Check if user is department admin
  const isDepartmentAdmin = computed(() => hasRole(UserRole.DEPARTMENT_ADMIN))
  
  // Check if user is teacher
  const isTeacher = computed(() => hasRole(UserRole.TEACHER))
  
  // Check if user is student
  const isStudent = computed(() => hasRole(UserRole.STUDENT))
  
  // Check if user is visitor
  const isVisitor = computed(() => hasRole(UserRole.VISITOR))

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      console.log('📡 AuthStore: Attempting login for', email)
      
      const response = await api.auth.login({ email, password })
      
      // Update state immediately
      user.value = response.data.user
      token.value = response.data.token
      
      // Store to localStorage
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      // Ensure reactive update completes
      await nextTick()
      
      console.log('✅ AuthStore: Login successful for', user.value?.name)
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ AuthStore: Login failed:', error)
      
      // Clear possible partial state
      user.value = null
      token.value = null
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      loading.value = true
      console.log('📝 AuthStore: Attempting registration for', data.email)
      
      const response = await api.auth.register(data)
      
      // Update state immediately
      user.value = response.data.user
      token.value = response.data.token
      
      // Store to localStorage
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      // Ensure reactive update completes
      await nextTick()
      
      console.log('✅ AuthStore: Registration successful for', user.value?.name)
      
      return { 
        success: true,
        requiresApproval: response.data.requiresApproval || false
      }
    } catch (error: any) {
      console.error('❌ AuthStore: Registration failed:', error)
      
      // Clear possible partial state
      user.value = null
      token.value = null
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      console.log('👋 AuthStore: Logging out...')
      
      if (token.value) {
        await api.auth.logout()
      }
    } catch (error) {
      console.warn('⚠️ AuthStore: Logout request failed:', error)
    } finally {
      // Clear state
      user.value = null
      token.value = null
      initialized.value = false
      initializationAttempts.value = 0
      
      // Clear storage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // Ensure reactive update completes
      await nextTick()
      console.log('✅ AuthStore: Logout completed')
    }
  }

  const initAuth = async (): Promise<boolean> => {
    if (initialized.value) {
      console.log('✅ AuthStore: Already initialized')
      return true
    }
    
    initializationAttempts.value++
    console.log(`🔄 AuthStore: Initializing (attempt ${initializationAttempts.value}/${maxInitializationAttempts})`)
    
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user_info')
      
      if (!savedToken || !savedUser) {
        console.log('ℹ️ AuthStore: No saved auth data found')
        initialized.value = true
        return true
      }
      
      // Parse saved user info
      let parsedUser: User
      try {
        parsedUser = JSON.parse(savedUser)
      } catch (parseError) {
        console.error('❌ AuthStore: Failed to parse saved user info:', parseError)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        initialized.value = true
        return true
      }
      
      // Set state
      token.value = savedToken
      user.value = parsedUser
      
      // Validate token in non-mock mode
      if (import.meta.env.VITE_USE_MOCK !== 'true') {
        try {
          await fetchProfile()
        } catch (error) {
          console.warn('⚠️ AuthStore: Token validation failed, clearing auth state')
          await logout()
          initialized.value = true
          return true
        }
      }
      
      console.log('✅ AuthStore: Auth initialized from storage for', user.value?.name)
      initialized.value = true
      await nextTick()
      return true
      
    } catch (error) {
      console.error('❌ AuthStore: Initialization failed:', error)
      
      // If there are retry attempts left
      if (initializationAttempts.value < maxInitializationAttempts) {
        console.log('🔄 AuthStore: Retrying initialization...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await initAuth()
      }
      
      // Retry attempts exhausted, clear state and mark as initialized
      console.error('💥 AuthStore: Max initialization attempts reached, clearing state')
      await logout()
      initialized.value = true
      return false
    }
  }

  const fetchProfile = async () => {
    try {
      console.log('👤 AuthStore: Fetching profile...')
      const response = await api.auth.getProfile()
      
      user.value = response.data
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      await nextTick()
      console.log('✅ AuthStore: Profile updated for', user.value?.name)
    } catch (error) {
      console.error('❌ AuthStore: Failed to fetch profile:', error)
      throw error
    }
  }

  // Force refresh auth state (for debugging)
  const refresh = async () => {
    console.log('🔄 AuthStore: Force refresh')
    initialized.value = false
    initializationAttempts.value = 0
    await initAuth()
  }

  // Check if auth state is valid
  const validate = async (): Promise<boolean> => {
    if (!isAuthenticated.value) {
      return false
    }
    
    try {
      if (import.meta.env.VITE_USE_MOCK !== 'true') {
        await fetchProfile()
      }
      return true
    } catch (error) {
      console.error('❌ AuthStore: Validation failed:', error)
      await logout()
      return false
    }
  }

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    hasRole,
    hasPermission,
    can,
    // Role check computed properties
    isSystemAdmin,
    isDepartmentAdmin,
    isTeacher,
    isStudent,
    isVisitor,
    // Methods
    login,
    register,
    logout,
    initAuth,
    fetchProfile,
    refresh,
    validate,
    forceUpdate
  }
})