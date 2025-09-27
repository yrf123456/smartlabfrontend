<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.access') }}</h1>
        <p class="text-gray-600 mt-1">Manage laboratory access control and permissions</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="showGrantModal = true"
        >
          <UserPlus class="w-4 h-4 inline mr-2" />
          Grant Access
        </button>
        
        <button 
          class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          @click="exportLogs"
        >
          <Download class="w-4 h-4 inline mr-2" />
          Export Logs
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Today's Entries</p>
            <p class="text-2xl font-bold text-gray-900">{{ accessStats.todayEntries }}</p>
          </div>
          <LogIn class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-2xl font-bold text-blue-600">{{ accessStats.activeUsers }}</p>
          </div>
          <Users class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Access Violations</p>
            <p class="text-2xl font-bold text-red-600">{{ accessStats.violations }}</p>
          </div>
          <AlertTriangle class="w-8 h-8 text-red-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Average Duration</p>
            <p class="text-2xl font-bold text-purple-600">{{ accessStats.avgDuration }}h</p>
          </div>
          <Clock class="w-8 h-8 text-purple-600" />
        </div>
      </div>
    </div>

    <!-- Access Rules Management -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Access Rules</h2>
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          @click="showRuleModal = true"
        >
          <Plus class="w-4 h-4 inline mr-2" />
          Add Rule
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="rule in accessRules"
          :key="rule.id"
          class="border border-gray-200 rounded-xl p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h3 class="text-base font-medium text-gray-900">{{ rule.name }}</h3>
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ rule.enabled ? 'Active' : 'Inactive' }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span class="font-medium">Target:</span>
                  <span class="ml-1">{{ rule.target.type === 'role' ? `Role: ${rule.target.value}` : `User: ${rule.target.value}` }}</span>
                </div>
                <div>
                  <span class="font-medium">Laboratory:</span>
                  <span class="ml-1">{{ rule.laboratory || 'All Labs' }}</span>
                </div>
                <div>
                  <span class="font-medium">Time:</span>
                  <span class="ml-1">{{ rule.timeSlot }}</span>
                </div>
                <div>
                  <span class="font-medium">Days:</span>
                  <span class="ml-1">{{ rule.weekdays.join(', ') }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                @click="editRule(rule.id)"
              >
                Edit
              </button>
              <button 
                class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                @click="deleteRule(rule.id)"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Access Status -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Current Lab Occupancy</h2>
        <div class="flex items-center text-sm text-gray-500">
          <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Live Status
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="lab in currentOccupancy"
          :key="lab.id"
          class="border border-gray-200 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-medium text-gray-900">{{ lab.name }}</h3>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getOccupancyClass(lab.occupancy, lab.capacity)"
            >
              {{ lab.occupancy }}/{{ lab.capacity }}
            </span>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="user in lab.currentUsers" 
              :key="user.id"
              class="flex items-center space-x-3 text-sm"
            >
              <img 
                :src="user.avatarUrl" 
                :alt="user.name"
                class="w-6 h-6 rounded-full object-cover"
              />
              <div class="flex-1">
                <span class="text-gray-900">{{ user.name }}</span>
                <span class="text-gray-500 ml-2">{{ user.role }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ user.entryTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Logs -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Recent Access Logs</h2>
        <div class="flex items-center space-x-3">
          <select 
            v-model="selectedLogFilter" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Events</option>
            <option value="entry">Entry Only</option>
            <option value="exit">Exit Only</option>
            <option value="violation">Violations</option>
          </select>
          
          <select 
            v-model="selectedLabFilter" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All Labs</option>
            <option 
              v-for="lab in laboratories" 
              :key="lab.id" 
              :value="lab.id"
            >
              {{ lab.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-900">User</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Laboratory</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Action</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Time</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="log in filteredAccessLogs"
              :key="log.id"
              class="hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <img 
                    :src="log.user.avatarUrl" 
                    :alt="log.user.name"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ log.user.name }}</p>
                    <p class="text-xs text-gray-500">{{ log.user.role }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ log.laboratory }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <component 
                    :is="getActionIcon(log.action)" 
                    class="w-4 h-4"
                    :class="getActionColor(log.action)"
                  />
                  <span class="text-sm text-gray-900">{{ log.action }}</span>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ log.timestamp }}</td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(log.status)"
                >
                  {{ log.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button 
                  v-if="log.status === 'violation'"
                  class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  @click="reviewViolation(log.id)"
                >
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Grant Access Modal -->
    <div 
      v-if="showGrantModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showGrantModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Grant Access Permission</h3>
        
        <form @submit.prevent="grantAccess" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
            <select 
              v-model="grantForm.targetType"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="user">Specific User</option>
              <option value="role">User Role</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ grantForm.targetType === 'user' ? 'Select User' : 'Select Role' }}
            </label>
            <select 
              v-model="grantForm.target"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Choose...</option>
              <option 
                v-if="grantForm.targetType === 'role'"
                v-for="role in availableRoles" 
                :key="role" 
                :value="role"
              >
                {{ role }}
              </option>
              <option 
                v-if="grantForm.targetType === 'user'"
                v-for="user in availableUsers" 
                :key="user.id" 
                :value="user.name"
              >
                {{ user.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
            <select 
              v-model="grantForm.laboratory"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Laboratories</option>
              <option 
                v-for="lab in laboratories" 
                :key="lab.id" 
                :value="lab.name"
              >
                {{ lab.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                v-model="grantForm.startTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                v-model="grantForm.endTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Grant Access
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showGrantModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Rule Modal -->
    <div 
      v-if="showRuleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showRuleModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Access Rule</h3>
        
        <form @submit.prevent="addAccessRule" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input 
              v-model="ruleForm.name"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter rule name"
              required
            >
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
              <select 
                v-model="ruleForm.targetType"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="role">Role</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Target</label>
              <select 
                v-model="ruleForm.target"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select...</option>
                <option 
                  v-if="ruleForm.targetType === 'role'"
                  v-for="role in availableRoles" 
                  :key="role" 
                  :value="role"
                >
                  {{ role }}
                </option>
                <option 
                  v-if="ruleForm.targetType === 'user'"
                  v-for="user in availableUsers" 
                  :key="user.id" 
                  :value="user.name"
                >
                  {{ user.name }}
                </option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
            <select 
              v-model="ruleForm.laboratory"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Laboratories</option>
              <option 
                v-for="lab in laboratories" 
                :key="lab.id" 
                :value="lab.name"
              >
                {{ lab.name }}
              </option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                v-model="ruleForm.startTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                v-model="ruleForm.endTime"
                type="time" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
            <div class="grid grid-cols-4 gap-2">
              <label 
                v-for="day in weekdays" 
                :key="day.value"
                class="flex items-center space-x-2"
              >
                <input 
                  v-model="ruleForm.weekdays"
                  type="checkbox" 
                  :value="day.value"
                  class="rounded border-gray-300"
                >
                <span class="text-sm text-gray-700">{{ day.label }}</span>
              </label>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Add Rule
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showRuleModal = false"
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
  KeyRound, 
  UserPlus, 
  Download, 
  LogIn, 
  Users, 
  AlertTriangle, 
  Clock, 
  Plus,
  LogOut,
  ShieldCheck
} from 'lucide-vue-next'

// Reactive data
const showGrantModal = ref(false)
const showRuleModal = ref(false)
const selectedLogFilter = ref('')
const selectedLabFilter = ref('')

const grantForm = ref({
  targetType: 'user',
  target: '',
  laboratory: '',
  startTime: '09:00',
  endTime: '17:00'
})

const ruleForm = ref({
  name: '',
  targetType: 'role',
  target: '',
  laboratory: '',
  startTime: '09:00',
  endTime: '17:00',
  weekdays: []
})

const weekdays = [
  { label: 'Mon', value: 'Monday' },
  { label: 'Tue', value: 'Tuesday' },
  { label: 'Wed', value: 'Wednesday' },
  { label: 'Thu', value: 'Thursday' },
  { label: 'Fri', value: 'Friday' },
  { label: 'Sat', value: 'Saturday' },
  { label: 'Sun', value: 'Sunday' }
]

const accessStats = ref({
  todayEntries: 47,
  activeUsers: 12,
  violations: 2,
  avgDuration: 3.2
})

const availableRoles = ref(['TEACHER', 'STUDENT', 'DEPT_ADMIN', 'SYS_ADMIN', 'VISITOR'])

const availableUsers = ref([
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Chen' },
  { id: '4', name: 'Emily Davis' }
])

const laboratories = ref([
  { id: 'ai-lab', name: 'AI Laboratory' },
  { id: 'iot-lab', name: 'IoT Laboratory' },
  { id: 'cloud-lab', name: 'Cloud Computing Lab' },
  { id: 'security-lab', name: 'Network Security Lab' }
])

const accessRules = ref([
  {
    id: '1',
    name: 'Teacher Full Access',
    target: { type: 'role', value: 'TEACHER' },
    laboratory: '',
    timeSlot: '08:00-20:00',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    enabled: true
  },
  {
    id: '2',
    name: 'Student Lab Hours',
    target: { type: 'role', value: 'STUDENT' },
    laboratory: '',
    timeSlot: '09:00-17:00',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    enabled: true
  },
  {
    id: '3',
    name: 'Weekend Research Access',
    target: { type: 'role', value: 'TEACHER' },
    laboratory: 'AI Laboratory',
    timeSlot: '10:00-18:00',
    weekdays: ['Saturday', 'Sunday'],
    enabled: true
  },
  {
    id: '4',
    name: 'Admin Override',
    target: { type: 'role', value: 'SYS_ADMIN' },
    laboratory: '',
    timeSlot: '00:00-23:59',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    enabled: true
  }
])

const currentOccupancy = ref([
  {
    id: 'ai-lab',
    name: 'AI Laboratory',
    occupancy: 3,
    capacity: 20,
    currentUsers: [
      {
        id: '1',
        name: 'Dr. Sarah Wilson',
        role: 'TEACHER',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=64&h=64&fit=crop&crop=face',
        entryTime: '09:15'
      },
      {
        id: '2',
        name: 'John Smith',
        role: 'STUDENT',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
        entryTime: '10:30'
      },
      {
        id: '3',
        name: 'Emily Davis',
        role: 'STUDENT',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
        entryTime: '11:45'
      }
    ]
  },
  {
    id: 'iot-lab',
    name: 'IoT Laboratory',
    occupancy: 5,
    capacity: 15,
    currentUsers: [
      {
        id: '4',
        name: 'Prof. Mike Johnson',
        role: 'TEACHER',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
        entryTime: '08:30'
      },
      {
        id: '5',
        name: 'Lisa Chen',
        role: 'STUDENT',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
        entryTime: '09:00'
      }
    ]
  },
  {
    id: 'cloud-lab',
    name: 'Cloud Computing Lab',
    occupancy: 1,
    capacity: 25,
    currentUsers: [
      {
        id: '6',
        name: 'Alex Wilson',
        role: 'STUDENT',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
        entryTime: '14:20'
      }
    ]
  }
])

const accessLogs = ref([
  {
    id: '1',
    user: {
      name: 'Dr. Sarah Wilson',
      role: 'TEACHER',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'AI Laboratory',
    action: 'Entry',
    timestamp: '2025-09-21 09:15:23',
    status: 'violation'
  },
  {
    id: '4',
    user: {
      name: 'Emily Davis',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'AI Laboratory',
    action: 'Entry',
    timestamp: '2025-09-21 11:45:30',
    status: 'success'
  },
  {
    id: '5',
    user: {
      name: 'Prof. Mike Johnson',
      role: 'TEACHER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'IoT Laboratory',
    action: 'Exit',
    timestamp: '2025-09-21 12:30:15',
    status: 'success'
  },
  {
    id: '6',
    user: {
      name: 'Lisa Chen',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'Cloud Computing Lab',
    action: 'Entry',
    timestamp: '2025-09-21 13:15:42',
    status: 'success'
  },
  {
    id: '7',
    user: {
      name: 'Expired Card User',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'AI Laboratory',
    action: 'Entry Attempt',
    timestamp: '2025-09-21 14:20:18',
    status: 'violation'
  },
  {
    id: '8',
    user: {
      name: 'Alex Wilson',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face'
    },
    laboratory: 'Cloud Computing Lab',
    action: 'Entry',
    timestamp: '2025-09-21 14:20:35',
    status: 'success'
  }
])

// Computed properties
const filteredAccessLogs = computed(() => {
  return accessLogs.value.filter(log => {
    const matchesFilter = !selectedLogFilter.value || 
      (selectedLogFilter.value === 'entry' && log.action === 'Entry') ||
      (selectedLogFilter.value === 'exit' && log.action === 'Exit') ||
      (selectedLogFilter.value === 'violation' && log.status === 'violation')
    
    const matchesLab = !selectedLabFilter.value || log.laboratory.toLowerCase().includes(selectedLabFilter.value.toLowerCase())
    
    return matchesFilter && matchesLab
  })
})

// Methods
const getOccupancyClass = (occupancy: number, capacity: number) => {
  const percentage = (occupancy / capacity) * 100
  if (percentage >= 80) return 'bg-red-100 text-red-800'
  if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getActionIcon = (action: string) => {
  if (action === 'Entry') return LogIn
  if (action === 'Exit') return LogOut
  return AlertTriangle
}

const getActionColor = (action: string) => {
  if (action === 'Entry') return 'text-green-600'
  if (action === 'Exit') return 'text-blue-600'
  return 'text-red-600'
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'violation':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const editRule = (ruleId: string) => {
  console.log('Edit rule:', ruleId)
}

const deleteRule = (ruleId: string) => {
  const index = accessRules.value.findIndex(rule => rule.id === ruleId)
  if (index !== -1) {
    accessRules.value.splice(index, 1)
  }
}

const reviewViolation = (logId: string) => {
  console.log('Review violation:', logId)
}

const exportLogs = () => {
  console.log('Export access logs')
}

const grantAccess = () => {
  console.log('Grant access:', grantForm.value)
  showGrantModal.value = false
  
  // Reset form
  grantForm.value = {
    targetType: 'user',
    target: '',
    laboratory: '',
    startTime: '09:00',
    endTime: '17:00'
  }
}

const addAccessRule = () => {
  const newRule = {
    id: Date.now().toString(),
    name: ruleForm.value.name,
    target: {
      type: ruleForm.value.targetType,
      value: ruleForm.value.target
    },
    laboratory: ruleForm.value.laboratory || '',
    timeSlot: `${ruleForm.value.startTime}-${ruleForm.value.endTime}`,
    weekdays: ruleForm.value.weekdays,
    enabled: true
  }
  
  accessRules.value.unshift(newRule)
  showRuleModal.value = false
  
  // Reset form
  ruleForm.value = {
    name: '',
    targetType: 'role',
    target: '',
    laboratory: '',
    startTime: '09:00',
    endTime: '17:00',
    weekdays: []
  }
}

onMounted(() => {
  // Simulate real-time updates
  setInterval(() => {
    // Update occupancy randomly
    currentOccupancy.value.forEach(lab => {
      const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
      lab.occupancy = Math.max(0, Math.min(lab.capacity, lab.occupancy + change))
    })
    
    // Update stats
    accessStats.value.activeUsers = currentOccupancy.value.reduce((sum, lab) => sum + lab.occupancy, 0)
  }, 30000) // Update every 30 seconds
})
</script>