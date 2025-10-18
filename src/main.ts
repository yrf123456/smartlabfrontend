import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import i18n config
import i18n from './locales'

// Import permission directives
import { permission, role } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()

// Plugin registration
app.use(pinia)
app.use(router)
app.use(i18n)

// Register permission directives globally
app.directive('permission', permission)
app.directive('role', role)

// Initialize app settings
const initializeApp = async () => {
  const { useUiStore } = await import('@/stores/ui')
  const uiStore = useUiStore()
  
  // Initialize theme
  uiStore.initTheme()
  
  // Initialize language settings
  uiStore.initLocale()
  
  // Ensure i18n instance uses correct language
  i18n.global.locale.value = uiStore.locale
  
  console.log('🌍 App initialized with locale:', uiStore.locale)
}

// Development environment debugging
if (import.meta.env.DEV) {
  // Global error handling
  app.config.errorHandler = (err, instance, info) => {
    console.error('🚨 Vue Error:', err)
    console.error('📍 Component:', instance)
    console.error('ℹ️ Info:', info)
  }

  // Router debugging
  router.afterEach((to, from) => {
    console.log(`🧭 Route: ${from.path} → ${to.path}`)
    
    // Special monitoring for lab-related routes
    if (to.path.startsWith('/labs') || from.path.startsWith('/labs')) {
      console.log('🏢 Lab route detected:', {
        to: to.path,
        from: from.path,
        params: to.params,
        query: to.query
      })
    }
  })

  // Global state monitoring
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', event.reason)
  })

  // Performance monitoring
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
  console.log('🔐 Permission System: Enabled')
  console.log('🐛 Debug functions available:')
  console.log('  - debugSidebar() - Sidebar state')
  console.log('  - debugLabs() - Lab page state')
  console.log('  - window.$debug() - Global state')
}

// Mount app
app.mount('#app')

// Initialize settings after app is mounted
initializeApp().catch(error => {
  console.error('Failed to initialize app:', error)
})