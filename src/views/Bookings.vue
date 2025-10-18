<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.bookings') }}</h1>
        <p class="text-gray-600 mt-1">Manage laboratory bookings and schedules</p>
      </div>
      
      <button 
        v-if="canCreate"
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
    <div v-else class="space-y-4">
      <div v-if="filteredBookings.length === 0" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p class="text-gray-500">No bookings found</p>
      </div>
      
      <div
        v-for="booking in filteredBookings"
        :key="booking.id"
        class="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-start space-x-4 flex-1">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TestTube class="w-6 h-6 text-blue-600" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3 mb-3">
                <h3 class="text-lg font-semibold text-gray-900">{{ booking.title }}</h3>
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(booking.status)"
                >
                  {{ getStatusText(booking.status) }}
                </span>
              </div>
              
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 flex-shrink-0" />
                  <span>{{ getLabName(booking.labId) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Clock class="w-4 h-4 flex-shrink-0" />
                  <span>{{ formatDateTime(booking.start) }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <User class="w-4 h-4 flex-shrink-0" />
                  <span>{{ booking.requester?.name || 'Unknown' }}</span>
                </div>
              </div>
              
              <p v-if="booking.note" class="text-sm text-gray-500 mt-2">{{ booking.note }}</p>
            </div>
          </div>
          
          <!-- Action Buttons - Horizontal Layout -->
          <div class="flex items-center space-x-2 ml-6 flex-shrink-0">
            <button 
              v-if="booking.status === 'pending' && canApprove"
              class="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              @click="handleApprove(booking.id)"
            >
              Approve
            </button>
            <button 
              v-if="booking.status === 'pending' && canApprove"
              class="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              @click="handleReject(booking.id)"
            >
              Reject
            </button>
            <button 
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              @click="handleDetail(booking.id)"
            >
              Details
            </button>
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

    <!-- Detail Modal -->
    <div 
      v-if="showDetailModal && selectedBookingDetail"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showDetailModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">Booking Details</h3>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors"
            @click="showDetailModal = false"
          >
            <XCircle class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Status Badge -->
          <div class="flex items-center justify-center">
            <span 
              class="px-4 py-2 text-sm font-medium rounded-full"
              :class="getStatusClass(selectedBookingDetail.status)"
            >
              {{ getStatusText(selectedBookingDetail.status) }}
            </span>
          </div>
          
          <!-- Basic Info -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Title</label>
              <p class="text-base font-medium text-gray-900 mt-1">{{ selectedBookingDetail.title }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Laboratory</label>
              <p class="text-base text-gray-900 mt-1">{{ getLabName(selectedBookingDetail.labId) }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500">Start Time</label>
                <p class="text-base text-gray-900 mt-1">{{ formatDateTime(selectedBookingDetail.start) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">End Time</label>
                <p class="text-base text-gray-900 mt-1">{{ formatDateTime(selectedBookingDetail.end) }}</p>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500">Participants</label>
              <p class="text-base text-gray-900 mt-1">{{ selectedBookingDetail.participants }} person(s)</p>
            </div>
          </div>
          
          <!-- Requester Info -->
          <div class="bg-blue-50 rounded-xl p-4">
            <label class="text-sm font-medium text-blue-900 mb-3 block">Requester Information</label>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <User class="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <p class="text-base font-medium text-gray-900">{{ selectedBookingDetail.requester?.name || 'Unknown' }}</p>
                <p class="text-sm text-gray-600">ID: {{ selectedBookingDetail.requester?.id || 'N/A' }}</p>
              </div>
            </div>
          </div>
          
          <!-- Note -->
          <div v-if="selectedBookingDetail.note">
            <label class="text-sm font-medium text-gray-500 block mb-2">Note</label>
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p class="text-base text-gray-900">{{ selectedBookingDetail.note }}</p>
            </div>
          </div>
          
          <!-- Action Buttons in Modal -->
          <div v-if="selectedBookingDetail.status === 'pending' && canApprove" class="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <button 
              class="flex-1 bg-green-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
              @click="handleApproveFromModal(selectedBookingDetail.id)"
            >
              <CheckCircle class="w-5 h-5" />
              <span>Approve Booking</span>
            </button>
            <button 
              class="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              @click="handleRejectFromModal(selectedBookingDetail.id)"
            >
              <XCircle class="w-5 h-5" />
              <span>Reject Booking</span>
            </button>
          </div>
          
          <!-- Close Button -->
          <div class="flex justify-end pt-2">
            <button 
              class="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showDetailModal = false"
            >
              Close
            </button>
          </div>
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
import { useRouter } from 'vue-router'
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
  TestTube,
  Monitor
} from 'lucide-vue-next'
import { useBookingStore } from '@/stores/booking'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import { UserRole } from '@/types'
import type { BookingEvent } from '@/types'
import dayjs from 'dayjs'

const router = useRouter()
const bookingStore = useBookingStore()
const labStore = useLabStore()
const authStore = useAuthStore()

// Reactive data
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedBookingDetail = ref<BookingEvent | null>(null)
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

// Permission-based access control
const canCreate = computed(() => {
  const hasPermission = authStore.hasPermission('BOOKING_CREATE')
  console.log('🔒 BOOKING_CREATE permission:', hasPermission)
  return hasPermission
})

const canApprove = computed(() => {
  const hasPermission = authStore.hasPermission('BOOKING_APPROVE')
  console.log('🔒 BOOKING_APPROVE permission:', hasPermission)
  return hasPermission
})

// Computed properties
const loading = computed(() => bookingStore.loading)
const error = computed(() => bookingStore.error)
const bookings = computed(() => bookingStore.bookings || [])
const labs = computed(() => labStore.labs || [])

const availableLabs = computed(() => {
  return labs.value.filter(lab => lab.status === 'available')
})

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
  try {
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
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
  }
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

const handleDetail = async (id: string) => {
  try {
    console.log('📋 Viewing booking details for ID:', id)
    
    // Try to find booking in local data first
    const localBooking = bookings.value.find(b => b.id === id)
    
    if (localBooking) {
      console.log('✅ Using local booking data')
      selectedBookingDetail.value = localBooking
      showDetailModal.value = true
      return
    }
    
    // If not found locally, fetch from backend
    console.log('📡 Fetching booking from backend')
    const booking = await bookingStore.fetchBookingById(id)
    
    if (booking) {
      selectedBookingDetail.value = booking
      showDetailModal.value = true
      console.log('✅ Booking details loaded from backend')
    } else {
      throw new Error('Booking data is null or undefined')
    }
  } catch (error: any) {
    console.error('❌ Failed to load booking details:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    
    // Try to use local data as fallback
    const fallbackBooking = bookings.value.find(b => b.id === id)
    if (fallbackBooking) {
      console.log('⚠️ Using fallback local data')
      selectedBookingDetail.value = fallbackBooking
      showDetailModal.value = true
      return
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.msg || 
                   error.message || 
                   'Failed to load booking details'
    alert(`Failed to load booking details: ${message}`)
  }
}

const handleApprove = async (id: string) => {
  if (!canApprove.value) {
    alert('You do not have permission to approve bookings')
    return
  }
  
  try {
    console.log('✅ Approving booking:', id)
    await bookingStore.approveBooking(id)
    await fetchBookings()
    console.log('✅ Booking approved successfully')
  } catch (error: any) {
    console.error('❌ Failed to approve booking:', error)
    const message = error.response?.data?.message || error.message || 'Failed to approve booking'
    alert(`Failed to approve booking: ${message}`)
  }
}

const handleReject = async (id: string) => {
  if (!canApprove.value) {
    alert('You do not have permission to reject bookings')
    return
  }
  
  try {
    console.log('❌ Rejecting booking:', id)
    await bookingStore.rejectBooking(id)
    await fetchBookings()
    console.log('✅ Booking rejected successfully')
  } catch (error: any) {
    console.error('❌ Failed to reject booking:', error)
    const message = error.response?.data?.message || error.message || 'Failed to reject booking'
    alert(`Failed to reject booking: ${message}`)
  }
}

const handleApproveFromModal = async (id: string) => {
  if (!canApprove.value) {
    alert('You do not have permission to approve bookings')
    return
  }
  
  try {
    console.log('✅ Approving booking from modal:', id)
    await bookingStore.approveBooking(id)
    await fetchBookings()
    showDetailModal.value = false
    selectedBookingDetail.value = null
    console.log('✅ Booking approved successfully')
  } catch (error: any) {
    console.error('❌ Failed to approve booking:', error)
    const message = error.response?.data?.message || error.message || 'Failed to approve booking'
    alert(`Failed to approve booking: ${message}`)
  }
}

const handleRejectFromModal = async (id: string) => {
  if (!canApprove.value) {
    alert('You do not have permission to reject bookings')
    return
  }
  
  try {
    console.log('❌ Rejecting booking from modal:', id)
    await bookingStore.rejectBooking(id)
    await fetchBookings()
    showDetailModal.value = false
    selectedBookingDetail.value = null
    console.log('✅ Booking rejected successfully')
  } catch (error: any) {
    console.error('❌ Failed to reject booking:', error)
    const message = error.response?.data?.message || error.message || 'Failed to reject booking'
    alert(`Failed to reject booking: ${message}`)
  }
}

const handleCreateBooking = async () => {
  if (!canCreate.value) {
    alert('You do not have permission to create bookings')
    return
  }
  
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
  } catch (error: any) {
    console.error('Failed to create booking:', error)
    const message = error.response?.data?.message || error.message || 'Failed to create booking'
    alert(`Failed to create booking: ${message}`)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  console.log('🚀 Bookings page mounted')
  console.log('👤 Current user:', authStore.user?.name)
  console.log('🔑 User permissions:', authStore.user?.permissions)
  console.log('📋 Permission check:', {
    canCreate: canCreate.value,
    canApprove: canApprove.value
  })
  
  try {
    // Load labs first
    console.log('📡 Loading labs...')
    await labStore.fetchLabs()
    console.log('✅ Labs loaded:', labStore.labs.length)
    
    // Then load bookings
    console.log('📡 Loading bookings...')
    await fetchBookings()
    console.log('✅ Bookings loaded:', bookingStore.bookings.length)
  } catch (error) {
    console.error('❌ Failed to initialize bookings page:', error)
  }
})
</script>