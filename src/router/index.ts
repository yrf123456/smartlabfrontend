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
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
        meta: { title: 'Project Management' }
      },
      {
        path: 'projects/new',
        name: 'ProjectCreate',
        component: () => import('@/views/ProjectEdit.vue'),
        meta: { 
          title: 'Create Project',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN', 'DEPT_ADMIN', 'DEPARTMENT_ADMIN', 'TEACHER', 'STUDENT'] 
        }
      },
      {
        path: 'projects/:projectId',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetail.vue'),
        props: true,
        meta: { title: 'Project Details' }
      },
      {
        path: 'projects/:projectId/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/ProjectEdit.vue'),
        props: true,
        meta: { 
          title: 'Edit Project',
          roles: ['SYS_ADMIN', 'SYSTEM_ADMIN', 'DEPT_ADMIN', 'DEPARTMENT_ADMIN', 'TEACHER'] 
        }
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
    
    if (to.path === '/login' || to.path === '/register') {
      if (authStore.isAuthenticated) {
        console.log('✅ Router: Already logged in, redirecting to dashboard')
        const redirect = to.query.redirect as string
        next(redirect || '/dashboard')
        return
      }
      
      if (to.meta.title) {
        document.title = `${to.meta.title} - Smart Lab`
      }
      next()
      return
    }
    
    if (!authStore.initialized) {
      console.log('⏳ Router: Waiting for auth initialization...')
      
      const initialized = await waitForAuthInitialization(5000)
      
      if (!initialized) {
        console.error('⌛ Router: Auth initialization timeout')
        if (to.path === '/login' || to.path === '/register') {
          next()
          return
        }
        next('/login')
        return
      }
      
      console.log('✅ Router: Auth initialization completed')
    }
    
    await nextTick()
    
    const requiresAuth = to.meta.requiresAuth !== false
    const isAuthenticated = authStore.isAuthenticated
    
    console.log(`🔐 Router: Auth check - requiresAuth: ${requiresAuth}, isAuthenticated: ${isAuthenticated}`)
    
    if (requiresAuth && !isAuthenticated) {
      console.log('⛔ Router: Access denied, redirecting to login')
      next({
        path: '/login',
        query: to.path !== '/' ? { redirect: to.fullPath } : undefined
      })
      return
    }
    
    if (to.meta.roles && Array.isArray(to.meta.roles) && isAuthenticated) {
      console.log(`🔑 Router: Checking roles - Required: ${to.meta.roles}, User roles: ${authStore.user?.roles}`)
      
      const hasRequiredRole = to.meta.roles.some(role => 
        authStore.hasRole(role as string)
      )
      
      console.log(`🔑 Router: Role check result: ${hasRequiredRole}`)
      
      if (!hasRequiredRole) {
        console.log('🚫 Router: Insufficient permissions, redirecting to dashboard')
        next('/dashboard')
        return
      }
    }
    
    if (to.meta.title) {
      document.title = `${to.meta.title} - Smart Lab`
    }
    
    const endTime = Date.now()
    console.log(`✅ Router: Navigation completed in ${endTime - startTime}ms`)
    
    next()
    
  } catch (error) {
    console.error('💥 Router: Navigation error:', error)
    
    if (to.path === '/login' || to.path === '/register') {
      next()
    } else {
      next('/login')
    }
  }
})

router.afterEach((to, from, failure) => {
  if (failure) {
    console.error('⌛ Router: Navigation failed:', failure)
    return
  }
  
  console.log(`✅ Router: Successfully navigated to ${to.path}`)
  
  if (typeof window !== 'undefined') {
    window.scrollTo(0, 0)
  }
  
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

router.onError((error) => {
  console.error('🚨 Router: Global error:', error)
})

export default router