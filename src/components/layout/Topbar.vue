<template>
  <header class="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left side -->
      <div class="flex items-center space-x-4">
        <!-- Mobile menu button -->
        <button
          class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="uiStore.toggleSidebar"
        >
          <Menu class="w-5 h-5" />
        </button>

        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('common.search')"
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 lg:w-80 transition-colors"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-3">
        <!-- Contact admin (desktop only) -->
        <button 
          class="hidden lg:flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          @click="handleContactAdmin"
        >
          <Mail class="w-4 h-4" />
          <span>{{ $t('settings.contact') }}</span>
        </button>

        <!-- Language selector -->
        <div class="relative" data-dropdown="language">
          <button
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            @click.stop="toggleLanguageMenu"
            :title="$t('settings.language')"
          >
            <span class="text-lg select-none">{{ currentLocaleOption.flag }}</span>
            <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" 
                         :class="{ 'rotate-180': showLanguageMenu }" />
          </button>

          <!-- Language dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showLanguageMenu"
              class="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              @click.stop
            >
              <div class="p-1">
                <button
                  v-for="option in LOCALE_OPTIONS"
                  :key="option.value"
                  class="flex items-center space-x-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  :class="{ 
                    'bg-blue-50 text-blue-700 font-medium': currentLocale === option.value,
                    'hover:bg-blue-50': currentLocale !== option.value 
                  }"
                  @click="handleLanguageChange(option.value)"
                >
                  <span class="text-base select-none">{{ option.flag }}</span>
                  <span>{{ option.label }}</span>
                  <CheckIcon v-if="currentLocale === option.value" class="w-4 h-4 ml-auto text-blue-600" />
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Notifications -->
        <div class="relative" data-dropdown="notifications">
          <button
            class="p-2 rounded-lg hover:bg-gray-100 relative transition-colors"
            @click.stop="toggleNotifications"
          >
            <Bell class="w-5 h-5" />
            <span 
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
              @click.stop
            >
              <div class="p-4 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-900">{{ $t('common.notifications') }}</h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 text-sm">
                  {{ $t('common.noNotifications') }}
                </div>
                <div v-else>
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell class="w-4 h-4 text-blue-600" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                        <p class="text-sm text-gray-500 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ notification.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- User menu -->
        <div class="relative" data-dropdown="usermenu">
          <button
            class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            @click.stop="toggleUserMenu"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {{ userInitial }}
            </div>
            <ChevronDown class="w-4 h-4 text-gray-400 transition-transform" 
                         :class="{ 'rotate-180': showUserMenu }" />
          </button>

          <!-- User menu dropdown -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
              @click.stop
            >
              <div class="p-4 border-b border-gray-200">
                <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
                <p class="text-xs text-gray-500">{{ userEmail }}</p>
              </div>
              <div class="p-2">
                <button
                  class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  @click="handleProfile"
                >
                  <User class="w-4 h-4" />
                  <span>{{ $t('user.profile') }}</span>
                </button>
                <button
                  class="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  @click="handleLogout"
                >
                  <LogOut class="w-4 h-4" />
                  <span>{{ $t('auth.logout') }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  Mail,
  Check as CheckIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { LOCALE_OPTIONS, type LocaleType } from '@/locales'

const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const uiStore = useUiStore()

// 响应式状态
const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showLanguageMenu = ref(false)
const unreadCount = ref(2) // Mock unread count

// Mock 通知数据
const notifications = ref([
  {
    id: '1',
    title: 'New Booking Request',
    message: 'John Doe requested to book AI Laboratory',
    time: '2 hours ago'
  },
  {
    id: '2',
    title: 'Equipment Maintenance',
    message: 'NVIDIA RTX 4090 maintenance due soon',
    time: '4 hours ago'
  }
])

// 计算属性
const currentLocale = computed(() => uiStore.locale)

const currentLocaleOption = computed(() => {
  return LOCALE_OPTIONS.find(option => option.value === currentLocale.value) || LOCALE_OPTIONS[0]
})

const userInitial = computed(() => {
  return (authStore.user?.name || 'User').charAt(0).toUpperCase()
})

const userName = computed(() => {
  return authStore.user?.name || 'User'
})

const userEmail = computed(() => {
  return authStore.user?.email || 'user@example.com'
})

// 监听语言变化，同步到 i18n
watch(currentLocale, (newLocale) => {
  locale.value = newLocale
  console.log('🌍 Language changed to:', newLocale)
}, { immediate: true })

// 事件处理函数
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('🔍 Searching for:', searchQuery.value)
    // TODO: 实现全局搜索功能
  }
}

const handleContactAdmin = () => {
  uiStore.addNotification({
    type: 'info',
    title: currentLocale.value === 'en' ? 'Contact Admin' : '联系管理员',
    message: currentLocale.value === 'en' ? 
      'Please email admin@example.com for assistance' : 
      '请发送邮件至 admin@example.com 获取帮助'
  })
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
  showLanguageMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  showLanguageMenu.value = false
}

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
  showNotifications.value = false
  showUserMenu.value = false
}

const handleLanguageChange = (newLocale: LocaleType) => {
  console.log('🌍 Changing language to:', newLocale)
  uiStore.setLocale(newLocale)
  showLanguageMenu.value = false
  
  // 显示切换成功通知
  const localeOption = LOCALE_OPTIONS.find(option => option.value === newLocale)
  uiStore.addNotification({
    type: 'success',
    title: newLocale === 'en' ? 'Language Changed' : '语言已切换',
    message: newLocale === 'en' ? 
      `Switched to ${localeOption?.label}` :
      `已切换到${localeOption?.label}`
  })
}

const handleProfile = () => {
  console.log('👤 Opening profile')
  showUserMenu.value = false
  // TODO: 导航到个人资料页面或打开个人资料模态框
  //router.push('/profile')
}

const handleLogout = async () => {
  console.log('🚪 Logging out...')
  try {
    showUserMenu.value = false
    await authStore.logout()
    console.log('✅ Logout successful, redirecting to login')
    await router.push('/login')
    // 可选：重新加载页面以清除所有状态
     window.location.reload()
  } catch (error) {
    console.error('❌ Logout failed:', error)
    uiStore.addNotification({
      type: 'error',
      title: currentLocale.value === 'en' ? 'Logout Failed' : '登出失败',
      message: currentLocale.value === 'en' ? 
        'Failed to logout. Please try again.' : 
        '登出失败，请重试。'
    })
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  
  const notificationDropdown = target.closest('[data-dropdown="notifications"]')
  const userDropdown = target.closest('[data-dropdown="usermenu"]')
  const languageDropdown = target.closest('[data-dropdown="language"]')
  
  if (!notificationDropdown) {
    showNotifications.value = false
  }
  
  if (!userDropdown) {
    showUserMenu.value = false
  }

  if (!languageDropdown) {
    showLanguageMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  console.log('🔧 Topbar mounted, current locale:', currentLocale.value)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>