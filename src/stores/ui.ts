import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // 状态定义 - 默认值都设置为英文环境
  const sidebarOpen = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const locale = ref<'en'>('en') // 固定为英文
  const globalLoading = ref(false)
  const notifications = ref<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
  }>>([])

  // 侧边栏操作
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const closeSidebar = () => {
    sidebarOpen.value = false
  }

  const openSidebar = () => {
    sidebarOpen.value = true
  }

  // 主题操作
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    try {
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
    } catch (error) {
      console.warn('Failed to save theme:', error)
    }
  }

  const initTheme = () => {
    try {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
      if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
        setTheme(savedTheme)
      } else {
        setTheme('light') // 默认浅色主题
      }
    } catch (error) {
      console.warn('Failed to init theme:', error)
      setTheme('light')
    }
  }

  // 语言操作 - 固定为英文，移除语言切换功能
  const setLocale = (newLocale: 'en') => {
    locale.value = newLocale
    try {
      localStorage.setItem('locale', newLocale)
    } catch (error) {
      console.warn('Failed to save locale:', error)
    }
  }

  const initLocale = () => {
    // 总是设置为英文
    locale.value = 'en'
    try {
      localStorage.setItem('locale', 'en')
    } catch (error) {
      console.warn('Failed to init locale:', error)
    }
  }

  // 移除语言切换功能
  // const toggleLocale = () => {
  //   // 不再需要语言切换
  // }

  // 全局加载状态
  const setGlobalLoading = (loading: boolean) => {
    globalLoading.value = loading
  }

  // 通知操作
  const addNotification = (notification: Omit<typeof notifications.value[0], 'id'>) => {
    const id = Date.now().toString()
    const newNotification = {
      id,
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    if (newNotification.duration) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  return {
    // 状态
    sidebarOpen,
    theme,
    locale,
    globalLoading,
    notifications,
    // 方法
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setTheme,
    initTheme,
    setLocale,
    initLocale,
    // toggleLocale, // 移除语言切换
    setGlobalLoading,
    addNotification,
    removeNotification,
    clearNotifications
  }
})