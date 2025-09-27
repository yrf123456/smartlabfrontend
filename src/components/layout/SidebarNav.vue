<template>
  <nav class="w-64 bg-white h-full shadow-sm border-r border-gray-200 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Beaker class="w-5 h-5 text-white" />
        </div>
        <h1 class="text-lg font-semibold text-gray-900">Smart Lab</h1>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-1">
        <router-link
          v-for="item in visibleMenuItems"
          :key="item.name"
          :to="item.path"
          class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
          :class="{
            'bg-primary-50 text-primary-600 border border-primary-200': isActiveRoute(item.path),
            'text-gray-700 hover:bg-gray-50': !isActiveRoute(item.path)
          }"
          @click="uiStore.closeSidebar"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ $t(item.title) }}</span>
        </router-link>
      </div>

      <!-- Mobile-only contact admin -->
      <div class="lg:hidden p-4 border-t border-gray-200 mt-4">
        <button 
          class="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:bg-gray-50 w-full"
          @click="handleContactAdmin"
        >
          <Mail class="w-5 h-5" />
          <span>{{ $t('settings.contact') }}</span>
        </button>
      </div>
    </div>

    <!-- User info -->
    <div class="p-4 border-t border-gray-200">
      <div v-if="authStore.user" class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {{ (authStore.user?.name || 'U').charAt(0).toUpperCase() }}
            </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user.name }}</p>
          <p class="text-xs text-gray-500 truncate">{{ authStore.user.email }}</p>
        </div>
        <div class="flex items-center">
          <span
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="getRoleClass(authStore.user.roles[0])"
          >
            {{ getRoleText(authStore.user.roles[0]) }}
          </span>
        </div>
      </div>
      
      <!-- Loading state for user info -->
      <div v-else class="flex items-center space-x-3 animate-pulse">
        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-3 bg-gray-200 rounded mb-1"></div>
          <div class="h-2 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard, 
  TestTube, 
  Calendar, 
  Monitor, 
  Thermometer, 
  FolderKanban, 
  Users, 
  FileBarChart, 
  Settings,
  Beaker,
  Mail
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { UserRole } from '@/types'

const route = useRoute()
const authStore = useAuthStore()
const uiStore = useUiStore()

const menuItems = [
  {
    name: 'dashboard',
    path: '/dashboard',
    title: 'nav.dashboard',
    icon: LayoutDashboard,
    roles: []
  },
  {
    name: 'labs',
    path: '/labs',
    title: 'nav.labs',
    icon: TestTube,
    roles: []
  },
  {
    name: 'bookings',
    path: '/bookings',
    title: 'nav.bookings',
    icon: Calendar,
    roles: []
  },
  {
    name: 'equipment',
    path: '/equipment',
    title: 'nav.equipment',
    icon: Monitor,
    roles: []
  },
  {
    name: 'environment',
    path: '/environment',
    title: 'nav.environment',
    icon: Thermometer,
    roles: []
  },
  {
    name: 'projects',
    path: '/projects',
    title: 'nav.projects',
    icon: FolderKanban,
    roles: []
  },
  {
    name: 'users',
    path: '/users',
    title: 'nav.users',
    icon: Users,
    roles: [UserRole.SYSTEM_ADMIN, UserRole.DEPARTMENT_ADMIN]
  },
  {
    name: 'reports',
    path: '/reports',
    title: 'nav.reports',
    icon: FileBarChart,
    roles: []
  },
  {
    name: 'settings',
    path: '/settings',
    title: 'nav.settings',
    icon: Settings,
    roles: [UserRole.SYSTEM_ADMIN]
  }
]

const visibleMenuItems = computed(() => {
  if (!authStore.user) {
    console.log('📄 No user found, showing no menu items')
    return []
  }
  
  console.log('📄 Recalculating visible menu items for user:', authStore.user.name)
  console.log('👤 User roles:', authStore.user.roles)
  
  return menuItems.filter(item => {
    if (item.roles.length === 0) return true
    
    const hasRole = item.roles.some(role => authStore.hasRole(role))
    console.log(`📋 Menu item "${item.name}": hasRole=${hasRole}, required roles:`, item.roles)
    return hasRole
  })
})

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const getRoleClass = (role: UserRole | string) => {
  const roleStr = role.toString()
  switch (roleStr) {
    case UserRole.SYSTEM_ADMIN:
      return 'bg-red-100 text-red-800'
    case UserRole.DEPARTMENT_ADMIN:
      return 'bg-blue-100 text-blue-800'
    case UserRole.TEACHER:
      return 'bg-green-100 text-green-800'
    case UserRole.STUDENT:
      return 'bg-yellow-100 text-yellow-800'
    case UserRole.VISITOR:
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRoleText = (role: UserRole | string) => {
  const roleStr = role.toString()
  switch (roleStr) {
    case UserRole.SYSTEM_ADMIN:
      return 'SYS_Admin'
    case UserRole.DEPARTMENT_ADMIN:
      return 'DEP_Admin'
    case UserRole.TEACHER:
      return 'TEACHER'
    case UserRole.STUDENT:
      return 'STUDENT'
    case UserRole.VISITOR:
      return 'VISITOR'
    default:
      return roleStr
  }
}

const handleContactAdmin = () => {
  uiStore.addNotification({
    type: 'info',
    title: 'Contact admin',
    message: 'Please email admin@example.com for assistance'
  })
}

watch(
  () => authStore.user,
  (newUser, oldUser) => {
    if (newUser && newUser !== oldUser) {
      console.log('👤 User updated in sidebar:', newUser.name)
      console.log('👥 User roles:', newUser.roles)
      console.log('📄 Menu items will be recalculated')
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => authStore.isAuthenticated,
  (isAuth, wasAuth) => {
    console.log(`🔐 Auth status changed in sidebar: ${wasAuth} → ${isAuth}`)
    if (isAuth && !wasAuth) {
      console.log('✅ User authenticated, menu will be visible')
    } else if (!isAuth && wasAuth) {
      console.log('⛔ User unauthenticated, menu will be hidden')
    }
  },
  { immediate: true }
)

watch(
  () => route.path,
  (newPath, oldPath) => {
    console.log(`🧭 Route changed in sidebar: ${oldPath} → ${newPath}`)
  }
)

onMounted(() => {
  console.log('🔧 Sidebar mounted')
  console.log('👤 Initial user:', authStore.user?.name)
  console.log('🔐 Initial auth status:', authStore.isAuthenticated)
  console.log('📋 Initial menu items count:', visibleMenuItems.value.length)
})

if (import.meta.env.DEV) {
  ;(window as any).debugSidebar = () => {
    console.log('🛠 Sidebar Debug Info:')
    console.log('  - User:', authStore.user)
    console.log('  - Authenticated:', authStore.isAuthenticated)
    console.log('  - Visible menu items:', visibleMenuItems.value.length)
    console.log('  - Current route:', route.path)
    console.log('  - Menu items:', visibleMenuItems.value.map(item => ({
      name: item.name,
      path: item.path,
      active: isActiveRoute(item.path)
    })))
  }
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.router-link-active,
.router-link-exact-active {
  transition: all 0.2s ease;
}

.role-badge {
  transition: all 0.2s ease;
}

img {
  transition: opacity 0.2s ease;
}

img[src=""] {
  opacity: 0;
}
</style>