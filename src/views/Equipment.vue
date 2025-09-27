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
          class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="showBookModal = true"
        >
          <Plus class="w-4 h-4 inline mr-2" />
          Book Equipment
        </button>
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          @click="showAddModal = true"
        >
          <Plus class="w-4 h-4 inline mr-2" />
          Add Equipment
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-2xl p-6 border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search equipment by name, model, or ID..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Status:</label>
          <select 
            v-model="selectedStatus" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Category:</label>
          <select 
            v-model="selectedCategory" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            <option value="computing">Computing</option>
            <option value="networking">Networking</option>
            <option value="iot">IoT Devices</option>
            <option value="measurement">Measurement</option>
            <option value="storage">Storage</option>
          </select>
        </div>
        
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-gray-700">Location:</label>
          <select 
            v-model="selectedLocation" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Labs</option>
            <option value="ai-lab">AI Laboratory</option>
            <option value="iot-lab">IoT Laboratory</option>
            <option value="cloud-lab">Cloud Computing Lab</option>
            <option value="network-lab">Network Security Lab</option>
          </select>
        </div>
        
        <button 
          class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          @click="clearFilters"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Equipment Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="equipment in filteredEquipment"
        :key="equipment.id"
        class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <!-- Equipment Header -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <component 
              :is="getCategoryIcon(equipment.category)" 
              class="w-5 h-5 text-gray-600"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-gray-900 truncate">{{ equipment.name }}</h3>
            <p class="text-sm text-gray-500 truncate">{{ equipment.model }}</p>
          </div>
        </div>
        
        <!-- Status -->
        <div class="mb-4">
          <span 
            class="px-3 py-1 text-sm font-medium rounded-full inline-block"
            :class="getStatusClass(equipment.status)"
          >
            {{ getStatusText(equipment.status) }}
          </span>
        </div>
        
        <!-- Equipment Info -->
        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <div class="flex items-center justify-between">
            <span>ID:</span>
            <span class="font-mono">{{ equipment.id }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span>Location:</span>
            <span class="truncate ml-1">{{ equipment.location }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span>Category:</span>
            <span class="capitalize">{{ equipment.category }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span>Last Maintenance:</span>
            <span>{{ equipment.lastMaintenance }}</span>
          </div>
        </div>
        
        <!-- Key Specifications -->
        <div v-if="equipment.specifications" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Key Specs</h4>
          <div class="space-y-1 text-xs text-gray-600">
            <div 
              v-for="(value, key, index) in equipment.specifications" 
              :key="key"
              v-show="index < 2"
              class="flex justify-between"
            >
              <span class="capitalize">{{ key.replace(/([A-Z])/g, ' $1').trim() }}:</span>
              <span>{{ value }}</span>
            </div>
          </div>
        </div>
        
        <!-- Quick Book Button -->
        <div class="mb-3">
          <button 
            class="w-full bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            :disabled="equipment.status !== 'available'"
            @click="quickBookEquipment(equipment)"
          >
            <Calendar class="w-4 h-4 inline mr-1" />
            {{ equipment.status === 'available' ? 'Quick Book' : 'Not Available' }}
          </button>
        </div>
        
        <!-- Status Toggle Buttons -->
        <div class="grid grid-cols-2 gap-1 mb-3">
          <button 
            class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
            :class="equipment.status === 'available' 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
            @click="setEquipmentStatus(equipment.id, 'available')"
          >
            Available
          </button>
          <button 
            class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
            :class="equipment.status === 'in-use' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
            @click="setEquipmentStatus(equipment.id, 'in-use')"
          >
            In Use
          </button>
          <button 
            class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
            :class="equipment.status === 'maintenance' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
            @click="setEquipmentStatus(equipment.id, 'maintenance')"
          >
            Maintenance
          </button>
          <button 
            class="py-1.5 px-2 rounded text-xs font-medium transition-colors"
            :class="equipment.status === 'offline' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
            @click="setEquipmentStatus(equipment.id, 'offline')"
          >
            Offline
          </button>
        </div>
        
        <!-- Delete Button -->
        <button
          class="w-full bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          @click="onDelete(equipment.id)"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Equipment</p>
            <p class="text-2xl font-bold text-gray-900">{{ equipmentStats.total }}</p>
          </div>
          <Monitor class="w-8 h-8 text-primary-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Available</p>
            <p class="text-2xl font-bold text-green-600">{{ equipmentStats.available }}</p>
          </div>
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">In Use</p>
            <p class="text-2xl font-bold text-orange-600">{{ equipmentStats.inUse }}</p>
          </div>
          <Clock class="w-8 h-8 text-orange-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Maintenance</p>
            <p class="text-2xl font-bold text-yellow-600">{{ equipmentStats.maintenance }}</p>
          </div>
          <Wrench class="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Offline</p>
            <p class="text-2xl font-bold text-red-600">{{ equipmentStats.offline }}</p>
          </div>
          <AlertTriangle class="w-8 h-8 text-red-600" />
        </div>
      </div>
    </div>

    <!-- Equipment Bookings Section -->
    <div v-if="equipmentBookings.length > 0" class="bg-white rounded-2xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">Equipment Bookings</h2>
          <p class="text-gray-600 mt-1">Recent equipment booking requests</p>
        </div>
        <div class="text-sm text-gray-500">
          Total: {{ equipmentBookings.length }} booking{{ equipmentBookings.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-700">Booking ID</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Equipment</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Title</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Created</th>
              <th class="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="booking in equipmentBookings" 
              :key="booking.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-4 px-4">
                <span class="font-mono text-sm text-gray-900">{{ booking.id }}</span>
              </td>
              <td class="py-4 px-4">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">
                    {{ getEquipmentName(booking.equipmentId) }}
                  </div>
                  <div class="text-gray-500">
                    {{ getEquipmentModel(booking.equipmentId) }}
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">{{ booking.title }}</div>
                  <div class="text-gray-500 truncate max-w-xs" :title="booking.purpose">
                    {{ booking.purpose }}
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="text-sm text-gray-900">
                  <div>{{ formatDateTime(booking.startDateTime) }}</div>
                  <div class="text-gray-500">to {{ formatDateTime(booking.endDateTime) }}</div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="text-sm">
                  <div class="font-medium text-gray-900">{{ booking.contactPerson }}</div>
                  <div class="text-gray-500">{{ booking.contactEmail }}</div>
                </div>
              </td>
              <td class="py-4 px-4">
                <span 
                  class="px-3 py-1 text-xs font-medium rounded-full"
                  :class="getBookingStatusClass(booking.status || 'pending')"
                >
                  {{ getBookingStatusText(booking.status || 'pending') }}
                </span>
              </td>
              <td class="py-4 px-4">
                <span class="text-sm text-gray-600">
                  {{ formatDateTime(booking.createdAt || '') }}
                </span>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center space-x-2">
                  <button
                    v-if="booking.status === 'pending'"
                    class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                    @click="approveBooking(booking.id || '')"
                  >
                    Approve
                  </button>
                  <button
                    v-if="booking.status === 'pending'"
                    class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                    @click="rejectBooking(booking.id || '')"
                  >
                    Reject
                  </button>
                  <button
                    class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    @click="deleteBooking(booking.id || '')"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State for Bookings -->
      <div v-if="equipmentBookings.length === 0" class="text-center py-12">
        <Calendar class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Equipment Bookings</h3>
        <p class="text-gray-600">Equipment bookings will appear here once created.</p>
      </div>
    </div>

    <!-- Book Equipment Modal -->
    <div 
      v-if="showBookModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showBookModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Book Equipment</h3>
        
        <form @submit.prevent="createBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Select Equipment</label>
            <select 
              v-model="newBooking.equipmentId"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Choose an equipment</option>
              <option 
                v-for="item in availableEquipment" 
                :key="item.id" 
                :value="item.id"
              >
                {{ item.name }} ({{ item.model }}) - {{ item.location }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <input 
                v-model="newBooking.startDateTime"
                type="datetime-local" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input 
                v-model="newBooking.endDateTime"
                type="datetime-local" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Booking Title</label>
            <input 
              v-model="newBooking.title"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter booking title or purpose"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Purpose/Description</label>
            <textarea 
              v-model="newBooking.purpose"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Describe the purpose of equipment usage"
              required
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input 
                v-model="newBooking.contactPerson"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Your name"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input 
                v-model="newBooking.contactEmail"
                type="email" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="your.email@example.com"
                required
              >
            </div>
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
              @click="showBookModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Equipment Modal -->
    <div 
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showAddModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New Equipment</h3>
        
        <form @submit.prevent="addEquipment" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
              <input 
                v-model="newEquipment.name"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter equipment name"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input 
                v-model="newEquipment.model"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter model number"
                required
              >
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                v-model="newEquipment.category"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Category</option>
                <option value="computing">Computing</option>
                <option value="networking">Networking</option>
                <option value="iot">IoT Devices</option>
                <option value="measurement">Measurement</option>
                <option value="storage">Storage</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select 
                v-model="newEquipment.location"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Location</option>
                <option value="AI Laboratory">AI Laboratory</option>
                <option value="IoT Laboratory">IoT Laboratory</option>
                <option value="Cloud Computing Lab">Cloud Computing Lab</option>
                <option value="Network Security Lab">Network Security Lab</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              v-model="newEquipment.description"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter equipment description"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Add Equipment
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showAddModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Success Modal -->
    <div 
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showSuccessModal = false"
    >
      <div 
        class="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <div class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Booking Created Successfully!</h3>
          <p class="text-gray-600 mb-4">Your equipment booking has been submitted and is pending approval.</p>
          <button 
            class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            @click="showSuccessModal = false"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Monitor, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Wrench, 
  AlertTriangle,
  Cpu,
  Wifi,
  Smartphone,
  Activity,
  HardDrive,
  Calendar
} from 'lucide-vue-next'

// Define interfaces
interface Equipment {
  id: string
  name: string
  model: string
  category: string
  location: string
  status: 'available' | 'in-use' | 'maintenance' | 'offline'
  lastMaintenance: string
  specifications?: Record<string, string>
  description?: string
}

interface EquipmentStats {
  total: number
  available: number
  inUse: number
  maintenance: number
  offline: number
}

interface EquipmentBooking {
  id?: string
  equipmentId: string
  title: string
  startDateTime: string
  endDateTime: string
  purpose: string
  contactPerson: string
  contactEmail: string
  status?: 'pending' | 'approved' | 'rejected'
  createdAt?: string
}

// Reactive data
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const selectedLocation = ref('')
const showAddModal = ref(false)
const showBookModal = ref(false)
const showSuccessModal = ref(false)

const newEquipment = ref({
  name: '',
  model: '',
  category: '',
  location: '',
  description: ''
})

const newBooking = ref<Omit<EquipmentBooking, 'id' | 'status' | 'createdAt'>>({
  equipmentId: '',
  title: '',
  startDateTime: '',
  endDateTime: '',
  purpose: '',
  contactPerson: '',
  contactEmail: ''
})

const equipment = ref<Equipment[]>([
  {
    id: 'EQ-001',
    name: 'NVIDIA RTX 4090',
    model: 'RTX 4090 24GB',
    category: 'computing',
    location: 'AI Laboratory',
    status: 'available',
    lastMaintenance: '2025-09-15',
    specifications: {
      memory: '24GB GDDR6X',
      cores: '16384 CUDA Cores',
      baseClock: '2230 MHz',
      boostClock: '2520 MHz'
    }
  },
  {
    id: 'EQ-002',
    name: 'Cisco Catalyst 9300',
    model: 'C9300-48P',
    category: 'networking',
    location: 'Network Security Lab',
    status: 'in-use',
    lastMaintenance: '2025-09-10',
    specifications: {
      ports: '48x 1G Ethernet',
      switching: '176 Gbps',
      poeTotal: '740W',
      stackable: 'Yes'
    }
  },
  {
    id: 'EQ-003',
    name: 'Arduino Mega 2560',
    model: 'REV3',
    category: 'iot',
    location: 'IoT Laboratory',
    status: 'available',
    lastMaintenance: '2025-09-08',
    specifications: {
      microcontroller: 'ATmega2560',
      digitalPins: '54',
      analogPins: '16',
      flashMemory: '256 KB'
    }
  },
  {
    id: 'EQ-004',
    name: 'Dell PowerEdge R750',
    model: 'R750 Server',
    category: 'computing',
    location: 'Cloud Computing Lab',
    status: 'maintenance',
    lastMaintenance: '2025-09-18',
    specifications: {
      processor: '2x Intel Xeon Silver 4314',
      memory: '128GB DDR4',
      storage: '2TB NVMe SSD',
      raidController: 'PERC H755'
    }
  },
  {
    id: 'EQ-005',
    name: 'Oscilloscope DSO-X 3024T',
    model: 'Keysight 3024T',
    category: 'measurement',
    location: 'IoT Laboratory',
    status: 'available',
    lastMaintenance: '2025-09-12',
    specifications: {
      bandwidth: '200 MHz',
      channels: '4',
      sampleRate: '4 GSa/s',
      memoryDepth: '4 Mpts'
    }
  },
  {
    id: 'EQ-006',
    name: 'Raspberry Pi 4 Model B',
    model: '8GB RAM',
    category: 'iot',
    location: 'IoT Laboratory',
    status: 'in-use',
    lastMaintenance: '2025-09-14',
    specifications: {
      processor: 'Broadcom BCM2711 Quad-core',
      memory: '8GB LPDDR4',
      connectivity: 'Wi-Fi 802.11ac, Bluetooth 5.0',
      ports: '2x USB 3.0, 2x USB 2.0'
    }
  },
  {
    id: 'EQ-007',
    name: 'QNAP TS-464',
    model: '4-Bay NAS',
    category: 'storage',
    location: 'Cloud Computing Lab',
    status: 'offline',
    lastMaintenance: '2025-09-05',
    specifications: {
      bays: '4 x 3.5" SATA',
      processor: 'Intel Celeron N5105',
      memory: '8GB DDR4',
      network: '2x 2.5GbE'
    }
  },
  {
    id: 'EQ-008',
    name: 'Intel NUC 12 Pro',
    model: 'NUC12WSHi7',
    category: 'computing',
    location: 'AI Laboratory',
    status: 'available',
    lastMaintenance: '2025-09-16',
    specifications: {
      processor: 'Intel Core i7-1260P',
      memory: '32GB DDR4',
      storage: '1TB NVMe SSD',
      graphics: 'Intel Iris Xe'
    }
  }
])

const equipmentStats = ref<EquipmentStats>({
  total: 8,
  available: 4,
  inUse: 2,
  maintenance: 1,
  offline: 1
})

// Store for equipment bookings (simulated)
const equipmentBookings = ref<EquipmentBooking[]>([])

// Computed properties
const filteredEquipment = computed(() => {
  return equipment.value.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value
    const matchesLocation = !selectedLocation.value || item.location.toLowerCase().includes(selectedLocation.value.toLowerCase())
    
    return matchesSearch && matchesStatus && matchesCategory && matchesLocation
  })
})

const availableEquipment = computed(() => {
  return equipment.value.filter(item => item.status === 'available')
})

// Methods
const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedCategory.value = ''
  selectedLocation.value = ''
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'in-use':
      return 'bg-orange-100 text-orange-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'offline':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Available'
    case 'in-use':
      return 'In Use'
    case 'maintenance':
      return 'Maintenance'
    case 'offline':
      return 'Offline'
    default:
      return 'Unknown'
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'computing':
      return Cpu
    case 'networking':
      return Wifi
    case 'iot':
      return Smartphone
    case 'measurement':
      return Activity
    case 'storage':
      return HardDrive
    default:
      return Monitor
  }
}

const setEquipmentStatus = (id: string, newStatus: 'available' | 'in-use' | 'maintenance' | 'offline') => {
  const item = equipment.value.find(e => e.id === id)
  if (!item) return
  
  const oldStatus = item.status
  item.status = newStatus
  
  // Update maintenance date if status changed to available from maintenance
  if (oldStatus === 'maintenance' && newStatus === 'available') {
    item.lastMaintenance = new Date().toISOString().split('T')[0]
  }
  
  updateStatsForStatusChange(oldStatus, newStatus)
}

const updateStatsForStatusChange = (oldStatus: string, newStatus: string) => {
  // Decrease old status count
  switch (oldStatus) {
    case 'available':
      equipmentStats.value.available--
      break
    case 'in-use':
      equipmentStats.value.inUse--
      break
    case 'maintenance':
      equipmentStats.value.maintenance--
      break
    case 'offline':
      equipmentStats.value.offline--
      break
  }
  
  // Increase new status count
  switch (newStatus) {
    case 'available':
      equipmentStats.value.available++
      break
    case 'in-use':
      equipmentStats.value.inUse++
      break
    case 'maintenance':
      equipmentStats.value.maintenance++
      break
    case 'offline':
      equipmentStats.value.offline++
      break
  }
}

const onDelete = (id: string) => {
  const idx = equipment.value.findIndex(e => e.id === id)
  if (idx === -1) return

  const item = equipment.value[idx]
  const ok = window.confirm(`Confirm deletion of the device ${item?.name ? `"${item.name}"` : ''}(ID: ${id})? This operation cannot be undone.`)
  if (!ok) return

  equipment.value.splice(idx, 1)

  equipmentStats.value.total--
  switch (item?.status) {
    case 'available':
      equipmentStats.value.available--
      break
    case 'in-use':
      equipmentStats.value.inUse--
      break
    case 'maintenance':
      equipmentStats.value.maintenance--
      break
    case 'offline':
      equipmentStats.value.offline--
      break
  }
}

const addEquipment = () => {
  const item: Equipment = {
    id: `EQ-${String(equipment.value.length + 1).padStart(3, '0')}`,
    name: newEquipment.value.name,
    model: newEquipment.value.model,
    category: newEquipment.value.category,
    location: newEquipment.value.location,
    description: newEquipment.value.description,
    status: 'available',
    lastMaintenance: new Date().toISOString().split('T')[0],
    specifications: {}
  }
  
  equipment.value.unshift(item)
  equipmentStats.value.total++
  equipmentStats.value.available++
  
  // Reset form
  newEquipment.value = {
    name: '',
    model: '',
    category: '',
    location: '',
    description: ''
  }
  
  showAddModal.value = false
}

// New booking functions
const quickBookEquipment = (equipmentItem: Equipment) => {
  if (equipmentItem.status !== 'available') return
  
  // Pre-fill the booking form with selected equipment
  newBooking.value.equipmentId = equipmentItem.id
  newBooking.value.title = `Book ${equipmentItem.name}`
  
  // Set default time (next hour for 2 hours)
  const now = new Date()
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000)
  nextHour.setMinutes(0)
  nextHour.setSeconds(0)
  
  const twoHoursLater = new Date(nextHour.getTime() + 2 * 60 * 60 * 1000)
  
  newBooking.value.startDateTime = nextHour.toISOString().slice(0, 16)
  newBooking.value.endDateTime = twoHoursLater.toISOString().slice(0, 16)
  
  showBookModal.value = true
}

