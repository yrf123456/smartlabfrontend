<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.dashboard') }}</h1>
      <p class="text-gray-600 mt-1">Welcome back, {{ authStore.user?.name }}</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <template v-else>
      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          v-for="stat in stats"
          :key="stat.title"
          v-bind="stat"
        />
      </div>

      <!-- Quick actions -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            v-for="action in quickActions"
            :key="action.title"
            class="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            @click="action.onClick"
          >
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <component :is="action.icon" class="w-5 h-5 text-primary-600" />
            </div>
            <div class="text-left">
              <p class="font-medium text-gray-900">{{ action.title }}</p>
              <p class="text-sm text-gray-500">{{ action.description }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Charts and activity -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Environment overview -->
        <div class="xl:col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Environment Overview</h2>
            <select 
              v-model="selectedTimeRange"
              class="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div v-if="labsWithEnv.length === 0" class="text-center py-8 text-gray-500">
            No environment data available
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="lab in labsWithEnv"
              :key="lab.id"
              class="p-4 bg-gray-50 rounded-xl"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium text-gray-900">{{ lab.name }}</h3>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(lab.status)"
                >
                  {{ getStatusText(lab.status) }}
                </span>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="text-center">
                  <p class="text-xs text-gray-500">Temperature</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ lab.env.temp !== null ? lab.env.temp.toFixed(1) : 'N/A' }}°C
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">Humidity</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ lab.env.hum !== null ? lab.env.hum.toFixed(0) : 'N/A' }}%
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">PM2.5</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ lab.env.pm25 !== null ? lab.env.pm25.toFixed(0) : 'N/A' }}μg/m³
                  </p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">Noise</p>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ lab.env.noise !== null ? lab.env.noise.toFixed(0) : 'N/A' }}dB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent activity -->
        <div class="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          
          <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-500">
            No recent activities
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="(activity, index) in recentActivities"
              :key="index"
              class="flex items-start space-x-3"
            >
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <component :is="getActivityIcon(activity.icon)" class="w-4 h-4 text-primary-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
                <p class="text-sm text-gray-500">{{ activity.description }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
          
          <button 
            class="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            @click="router.push('/bookings')"
          >
            View All Activities
          </button>
        </div>
      </div>

      <!-- Pending approvals (admin only) -->
      <div
        v-if="authStore.hasRole('SYS_ADMIN') || authStore.hasRole('DEPT_ADMIN')"
        class="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <router-link 
            to="/bookings"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </router-link>
        </div>
        
        <div v-if="pendingApprovals.length === 0" class="text-center py-8">
          <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p class="text-gray-500">No pending approvals</p>
        </div>
        
        <div v-else class="space-y-3">
          <div
            v-for="approval in pendingApprovals"
            :key="approval.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <div class="flex items-center space-x-3">
              <img 
                :src="approval.requester.avatarUrl || 'https://via.placeholder.com/64'"
                :alt="approval.requester.name"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ approval.title }}</p>
                <p class="text-xs text-gray-500">
                  {{ approval.requester.name }} · {{ approval.time }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
                @click="handleApprove(approval.id)"
              >
                Approve
              </button>
              <button 
                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                @click="handleReject(approval.id)"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  CheckCircle,
  TestTube,
  Clock,
  Key,
  XCircle
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/ui/StatCard.vue'
import { api } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const selectedTimeRange = ref('24h')

const stats = ref([
  {
    title: 'Today\'s Bookings',
    value: 0,
    trend: 0,
    hint: 'vs yesterday',
    icon: 'Calendar'
  },
  {
    title: 'Equipment Availability',
    value: '0%',
    trend: 0,
    hint: 'vs last week',
    icon: 'Monitor'
  },
  {
    title: 'Alert Count',
    value: 0,
    trend: 0,
    hint: 'vs yesterday',
    icon: 'AlertTriangle'
  },
  {
    title: 'Weekly Usage',
    value: '0%',
    trend: 0,
    hint: 'vs last week',
    icon: 'TrendingUp'
  }
])

const quickActions = [
  {
    title: 'Create Booking',
    description: 'Book laboratory usage',
    icon: Calendar,
    onClick: () => router.push('/bookings')
  },
  {
    title: 'Post Announcement',
    description: 'Publish system announcement',
    icon: FileText,
    onClick: () => console.log('Post announcement')
  },
  {
    title: 'View Approvals',
    description: 'Handle pending approvals',
    icon: MessageSquare,
    onClick: () => router.push('/bookings')
  }
]

const labsWithEnv = ref<any[]>([])
const recentActivities = ref<any[]>([])
const pendingApprovals = ref<any[]>([])

const getActivityIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    TestTube,
    CheckCircle,
    Key,
    Clock,
    XCircle
  }
  return iconMap[iconName] || TestTube
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'maintenance':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return 'Normal'
    case 'warning':
      return 'Warning'
    case 'maintenance':
      return 'Maintenance'
    default:
      return 'Unknown'
  }
}

const fetchDashboardData = async () => {
  try {
    loading.value = true

    // Fetch stats
    const statsResponse = await api.dashboard.getStats()
    if (statsResponse.code === 0 && statsResponse.data) {
      stats.value = [
        {
          title: 'Today\'s Bookings',
          value: statsResponse.data.todayBookings,
          trend: statsResponse.data.todayBookingsTrend,
          hint: 'vs yesterday',
          icon: 'Calendar'
        },
        {
          title: 'Equipment Availability',
          value: statsResponse.data.equipmentAvailability,
          trend: statsResponse.data.equipmentAvailabilityTrend,
          hint: 'vs last week',
          icon: 'Monitor'
        },
        {
          title: 'Alert Count',
          value: statsResponse.data.alertCount,
          trend: statsResponse.data.alertCountTrend,
          hint: 'vs yesterday',
          icon: 'AlertTriangle'
        },
        {
          title: 'Weekly Usage',
          value: statsResponse.data.weeklyUsage,
          trend: statsResponse.data.weeklyUsageTrend,
          hint: 'vs last week',
          icon: 'TrendingUp'
        }
      ]
    }

    // Fetch labs environment data
    const labsEnvResponse = await api.dashboard.getLabsEnv()
    if (labsEnvResponse.code === 0 && labsEnvResponse.data) {
      labsWithEnv.value = labsEnvResponse.data
    }

    // Fetch recent activities
    const activitiesResponse = await api.dashboard.getActivities()
    if (activitiesResponse.code === 0 && activitiesResponse.data) {
      recentActivities.value = activitiesResponse.data
    }

    // Fetch pending approvals (only for admins)
    if (authStore.hasRole('SYS_ADMIN') || authStore.hasRole('DEPT_ADMIN')) {
      const approvalsResponse = await api.dashboard.getPendingApprovals()
      if (approvalsResponse.code === 0 && approvalsResponse.data) {
        pendingApprovals.value = approvalsResponse.data
      }
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

const handleApprove = async (id: string) => {
  try {
    await api.bookings.approve(id)
    // Refresh pending approvals
    await fetchDashboardData()
  } catch (error) {
    console.error('Failed to approve booking:', error)
  }
}

const handleReject = async (id: string) => {
  try {
    await api.bookings.reject(id)
    // Refresh pending approvals
    await fetchDashboardData()
  } catch (error) {
    console.error('Failed to reject booking:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>