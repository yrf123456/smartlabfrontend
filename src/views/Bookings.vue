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
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Laboratory:</label>
          <select 
            v-model="selectedLabId" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            @change="fetchBookings"
          >
            <option value="">All Labs</option>
            <option v-for="lab in labs" :key="lab.id" :value="lab.id">
              {{ lab.name }}
            </option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Date Range:</label>
          <input 
            v-model="dateFrom"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            @change="fetchBookings"
          >
          <span class="text-gray-500">to</span>
          <input 
            v-model="dateTo"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            @change="fetchBookings"
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

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-red-900 mb-2">Error Loading Bookings</h3>
        <p class="text-red-700 mb-4">{{ error }}</p>
        <button
          @click="fetchBookings"
          class="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <!-- Bookings List -->
    <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ filteredBookings.length }} Booking(s)
        </h2>
      </div>
      
      <div v-if="filteredBookings.length === 0" class="text-center py-12">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500">No bookings found</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="booking in filteredBookings"
          :key="booking.id"
          class="p-6 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-start space-x-4 flex-1">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TestTube class="w-6 h-6 text-primary-600" />
              </div>
              
              <div class="flex-1 min-w-0">
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
                    <MapPin class="w-4 h-4 flex-shrink-0" />
                    <span>{{ getLabName(booking.labId) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Clock class="w-4 h-4 flex-shrink-0" />
                    <span>{{ formatDateTime(booking.start) }} - {{ formatTime(booking.end) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <Users class="w-4 h-4 flex-shrink-0" />
                    <span>{{ booking.participants }} participant(s)</span>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                  <User class="w-4 h-4 flex-shrink-0" />
                  <span>{{ booking.requester?.name || 'Unknown' }}</span>
                </div>
                
                <p v-if="booking.note" class="text-sm text-gray-500 mt-2">{{ booking.note }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2 ml-4">
              <button 
                v-if="booking.status === 'pending' && canApprove"
                class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                @click="handleApprove(booking.id)"
              >
                Approve
              </button>
              <button 
                v-if="booking.status === 'pending' && canApprove"
                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                @click="handleReject(booking.id)"
              >
                Reject
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
            <p class="text-sm font-medium text-gray-600">Rejected</p>
            <p class="text-2xl font-bold text-red-600">{{ bookingStats.rejected }}</p>
          </div>
          <XCircle class="w-8 h-8 text-red-600" />
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
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Booking</h3>
        
        <form @submit.prevent="handleCreateBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Title <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="newBooking.title"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter booking title"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Laboratory <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="newBooking.labId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Laboratory</option>
              <option v-for="lab in availableLabs" :key="lab.id" :value="lab.id">
                {{ lab.name }} ({{ lab.location }})
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="newBooking.startDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="newBooking.startTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Date <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="newBooking.endDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                End Time <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="newBooking.endTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Participants <span class="text-red-500">*</span>
            </label>
            <input 
              v-model.number="newBooking.participants"
              type="number" 
              min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Number of participants"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea 
              v-model="newBooking.note"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter booking note (optional)"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              :disabled="submitting"
              class="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Creating...' : 'Create Booking' }}
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
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  TestTube
} from 'lucide-vue-next'
import { useBookingStore } from '@/stores/booking'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const bookingStore = useBookingStore()
const labStore = useLabStore()
const authStore = useAuthStore()

// Reactive data
const showCreateModal = ref(false)
const selectedStatus = ref('')
const selectedLabId = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const submitting = ref(false)

const newBooking = ref({
  title: '',
  labId: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  participants: 1,
  note: ''
})

// Computed properties
const loading = computed(() => bookingStore.loading)
const error = computed(() => bookingStore.error)
const bookings = computed(() => bookingStore.bookings)
const labs = computed(() => labStore.labs)

const availableLabs = computed(() => {
  return labs.value.filter(lab => lab.status === 'available')
})

const canApprove = computed(() => 
  authStore.hasRole('SYS_ADMIN') || 
  authStore.hasRole('DEPT_ADMIN')
)

const filteredBookings = computed(() => {
  let result = bookings.value

  if (selectedStatus.value) {
    result = result.filter(b => b.status === selectedStatus.value)
  }

  return result
})

const bookingStats = computed(() => {
  return {
    total: bookings.value.length,
    pending: bookings.value.filter(b => b.status === 'pending').length,
    approved: bookings.value.filter(b => b.status === 'approved').length,
    rejected: bookings.value.filter(b => b.status === 'rejected').length
  }
})

// Methods
const fetchBookings = async () => {
  const params: any = {}
  
  if (selectedLabId.value) {
    params.labId = selectedLabId.value
  }
  
  if (dateFrom.value) {
    params.from = dayjs(dateFrom.value).startOf('day').toISOString()
  }
  
  if (dateTo.value) {
    params.to = dayjs(dateTo.value).endOf('day').toISOString()
  }
  
  await bookingStore.fetchBookings(params)
}

const clearFilters = () => {
  selectedStatus.value = ''
  selectedLabId.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  fetchBookings()
}

const getLabName = (labId: string) => {
  const lab = labs.value.find(l => l.id === labId)
  return lab?.name || 'Unknown Lab'
}

const formatDateTime = (isoString: string) => {
  return dayjs(isoString).format('YYYY-MM-DD HH:mm')
}

const formatTime = (isoString: string) => {
  return dayjs(isoString).format('HH:mm')
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
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
    default:
      return 'Unknown'
  }
}

const handleApprove = async (id: string) => {
  try {
    await bookingStore.approveBooking(id)
    await fetchBookings()
  } catch (error) {
    console.error('Failed to approve booking:', error)
  }
}

const handleReject = async (id: string) => {
  try {
    await bookingStore.rejectBooking(id)
    await fetchBookings()
  } catch (error) {
    console.error('Failed to reject booking:', error)
  }
}

const handleCreateBooking = async () => {
  try {
    submitting.value = true
    
    // Combine date and time
    const start = dayjs(`${newBooking.value.startDate} ${newBooking.value.startTime}`).toISOString()
    const end = dayjs(`${newBooking.value.endDate} ${newBooking.value.endTime}`).toISOString()
    
    const bookingData = {
      labId: Number(newBooking.value.labId),
      title: newBooking.value.title,
      start,
      end,
      requesterId: Number(authStore.user?.id),
      participants: newBooking.value.participants,
      note: newBooking.value.note
    }
    
    await bookingStore.createBooking(bookingData)
    
    // Reset form
    newBooking.value = {
      title: '',
      labId: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      participants: 1,
      note: ''
    }
    
    showCreateModal.value = false
    await fetchBookings()
  } catch (error) {
    console.error('Failed to create booking:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  // Load labs first
  await labStore.fetchLabs()
  // Then load bookings
  await fetchBookings()
})
</script>