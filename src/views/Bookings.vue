<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.bookings') }}</h1>
        <p class="text-gray-600 mt-1">Manage laboratory bookings and schedules</p>
      </div>
      
      <button 
        class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
        @click="showCreateModal = true"
      >
        <Plus class="w-4 h-4 inline mr-2" />
        New Booking
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select 
            v-model="selectedStatus" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Laboratory:</label>
          <select 
            v-model="selectedLab" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Labs</option>
            <option value="ai-lab">AI Laboratory</option>
            <option value="iot-lab">IoT Laboratory</option>
            <option value="cloud-lab">Cloud Computing Lab</option>
            <option value="network-lab">Network Security Lab</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Date:</label>
          <input 
            v-model="selectedDate"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
        </div>
        
        <button 
          class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Bookings List -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Recent Bookings</h2>
      </div>
      
      <div class="divide-y divide-gray-200">
        <div
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <component :is="getLabIcon(booking.laboratory)" class="w-6 h-6 text-primary-600" />
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-lg font-medium text-gray-900">{{ booking.title }}</h3>
                  <span 
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClass(booking.status)"
                  >
                    {{ getStatusText(booking.status) }}
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div class="flex items-center space-x-2">
                    <MapPin class="w-4 h-4" />
                    <span>{{ booking.laboratory }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Clock class="w-4 h-4" />
                    <span>{{ booking.date }} {{ booking.time }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <User class="w-4 h-4" />
                    <span>{{ booking.requester }}</span>
                  </div>
                </div>
                
                <p class="text-sm text-gray-500 mt-2">{{ booking.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                v-if="booking.status === 'pending'"
                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                @click="approveBooking(booking.id)"
              >
                Approve
              </button>
              <button 
                v-if="booking.status === 'pending'"
                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                @click="rejectBooking(booking.id)"
              >
                Reject
              </button>
              <button 
                class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                @click="viewDetails(booking.id)"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Bookings</p>
            <p class="text-2xl font-bold text-gray-900">{{ bookingStats.total }}</p>
          </div>
          <Calendar class="w-8 h-8 text-primary-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-yellow-600">{{ bookingStats.pending }}</p>
          </div>
          <Clock class="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Approved</p>
            <p class="text-2xl font-bold text-green-600">{{ bookingStats.approved }}</p>
          </div>
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">This Week</p>
            <p class="text-2xl font-bold text-blue-600">{{ bookingStats.thisWeek }}</p>
          </div>
          <TrendingUp class="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </div>

    <!-- Create Booking Modal -->
    <div 
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCreateModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Booking</h3>
        
        <form @submit.prevent="createBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              v-model="newBooking.title"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter booking title"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
            <select 
              v-model="newBooking.laboratory"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Laboratory</option>
              <option value="AI Laboratory">AI Laboratory</option>
              <option value="IoT Laboratory">IoT Laboratory</option>
              <option value="Cloud Computing Lab">Cloud Computing Lab</option>
              <option value="Network Security Lab">Network Security Lab</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                v-model="newBooking.date"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input 
                v-model="newBooking.time"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="newBooking.description"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter booking description"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Create Booking
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showCreateModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  TrendingUp,
  Monitor,
  Cpu,
  Cloud,
  Shield
} from 'lucide-vue-next'

// Reactive data
const selectedStatus = ref('')
const selectedLab = ref('')
const selectedDate = ref('')
const showCreateModal = ref(false)

const newBooking = ref({
  title: '',
  laboratory: '',
  date: '',
  time: '',
  description: ''
})

const bookings = ref([
  {
    id: '1',
    title: 'Machine Learning Research Session',
    laboratory: 'AI Laboratory',
    date: '2025-09-22',
    time: '09:00-12:00',
    requester: 'John Smith',
    status: 'pending',
    description: 'Deep learning model training for computer vision project'
  },
  {
    id: '2',
    title: 'IoT Device Testing',
    laboratory: 'IoT Laboratory',
    date: '2025-09-22',
    time: '14:00-17:00',
    requester: 'Sarah Johnson',
    status: 'approved',
    description: 'Testing sensor network connectivity and data transmission'
  },
  {
    id: '3',
    title: 'Cloud Infrastructure Setup',
    laboratory: 'Cloud Computing Lab',
    date: '2025-09-23',
    time: '10:00-15:00',
    requester: 'Mike Chen',
    status: 'approved',
    description: 'Setting up Kubernetes cluster for distributed computing research'
  },
  {
    id: '4',
    title: 'Network Security Analysis',
    laboratory: 'Network Security Lab',
    date: '2025-09-23',
    time: '16:00-18:00',
    requester: 'Emily Davis',
    status: 'pending',
    description: 'Penetration testing and vulnerability assessment'
  },
  {
    id: '5',
    title: 'AI Model Deployment',
    laboratory: 'AI Laboratory',
    date: '2025-09-24',
    time: '13:00-16:00',
    requester: 'Alex Wilson',
    status: 'completed',
    description: 'Deploying trained models to production environment'
  },
  {
    id: '6',
    title: 'Hardware Performance Testing',
    laboratory: 'IoT Laboratory',
    date: '2025-09-24',
    time: '09:00-11:00',
    requester: 'Lisa Brown',
    status: 'rejected',
    description: 'Testing embedded systems performance under load'
  }
])

const bookingStats = ref({
  total: 24,
  pending: 5,
  approved: 12,
  thisWeek: 8
})

// Computed properties
const filteredBookings = computed(() => {
  return bookings.value.filter(booking => {
    if (selectedStatus.value && booking.status !== selectedStatus.value) return false
    if (selectedLab.value && !booking.laboratory.toLowerCase().includes(selectedLab.value.toLowerCase())) return false
    if (selectedDate.value && booking.date !== selectedDate.value) return false
    return true
  })
})

// Methods
const clearFilters = () => {
  selectedStatus.value = ''
  selectedLab.value = ''
  selectedDate.value = ''
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'completed':
      return 'Completed'
    default:
      return 'Unknown'
  }
}

const getLabIcon = (laboratory: string) => {
  if (laboratory.includes('AI')) return Cpu
  if (laboratory.includes('IoT')) return Monitor
  if (laboratory.includes('Cloud')) return Cloud
  if (laboratory.includes('Security')) return Shield
  return Monitor
}

const approveBooking = (id: string) => {
  const booking = bookings.value.find(b => b.id === id)
  if (booking) {
    booking.status = 'approved'
    bookingStats.value.pending--
    bookingStats.value.approved++
  }
}

const rejectBooking = (id: string) => {
  const booking = bookings.value.find(b => b.id === id)
  if (booking) {
    booking.status = 'rejected'
    bookingStats.value.pending--
  }
}

const viewDetails = (id: string) => {
  console.log('View details for booking:', id)
}

const createBooking = () => {
  const booking = {
    id: Date.now().toString(),
    ...newBooking.value,
    requester: 'Current User',
    status: 'pending'
  }
  
  bookings.value.unshift(booking)
  bookingStats.value.total++
  bookingStats.value.pending++
  bookingStats.value.thisWeek++
  
  // Reset form
  newBooking.value = {
    title: '',
    laboratory: '',
    date: '',
    time: '',
    description: ''
  }
  
  showCreateModal.value = false
}

onMounted(() => {
  // Load bookings data
})
</script>