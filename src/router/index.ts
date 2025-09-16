import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { nextTick } from 'vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false, title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false, title: 'Register' }
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 'labs',
        name: 'Labs',
        component: () => import('@/views/Labs.vue'),
        meta: { title: 'Laboratory Management' }
      },
      // 注意：新建路由必须在参数路由之前
      {
        path: 'labs/new/edit',
        name: 'LabCreate',
        component: () => import('@/views/LabEdit.vue'),
        meta: { 
          title: 'Create Laboratory',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN', 'DEPT_ADMIN', 'DEPARTMENT_ADMIN'] 
        }
      },
      {
        path: 'labs/:labId',
        name: 'LabDetail',
        component: () => import('@/views/LabDetail.vue'),
        props: true,
        meta: { title: 'Laboratory Details' }
      },
      {
        path: 'labs/:labId/edit',
        name: 'LabEdit',
        component: () => import('@/views/LabEdit.vue'),
        props: true,
        meta: { 
          title: 'Edit Laboratory',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN', 'DEPT_ADMIN', 'DEPARTMENT_ADMIN'] 
        }
      },
      {
        path: 'bookings',
        name: 'Bookings',
        component: () => import('@/views/Bookings.vue'),
        meta: { title: 'Booking Management' }
      },
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/Equipment.vue'),
        meta: { title: 'Equipment Management' }
      },
      {
        path: 'environment',
        name: 'Environment',
        component: () => import('@/views/Environment.vue'),
        meta: { title: 'Environment Monitoring' }
      },
      {
        path: 'access',
        name: 'Access',
        component: () => import('@/views/Access.vue'),
        meta: { title: 'Access Control' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { 
          title: 'User Management',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN', 'DEPT_ADMIN', 'DEPARTMENT_ADMIN'] 
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { title: 'Reports & Analytics' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { 
          title: 'System Settings',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN'] 
        }
      }
    ]
  },
  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 等待认证初始化完成的辅助函数
const waitForAuthInitialization = async (maxWaitTime = 5000): Promise<boolean> => {
  const authStore = useAuthStore()
  const startTime = Date.now()
  
  while (!authStore.initialized && (Date.now() - startTime) < maxWaitTime) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  
  return authStore.initialized
}

router.beforeEach(async (to, from, next) => {
  const startTime = Date.now()
  console.log(`🧭 Router: Navigating ${from.path} → ${to.path}`)
  
  try {
    const authStore = useAuthStore()
    
    // 如果访问登录或注册页面，优先处理
    if (to.path === '/login' || to.path === '/register') {
      // 如果已经登录，重定向到dashboard
      if (authStore.isAuthenticated) {
        console.log('✅ Router: Already logged in, redirecting to dashboard')
        const redirect = to.query.redirect as string
        next(redirect || '/dashboard')
        return
      }
      
      // 未登录，允许访问登录或注册页
      if (to.meta.title) {
        document.title = `${to.meta.title} - Smart Lab`
      }
      next()
      return
    }
    
    // 等待认证状态初始化完成
    if (!authStore.initialized) {
      console.log('⏳ Router: Waiting for auth initialization...')
      
      const initialized = await waitForAuthInitialization(5000)
      
      if (!initialized) {
        console.error('❌ Router: Auth initialization timeout')
        // 超时情况下，如果访问的是登录或注册页面，允许继续
        if (to.path === '/login' || to.path === '/register') {
          next()
          return
        }
        // 否则重定向到登录页面
        next('/login')
        return
      }
      
      console.log('✅ Router: Auth initialization completed')
    }
    
    await nextTick()
    
    const requiresAuth = to.meta.requiresAuth !== false
    const isAuthenticated = authStore.isAuthenticated
    
    console.log(`🔐 Router: Auth check - requiresAuth: ${requiresAuth}, isAuthenticated: ${isAuthenticated}`)
    
    // 需要认证但未登录
    if (requiresAuth && !isAuthenticated) {
      console.log('❌ Router: Access denied, redirecting to login')
      next({
        path: '/login',
        query: to.path !== '/' ? { redirect: to.fullPath } : undefined
      })
      return
    }
    
    // 检查角色权限
    if (to.meta.roles && Array.isArray(to.meta.roles) && isAuthenticated) {
      console.log(`🔍 Router: Checking roles - Required: ${to.meta.roles}, User roles: ${authStore.user?.roles}`)
      
      const hasRequiredRole = to.meta.roles.some(role => 
        authStore.hasRole(role as string)
      )
      
      console.log(`🔍 Router: Role check result: ${hasRequiredRole}`)
      
      if (!hasRequiredRole) {
        console.log('🚫 Router: Insufficient permissions, redirecting to dashboard')
        next('/dashboard')
        return
      }
    }
    
    // 设置页面标题
    if (to.meta.title) {
      document.title = `${to.meta.title} - Smart Lab`
    }
    
    const endTime = Date.now()
    console.log(`✅ Router: Navigation completed in ${endTime - startTime}ms`)
    
    next()
    
  } catch (error) {
    console.error('💥 Router: Navigation error:', error)
    
    // 发生错误时的降级处理
    if (to.path === '/login' || to.path === '/register') {
      next()
    } else {
      next('/login')
    }
  }
})

// 路由切换后的处理
router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('❌ Router: Navigation failed:', failure)
    return
  }
  
  console.log(`✅ Router: Successfully navigated to ${to.path}`)
  
  // 滚动到顶部
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0)
  }
  
  // 在开发环境中记录导航详情
  if (import.meta.env.DEV) {
    console.log(`📊 Router: Navigation details:`, {
      from: from.path,
      to: to.path,
      params: to.params,
      query: to.query,
      meta: to.meta
    })
  }
})

// 路由错误处理
router.onError((error) => {
  console.error('🚨 Router: Global error:', error)
  
  // 可以在这里添加全局错误处理逻辑
  // 比如显示错误页面或重定向到安全页面
})

export default router