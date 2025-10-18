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
      // ===== Lab Management Routes =====
      {
        path: 'labs',
        name: 'Labs',
        component: () => import('@/views/Labs.vue'),
        meta: { 
          title: 'Laboratory Management',
          permissions: ['LAB_VIEW']
        }
      },
      {
        path: 'labs/new/edit',
        name: 'LabCreate',
        component: () => import('@/views/LabEdit.vue'),
        meta: { 
          title: 'Create Laboratory',
          permissions: ['LAB_CREATE']
        }
      },
      {
        path: 'labs/:labId',
        name: 'LabDetail',
        component: () => import('@/views/LabDetail.vue'),
        props: true,
        meta: { 
          title: 'Laboratory Details',
          permissions: ['LAB_VIEW']
        }
      },
      {
        path: 'labs/:labId/edit',
        name: 'LabEdit',
        component: () => import('@/views/LabEdit.vue'),
        props: true,
        meta: { 
          title: 'Edit Laboratory',
          permissions: ['LAB_EDIT']
        }
      },
      // ===== Booking Management Routes =====
      {
        path: 'bookings',
        name: 'Bookings',
        component: () => import('@/views/Bookings.vue'),
        meta: { 
          title: 'Booking Management',
          permissions: ['BOOKING_VIEW', 'BOOKING_CREATE', 'BOOKING_APPROVE']
        }
      },
      // ===== Equipment Management Routes =====
      {
        path: 'equipment',
        name: 'Equipment',
        component: () => import('@/views/Equipment.vue'),
        meta: { 
          title: 'Equipment Management',
          permissions: ['EQUIPMENT_VIEW']
        }
      },
      // ===== Environment Monitoring Routes =====
      {
        path: 'environment',
        name: 'Environment',
        component: () => import('@/views/Environment.vue'),
        meta: { 
          title: 'Environment Monitoring',
          permissions: ['ENVIRONMENT_VIEW']
        }
      },
      // ===== Project Management Routes =====
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/Projects.vue'),
        meta: { 
          title: 'Project Management',
          permissions: ['PROJECT_VIEW']
        }
      },
      {
        path: 'projects/new',
        name: 'ProjectCreate',
        component: () => import('@/views/ProjectEdit.vue'),
        meta: { 
          title: 'Create Project',
          permissions: ['PROJECT_CREATE']
        }
      },
      {
        path: 'projects/:projectId',
        name: 'ProjectDetail',
        component: () => import('@/views/ProjectDetail.vue'),
        props: true,
        meta: { 
          title: 'Project Details',
          permissions: ['PROJECT_VIEW']
        }
      },
      {
        path: 'projects/:projectId/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/ProjectEdit.vue'),
        props: true,
        meta: { 
          title: 'Edit Project',
          permissions: ['PROJECT_EDIT']
        }
      },
      // ===== User Management Routes (ADMIN only) =====
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { 
          title: 'User Management',
          permissions: ['USER_MANAGEMENT']
        }
      },
      // ===== Reports & Analytics Routes =====
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/Reports.vue'),
        meta: { 
          title: 'Reports & Analytics',
          permissions: ['REPORTS_VIEW']
        }
      },
      // ===== Personal Settings Route (No permission required) =====
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { 
          title: 'Settings'
          // No permissions required - accessible to all authenticated users
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
        console.error('⏱️ Router: Auth initialization timeout')
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
    
    console.log(`🔍 Router: Auth check - requiresAuth: ${requiresAuth}, isAuthenticated: ${isAuthenticated}`)
    
    if (requiresAuth && !isAuthenticated) {
      console.log('⛔ Router: Access denied, redirecting to login')
      next({
        path: '/login',
        query: to.path !== '/' ? { redirect: to.fullPath } : undefined
      })
      return
    }
    
    if (isAuthenticated && requiresAuth) {
      try {
        console.log('🔄 Router: Refreshing user permissions...')
        console.log('👤 Current permissions before refresh:', authStore.user?.permissions)
        
        await authStore.fetchProfile()
        
        console.log('✅ Router: Permissions refreshed successfully')
        console.log('👤 Current permissions after refresh:', authStore.user?.permissions)
      } catch (error: any) {
        console.error('❌ Router: Failed to refresh permissions:', error)
        
        if (error.response?.status === 401) {
          console.log('🔒 Router: Authentication expired, redirecting to login')
          await authStore.logout()
          next('/login')
          return
        }
        
        console.warn('⚠️ Router: Using cached permissions due to refresh error')
      }
    }
    
    if (to.meta.permissions && Array.isArray(to.meta.permissions) && isAuthenticated) {
      console.log(`🔒 Router: Checking permissions - Required: ${to.meta.permissions}`)
      console.log(`👤 Router: User permissions: ${authStore.user?.permissions}`)
      
      const hasRequiredPermission = to.meta.permissions.some(permission => 
        authStore.hasPermission(permission as string)
      )
      
      console.log(`🔒 Router: Permission check result: ${hasRequiredPermission}`)
      
      if (!hasRequiredPermission) {
        console.log('🚫 Router: Insufficient permissions, redirecting to dashboard')
        
        // Show alert immediately
        const requiredPerms = (to.meta.permissions as string[]).join(', ')
        
        // Use setTimeout to ensure alert shows after navigation
        setTimeout(() => {
          alert(`Access Denied\n\nYou don't have permission to access this page.`)
        }, 100)
        
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
    console.error('⏱️ Router: Navigation failed:', failure)
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