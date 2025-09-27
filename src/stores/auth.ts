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
    // 可以重新验证用户状态或重新获取用户信息
    if (token.value) {
      await validate() // 假设你有 validate 方法
    }
  }
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const hasRole = (role: UserRole | string) => {
    if (!user.value?.roles) return false
    // 支持字符串和枚举类型
    return user.value.roles.includes(role as UserRole) || 
           user.value.roles.map(r => r.toString()).includes(role.toString())
  }

  const hasPermission = (permission: Permission | string) => {
    if (!user.value?.permissions) return false
    // 支持字符串和枚举类型
    return user.value.permissions.includes(permission as Permission) ||
           user.value.permissions.map(p => p.toString()).includes(permission.toString())
  }

  const can = (permission: Permission | string) => {
    return hasPermission(permission)
  }

  // 检查是否是系统管理员
  const isSystemAdmin = computed(() => hasRole(UserRole.SYSTEM_ADMIN))
  
  // 检查是否是部门管理员
  const isDepartmentAdmin = computed(() => hasRole(UserRole.DEPARTMENT_ADMIN))
  
  // 检查是否是教师
  const isTeacher = computed(() => hasRole(UserRole.TEACHER))
  
  // 检查是否是学生
  const isStudent = computed(() => hasRole(UserRole.STUDENT))
  
  // 检查是否是访客
  const isVisitor = computed(() => hasRole(UserRole.VISITOR))

  const login = async (email: string, password: string) => {
    try {
      loading.value = true
      console.log('📡 AuthStore: Attempting login for', email)
      
      const response = await api.auth.login({ email, password })
      
      // 立即更新状态
      user.value = response.data.user
      token.value = response.data.token
      
      // 存储到 localStorage
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      // 确保响应式更新完成
      await nextTick()
      
      console.log('✅ AuthStore: Login successful for', user.value?.name)
      
      return { success: true }
    } catch (error: any) {
      console.error('❌ AuthStore: Login failed:', error)
      
      // 清除可能的部分状态
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
      
      // 立即更新状态
      user.value = response.data.user
      token.value = response.data.token
      
      // 存储到 localStorage
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('user_info', JSON.stringify(user.value))
      
      // 确保响应式更新完成
      await nextTick()
      
      console.log('✅ AuthStore: Registration successful for', user.value?.name)
      
      return { 
        success: true,
        requiresApproval: response.data.requiresApproval || false
      }
    } catch (error: any) {
      console.error('❌ AuthStore: Registration failed:', error)
      
      // 清除可能的部分状态
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
      // 清除状态
      user.value = null
      token.value = null
      initialized.value = false
      initializationAttempts.value = 0
      
      // 清除存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      
      // 确保响应式更新完成
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
      
      // 解析保存的用户信息
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
      
      // 设置状态
      token.value = savedToken
      user.value = parsedUser
      
      // 在非 Mock 模式下验证 token
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
      
      // 如果还有重试机会
      if (initializationAttempts.value < maxInitializationAttempts) {
        console.log('🔄 AuthStore: Retrying initialization...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await initAuth()
      }
      
      // 重试次数耗尽，清除状态并标记为已初始化
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

  // 强制刷新认证状态（用于调试）
  const refresh = async () => {
    console.log('🔄 AuthStore: Force refresh')
    initialized.value = false
    initializationAttempts.value = 0
    await initAuth()
  }

  // 检查认证状态是否有效
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
    // 角色检查计算属性
    isSystemAdmin,
    isDepartmentAdmin,
    isTeacher,
    isStudent,
    isVisitor,
    // 方法
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