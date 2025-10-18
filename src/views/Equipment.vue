<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Equipment Management</h1>
        <p class="text-gray-600 mt-1">Manage laboratory equipment and resources</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          v-if="canManage"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center"
          @click="showBookingModal = true"
        >
          <Calendar class="w-4 h-4 mr-2" />
          Book Equipment
        </button>
        <button 
          v-if="canManage"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center"
          @click="showAddModal = true"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Equipment
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl p-4 border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search equipment by name, model, or ID..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select 
            v-model="selectedStatus" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="fetchEquipment"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="repair">Repair</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Category:</label>
          <select 
            v-model="selectedCategory" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Computing">Computing</option>
            <option value="Networking">Networking</option>
            <option value="IoT">IoT</option>
            <option value="Measurement">Measurement</option>
            <option value="Storage">Storage</option>
            <option value="Instrument">Instrument</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Location:</label>
          <select 
            v-model="selectedLabId" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="fetchEquipment"
          >
            <option value="">All Labs</option>
            <option v-for="lab in labs" :key="lab.id" :value="lab.id">
              {{ lab.name }}
            </option>
          </select>
        </div>
        
        <button 
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <div class="flex items-center">
        <AlertTriangle class="w-5 h-5 text-red-600 mr-2" />
        <p class="text-red-800">{{ error }}</p>
      </div>
      <button 
        class="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        @click="fetchEquipment"
      >
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEquipment.length === 0" class="bg-white rounded-xl p-12 border border-gray-200 text-center">
      <Monitor class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Equipment Found</h3>
      <p class="text-gray-600">{{ searchQuery ? 'Try adjusting your search or filters' : 'No equipment available in the system' }}</p>
    </div>

    <!-- Equipment Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="equipment in filteredEquipment"
        :key="equipment.id"
        class="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden"
      >
        <!-- Equipment Header -->
        <div class="p-5 pb-4">
          <div class="flex items-start space-x-3 mb-3">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <component 
                :is="getCategoryIcon(equipment.type)" 
                class="w-5 h-5 text-gray-600"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 truncate">{{ equipment.name }}</h3>
              <p class="text-sm text-gray-500 truncate">{{ equipment.type }}</p>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div class="mb-4">
            <span 
              class="px-2.5 py-1 text-xs font-medium rounded-md inline-block"
              :class="getStatusClass(equipment.status)"
            >
              {{ getStatusText(equipment.status) }}
            </span>
          </div>
          
          <!-- Equipment Details -->
          <div class="space-y-2 text-sm mb-4">
            <div class="flex justify-between">
              <span class="text-gray-500">ID:</span>
              <span class="font-medium text-gray-900">{{ equipment.code }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-500">Location:</span>
              <span class="text-gray-900 truncate ml-2">{{ getLabName(equipment.labId) }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-500">Category:</span>
              <span class="text-gray-900">{{ equipment.type }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-500">Next Maintenance:</span>
              <span class="text-gray-900">{{ formatDate(equipment.maintainDue) }}</span>
            </div>
          </div>

          <!-- Key Specs Section -->
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="text-xs font-semibold text-gray-700 mb-2">Key Specs</h4>
            <div class="space-y-1 text-xs text-gray-600">
              <div class="flex justify-between">
                <span>Code:</span>
                <span class="font-mono">{{ equipment.code }}</span>
              </div>
              <div class="flex justify-between">
                <span>Status:</span>
                <span class="capitalize">{{ equipment.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="canManage" class="p-4 bg-gray-50 border-t border-gray-100 space-y-2">
          <!-- Quick Book Button -->
          <button 
            class="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            :class="equipment.status === 'available' 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'"
            :disabled="equipment.status !== 'available'"
            @click="quickBookEquipment(equipment)"
          >
            <Calendar class="w-4 h-4 mr-1.5" />
            {{ equipment.status === 'available' ? 'Quick Book' : 'Not Available' }}
          </button>
          
          <!-- Status Toggle Buttons -->
          <div class="grid grid-cols-2 gap-1.5">
            <button 
              class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
              :class="equipment.status === 'available' 
                ? 'bg-green-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="updateEquipmentStatus(equipment.id, 'available')"
            >
              Available
            </button>
            <button 
              class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
              :class="equipment.status === 'borrowed' 
                ? 'bg-orange-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="updateEquipmentStatus(equipment.id, 'borrowed')"
            >
              Borrowed
            </button>
            <button 
              class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
              :class="equipment.status === 'repair' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="updateEquipmentStatus(equipment.id, 'repair')"
            >
              Maintenance
            </button>
            <button 
              class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
              :class="equipment.status === 'offline' 
                ? 'bg-gray-500 text-white' 
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'"
              @click="updateEquipmentStatus(equipment.id, 'offline')"
            >
              Offline
            </button>
          </div>
          
          <button
            class="w-full bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            @click="deleteEquipment(equipment.id)"
          >
            Delete
          </button>
        </div>

        <!-- View-only message for users without manage permission -->
        <div v-else class="p-4 bg-gray-50 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">View-only access</p>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Equipment</p>
            <p class="text-3xl font-bold text-gray-900 mt-1">{{ equipmentStats.total }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Monitor class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Available</p>
            <p class="text-3xl font-bold text-green-600 mt-1">{{ equipmentStats.available }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Borrowed</p>
            <p class="text-3xl font-bold text-orange-600 mt-1">{{ equipmentStats.borrowed }}</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock class="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">In Repair</p>
            <p class="text-3xl font-bold text-red-600 mt-1">{{ equipmentStats.repair }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <Wrench class="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Booking Modal -->
    <div
      v-if="showBookingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeBookingModal"
    >
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">Book Equipment</h2>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeBookingModal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="submitBooking" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Laboratory <span class="text-red-500">*</span>
              </label>
              <select
                v-model="bookingForm.labId"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a laboratory</option>
                <option v-for="lab in labs" :key="lab.id" :value="lab.id">
                  {{ lab.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Booking Title <span class="text-red-500">*</span>
              </label>
              <input
                v-model="bookingForm.title"
                type="text"
                required
                placeholder="e.g., Equipment usage for research project"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="bookingForm.startTime"
                  type="datetime-local"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="bookingForm.endTime"
                  type="datetime-local"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Number of Participants <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="bookingForm.participants"
                type="number"
                min="1"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                v-model="bookingForm.note"
                rows="3"
                placeholder="Any special requirements or notes..."
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeBookingModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="bookingLoading"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {{ bookingLoading ? 'Submitting...' : 'Submit Booking' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Equipment Modal (Placeholder) -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Add Equipment</h2>
        <p class="text-gray-600 mb-4">Add equipment functionality will be implemented here.</p>
        <button
          @click="showAddModal = false"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Monitor, 
  Search, 
  CheckCircle, 
  Clock, 
  Wrench, 
  AlertTriangle,
  Plus,
  Calendar,
  Cpu,
  Wifi,
  Smartphone,
  Activity,
  HardDrive
} from 'lucide-vue-next'
import { api } from '@/api'
import type { Equipment, Lab } from '@/types'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Permission-based access control
const canView = computed(() => authStore.hasPermission('EQUIPMENT_VIEW'))
const canManage = computed(() => authStore.hasPermission('EQUIPMENT_MANAGE'))

// Reactive data
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedLabId = ref('')
const equipment = ref<Equipment[]>([])
const labs = ref<Lab[]>([])
const showBookingModal = ref(false)
const showAddModal = ref(false)
const bookingLoading = ref(false)

// Booking form
const bookingForm = ref({
  labId: '',
  title: '',
  startTime: '',
  endTime: '',
  participants: 1,
  note: '',
  equipmentId: ''
})

// Computed properties
const filteredEquipment = computed(() => {
  return equipment.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = !selectedCategory.value || 
      item.type.toLowerCase().includes(selectedCategory.value.toLowerCase())
    
    return matchesSearch && matchesCategory
  })
})

const equipmentStats = computed(() => {
  const stats = {
    total: equipment.value.length,
    available: 0,
    borrowed: 0,
    repair: 0
  }
  
  equipment.value.forEach(item => {
    if (item.status === 'available') stats.available++
    else if (item.status === 'borrowed') stats.borrowed++
    else if (item.status === 'repair') stats.repair++
  })
  
  return stats
})

// Methods
const fetchEquipment = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params: { labId?: string; status?: string } = {}
    if (selectedLabId.value) params.labId = selectedLabId.value
    if (selectedStatus.value) params.status = selectedStatus.value
    
    const response = await api.equipment.getList(params)
    equipment.value = response.data
    console.log('✅ Equipment loaded:', equipment.value.length)
  } catch (err: any) {
    error.value = err.message || 'Failed to load equipment'
    console.error('❌ Failed to fetch equipment:', err)
  } finally {
    loading.value = false
  }
}

const fetchLabs = async () => {
  try {
    const response = await api.labs.getList()
    labs.value = response.data
  } catch (err) {
    console.error('Failed to fetch labs:', err)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
  selectedLabId.value = ''
  fetchEquipment()
}

const updateEquipmentStatus = async (equipmentId: string, newStatus: string) => {
  if (!canManage.value) {
    alert('You do not have permission to manage equipment')
    return
  }

  try {
    await api.equipment.updateStatus(equipmentId, newStatus)
    await fetchEquipment()
    console.log('✅ Equipment status updated')
  } catch (err: any) {
    error.value = err.message || 'Failed to update equipment status'
    console.error('❌ Failed to update status:', err)
  }
}

const deleteEquipment = async (equipmentId: string) => {
  if (!canManage.value) {
    alert('You do not have permission to delete equipment')
    return
  }

  if (!confirm('Are you sure you want to delete this equipment?')) {
    return
  }
  
  try {
    await api.equipment.delete(equipmentId)
    await fetchEquipment()
    console.log('✅ Equipment deleted')
  } catch (err: any) {
    error.value = err.message || 'Failed to delete equipment'
    console.error('❌ Failed to delete equipment:', err)
  }
}

const quickBookEquipment = (equipmentItem: Equipment) => {
  // Pre-fill the lab ID based on equipment location
  bookingForm.value.labId = equipmentItem.labId
  bookingForm.value.title = `Book ${equipmentItem.name}`
  bookingForm.value.equipmentId = equipmentItem.id
  
  // Set default time (current time + 1 hour to current time + 2 hours)
  const now = new Date()
  const startTime = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour
  const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // +2 hours
  
  bookingForm.value.startTime = formatDatetimeLocal(startTime)
  bookingForm.value.endTime = formatDatetimeLocal(endTime)
  
  showBookingModal.value = true
}

const submitBooking = async () => {
  if (!authStore.user?.id) {
    error.value = 'You must be logged in to book equipment'
    return
  }

  bookingLoading.value = true
  error.value = ''

  try {
    const bookingData = {
      labId: parseInt(bookingForm.value.labId),
      title: bookingForm.value.title,
      start: bookingForm.value.startTime,
      end: bookingForm.value.endTime,
      requesterId: parseInt(authStore.user.id),
      participants: bookingForm.value.participants,
      note: bookingForm.value.note || undefined,
      bookingType: 'equipment' as const,
      equipmentId: bookingForm.value.equipmentId ? parseInt(bookingForm.value.equipmentId) : undefined
    }

    await api.bookings.create(bookingData)
    
    closeBookingModal()
    alert('Equipment booking submitted successfully! Pending approval.')
    console.log('✅ Booking submitted successfully')
    
  } catch (err: any) {
    error.value = err.message || 'Failed to submit booking'
    console.error('❌ Failed to submit booking:', err)
  } finally {
    bookingLoading.value = false
  }
}

const closeBookingModal = () => {
  showBookingModal.value = false
  bookingForm.value = {
    labId: '',
    title: '',
    startTime: '',
    endTime: '',
    participants: 1,
    note: '',
    equipmentId: ''
  }
}

const formatDatetimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-700'
    case 'borrowed':
      return 'bg-orange-100 text-orange-700'
    case 'repair':
      return 'bg-red-100 text-red-700'
    case 'offline':
      return 'bg-gray-100 text-gray-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available'
    case 'borrowed':
      return 'Borrowed'
    case 'repair':
      return 'In Repair'
    case 'offline':
      return 'Offline'
    default:
      return 'Unknown'
  }
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase()
  if (cat.includes('computer') || cat.includes('computing')) return Cpu
  if (cat.includes('network')) return Wifi
  if (cat.includes('iot') || cat.includes('arduino') || cat.includes('raspberry')) return Smartphone
  if (cat.includes('measurement') || cat.includes('instrument')) return Activity
  if (cat.includes('storage')) return HardDrive
  return Monitor
}

const getLabName = (labId: string) => {
  const lab = labs.value.find(l => l.id === labId)
  return lab?.name || `Lab ${labId}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 Equipment page mounted')
  console.log('👤 Current user:', authStore.user?.name)
  console.log('🔑 User permissions:', authStore.user?.permissions)
  console.log('📋 Permission check:', {
    canView: canView.value,
    canManage: canManage.value
  })

  // Permission check: Must have EQUIPMENT_VIEW permission
  if (!canView.value) {
    console.warn('❌ Access denied: User does not have EQUIPMENT_VIEW permission')
    router.push('/dashboard')
    return
  }

  console.log('✅ Permission check passed: EQUIPMENT_VIEW')

  await fetchEquipment()
  await fetchLabs()
})
</script>