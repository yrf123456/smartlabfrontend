<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.dashboard') }}</h1>
      <p class="text-gray-600 mt-1">Welcome back, {{ authStore.user?.name }}</p>
    </div>

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
        
        <div class="space-y-4">
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
                <p class="text-sm font-semibold text-gray-900">{{ lab.env.temp }}°C</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">Humidity</p>
                <p class="text-sm font-semibold text-gray-900">{{ lab.env.hum }}%</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">PM2.5</p>
                <p class="text-sm font-semibold text-gray-900">{{ lab.env.pm25 }}μg/m³</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">Noise</p>
                <p class="text-sm font-semibold text-gray-900">{{ lab.env.noise }}dB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-start space-x-3"
          >
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <component :is="activity.icon" class="w-4 h-4 text-primary-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ activity.title }}</p>
              <p class="text-sm text-gray-500">{{ activity.description }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
        
        <button class="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
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
              :src="approval.requester.avatarUrl"
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
            <button class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200">
              Approve
            </button>
            <button class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  CheckCircle,
  TestTube,
  Clock,
  Key
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import StatCard from '@/components/ui/StatCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const selectedTimeRange = ref('24h')

const stats = ref([
  {
    title: 'Today\'s Bookings',
    value: 12,
    trend: 8,
    hint: 'vs yesterday',
    icon: 'Calendar'
  },
  {
    title: 'Equipment Availability',
    value: '92%',
    trend: 2,
    hint: 'vs last week',
    icon: 'Monitor'
  },
  {
    title: 'Alert Count',
    value: 3,
    trend: -5,
    hint: 'vs yesterday',
    icon: 'AlertTriangle'
  },
  {
    title: 'Weekly Usage',
    value: '78%',
    trend: 12,
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

const labsWithEnv = ref([
  {
    id: '1',
    name: 'AI Laboratory',
    status: 'normal',
    env: {
      temp: 23.5,
      hum: 55,
      pm25: 12,
      noise: 38
    }
  },
  {
    id: '2',
    name: 'IoT Laboratory',
    status: 'warning',
    env: {
      temp: 26.8,
      hum: 72,
      pm25: 18,
      noise: 42
    }
  },
  {
    id: '3',
    name: 'Cloud Computing Laboratory',
    status: 'maintenance',
    env: {
      temp: 22.1,
      hum: 48,
      pm25: 8,
      noise: 35
    }
  }
])

const recentActivities = ref([
  {
    id: '1',
    title: 'New Booking Request',
    description: 'John Smith requested AI Laboratory booking',
    time: '2 hours ago',
    icon: TestTube
  },
  {
    id: '2',
    title: 'Equipment Status Update',
    description: 'NVIDIA RTX 4090 maintenance completed',
    time: '4 hours ago',
    icon: CheckCircle
  },
  {
    id: '3',
    title: 'Access Log',
    description: 'Jane Doe entered IoT Laboratory',
    time: '6 hours ago',
    icon: Key
  },
  {
    id: '4',
    title: 'Booking Approval',
    description: 'Mike Johnson\'s booking request approved',
    time: '8 hours ago',
    icon: Clock
  }
])

const pendingApprovals = ref([
  {
    id: '1',
    title: 'AI Laboratory Usage Request',
    requester: {
      name: 'John Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    time: '2 hours ago'
  },
  {
    id: '2',
    title: 'Cloud Computing Lab Maintenance Request',
    requester: {
      name: 'Jane Doe',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    time: '4 hours ago'
  }
])

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

onMounted(() => {
  // Fetch dashboard data
})
</script>