const createBooking = () => {
  // Validate booking
  if (!newBooking.value.equipmentId || !newBooking.value.title || 
      !newBooking.value.startDateTime || !newBooking.value.endDateTime ||
      !newBooking.value.purpose || !newBooking.value.contactPerson || 
      !newBooking.value.contactEmail) {
    alert('Please fill in all required fields.')
    return
  }
  
  // Check if end time is after start time
  if (new Date(newBooking.value.endDateTime) <= new Date(newBooking.value.startDateTime)) {
    alert('End time must be after start time.')
    return
  }
  
  // Create booking record
  const booking: EquipmentBooking = {
    id: `EB-${String(equipmentBookings.value.length + 1).padStart(3, '0')}`,
    ...newBooking.value,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  equipmentBookings.value.push(booking)
  
  // Update equipment status to 'in-use' (simulating auto-approval for demo)
  const equipmentItem = equipment.value.find(e => e.id === newBooking.value.equipmentId)
  if (equipmentItem && equipmentItem.status === 'available') {
    setEquipmentStatus(equipmentItem.id, 'in-use')
  }
  
  // Reset form
  newBooking.value = {
    equipmentId: '',
    title: '',
    startDateTime: '',
    endDateTime: '',
    purpose: '',
    contactPerson: '',
    contactEmail: ''
  }
  
  showBookModal.value = false
  showSuccessModal.value = true
  
  console.log('Equipment booking created:', booking)
}

// Booking management functions
const getEquipmentName = (equipmentId: string) => {
  const item = equipment.value.find(e => e.id === equipmentId)
  return item?.name || 'Unknown Equipment'
}

const getEquipmentModel = (equipmentId: string) => {
  const item = equipment.value.find(e => e.id === equipmentId)
  return item?.model || 'Unknown Model'
}

const formatDateTime = (dateTimeString: string) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBookingStatusClass = (status: string) => {
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

const getBookingStatusText = (status: string) => {
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

const approveBooking = (bookingId: string) => {
  const booking = equipmentBookings.value.find(b => b.id === bookingId)
  if (booking) {
    booking.status = 'approved'
    // Update equipment status to in-use
    const equipmentItem = equipment.value.find(e => e.id === booking.equipmentId)
    if (equipmentItem && equipmentItem.status === 'available') {
      setEquipmentStatus(equipmentItem.id, 'in-use')
    }
  }
}

const rejectBooking = (bookingId: string) => {
  const booking = equipmentBookings.value.find(b => b.id === bookingId)
  if (booking) {
    booking.status = 'rejected'
    // Keep equipment as available if rejected
    const equipmentItem = equipment.value.find(e => e.id === booking.equipmentId)
    if (equipmentItem && equipmentItem.status === 'in-use') {
      setEquipmentStatus(equipmentItem.id, 'available')
    }
  }
}

const deleteBooking = (bookingId: string) => {
  const bookingIndex = equipmentBookings.value.findIndex(b => b.id === bookingId)
  if (bookingIndex !== -1) {
    const booking = equipmentBookings.value[bookingIndex]
    const confirmDelete = window.confirm(`Are you sure you want to delete booking "${booking.title}"?`)
    if (confirmDelete) {
      // If booking was approved and equipment is in-use, make it available again
      if (booking.status === 'approved') {
        const equipmentItem = equipment.value.find(e => e.id === booking.equipmentId)
        if (equipmentItem && equipmentItem.status === 'in-use') {
          setEquipmentStatus(equipmentItem.id, 'available')
        }
      }
      equipmentBookings.value.splice(bookingIndex, 1)
    }
  }
}

onMounted(() => {
  // Load equipment data
  console.log('Equipment management page loaded')
})
</script>