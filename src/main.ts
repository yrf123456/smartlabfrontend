import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 导入 i18n 配置
import i18n from './locales'

const app = createApp(App)
const pinia = createPinia()

// 插件注册
app.use(pinia)
app.use(router)
app.use(i18n)

// 初始化应用设置
const initializeApp = async () => {
  const { useUiStore } = await import('@/stores/ui')
  const uiStore = useUiStore()
  
  // 初始化主题
  uiStore.initTheme()
  
  // 初始化语言设置
  uiStore.initLocale()
  
  // 确保 i18n 实例使用正确的语言
  i18n.global.locale.value = uiStore.locale
  
  console.log('🌍 App initialized with locale:', uiStore.locale)
}

// 开发环境调试
if (import.meta.env.DEV) {
  // 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('🚨 Vue Error:', err)
    console.error('📍 Component:', instance)
    console.error('ℹ️ Info:', info)
  }

  // 路由调试
  router.afterEach((to, from) => {
    console.log(`🧭 Route: ${from.path} → ${to.path}`)
    
    // 特别监控实验室相关路由
    if (to.path.startsWith('/labs') || from.path.startsWith('/labs')) {
      console.log('🏢 Lab route detected:', {
        to: to.path,
        from: from.path,
        params: to.params,
        query: to.query
      })
    }
  })

  // 全局状态监控
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason)
  })

  // 性能监控
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          console.log('⚡ Page Load Time:', entry.duration + 'ms')
        }
      }
    })
    observer.observe({ entryTypes: ['navigation'] })
  } catch (error) {
    console.warn('Performance observer not supported:', error)
  }

  console.log('🚀 Smart Lab Frontend Started (Development Mode)')
  console.log('🌐 Default Language: English')
  console.log('🐛 Debug functions available:')
  console.log('  - debugSidebar() - Sidebar状态')
  console.log('  - debugLabs() - 实验室页面状态')
  console.log('  - window.$debug() - 全局状态')
}

// 挂载应用
app.mount('#app')

// 应用挂载后初始化设置
initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
})