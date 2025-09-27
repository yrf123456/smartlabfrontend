<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.settings') }}</h1>
      <p class="text-gray-600 mt-1">System configuration and personal settings</p>
    </div>

    <!-- Settings Navigation -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="flex border-b border-gray-200">
        <button
          v-for="tab in settingsTabs"
          :key="tab.id"
          class="flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.id 
            ? 'border-primary-500 text-primary-600 bg-primary-50' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.name }}</span>
        </button>
      </div>
    </div>

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="space-y-6">
      <!-- Profile Settings -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
        
        <div class="flex items-start space-x-6">
          <div class="flex-shrink-0">
            <img 
              :src="profileSettings.avatarUrl" 
              alt="Profile"
              class="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
            />
            <button class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">
              Change Photo
            </button>
          </div>
          
          <div class="flex-1 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  v-model="profileSettings.name"
                  type="text" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  v-model="profileSettings.email"
                  type="email" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  v-model="profileSettings.department"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  v-model="profileSettings.phone"
                  type="tel" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea 
                v-model="profileSettings.bio"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button 
            class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            @click="saveProfile"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Security Settings -->
    <div v-if="activeTab === 'security'" class="space-y-6">
      <!-- Change Password -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
        
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input 
              v-model="securitySettings.currentPassword"
              type="password" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              v-model="securitySettings.newPassword"
              type="password" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input 
              v-model="securitySettings.confirmPassword"
              type="password" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <button 
            class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            @click="changePassword"
          >
            Update Password
          </button>
        </div>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
            <p class="text-sm text-gray-600">Add an extra layer of security to your account</p>
          </div>
          <div class="flex items-center space-x-2">
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="securitySettings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
            >
              {{ securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled' }}
            </span>
            <button 
              class="text-sm font-medium transition-colors"
              :class="securitySettings.twoFactorEnabled ? 'text-red-600 hover:text-red-700' : 'text-primary-600 hover:text-primary-700'"
              @click="toggleTwoFactor"
            >
              {{ securitySettings.twoFactorEnabled ? 'Disable' : 'Enable' }}
            </button>
          </div>
        </div>
        
        <div v-if="!securitySettings.twoFactorEnabled" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start space-x-3">
            <Shield class="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-800">Enable 2FA for better security</p>
              <p class="text-xs text-blue-600 mt-1">Use an authenticator app to generate time-based codes</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Active Sessions</h2>
        
        <div class="space-y-4">
          <div
            v-for="session in activeSessions"
            :key="session.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
          >
            <div class="flex items-center space-x-4">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getDeviceClass(session.device)"
              >
                <component :is="getDeviceIcon(session.device)" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ session.device }} - {{ session.browser }}</p>
                <p class="text-xs text-gray-500">{{ session.location }} • {{ session.lastActive }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <span 
                v-if="session.current"
                class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
              >
                Current
              </span>
              <button 
                v-else
                class="text-xs text-red-600 hover:text-red-700 font-medium"
                @click="terminateSession(session.id)"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Settings -->
    <div v-if="activeTab === 'notifications'" class="space-y-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
        
        <div class="space-y-6">
          <div
            v-for="category in notificationSettings"
            :key="category.id"
            class="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
          >
            <h3 class="text-base font-medium text-gray-900 mb-3">{{ category.name }}</h3>
            <p class="text-sm text-gray-600 mb-4">{{ category.description }}</p>
            
            <div class="space-y-3">
              <div
                v-for="setting in category.settings"
                :key="setting.id"
                class="flex items-center justify-between"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ setting.name }}</p>
                  <p class="text-xs text-gray-500">{{ setting.description }}</p>
                </div>
                
                <div class="flex items-center space-x-4">
                  <label class="flex items-center space-x-2">
                    <input 
                      v-model="setting.email"
                      type="checkbox" 
                      class="rounded border-gray-300"
                    />
                    <span class="text-xs text-gray-700">Email</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input 
                      v-model="setting.push"
                      type="checkbox" 
                      class="rounded border-gray-300"
                    />
                    <span class="text-xs text-gray-700">Push</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input 
                      v-model="setting.sms"
                      type="checkbox" 
                      class="rounded border-gray-300"
                    />
                    <span class="text-xs text-gray-700">SMS</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button 
            class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            @click="saveNotifications"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>

    <!-- System Settings (Admin Only) -->
    <div v-if="activeTab === 'system' && isAdmin" class="space-y-6">
      <!-- General System Settings -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">General System Settings</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">System Name</label>
            <input 
              v-model="systemSettings.name"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input 
              v-model="systemSettings.adminEmail"
              type="email" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
            <input 
              v-model="systemSettings.sessionTimeout"
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Max File Upload Size (MB)</label>
            <input 
              v-model="systemSettings.maxFileSize"
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      <!-- Email Configuration -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Email Configuration</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
            <input 
              v-model="emailSettings.smtpHost"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="smtp.gmail.com"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
            <input 
              v-model="emailSettings.smtpPort"
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="587"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              v-model="emailSettings.username"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              v-model="emailSettings.password"
              type="password" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        
        <div class="flex items-center space-x-4 mt-4">
          <label class="flex items-center space-x-2">
            <input 
              v-model="emailSettings.useSSL"
              type="checkbox" 
              class="rounded border-gray-300"
            />
            <span class="text-sm text-gray-700">Use SSL/TLS</span>
          </label>
          
          <button 
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            @click="testEmailConnection"
          >
            Test Connection
          </button>
        </div>
      </div>

      <!-- Backup & Maintenance -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Backup & Maintenance</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center p-4 border border-gray-200 rounded-xl">
            <Database class="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p class="text-sm font-medium text-gray-900">Database Backup</p>
            <p class="text-xs text-gray-500 mb-3">Last: 2 hours ago</p>
            <button 
              class="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
              @click="createBackup"
            >
              Create Backup
            </button>
          </div>
          
          <div class="text-center p-4 border border-gray-200 rounded-xl">
            <HardDrive class="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p class="text-sm font-medium text-gray-900">System Logs</p>
            <p class="text-xs text-gray-500 mb-3">Size: 2.3 GB</p>
            <button 
              class="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors"
              @click="clearLogs"
            >
              Clear Logs
            </button>
          </div>
          
          <div class="text-center p-4 border border-gray-200 rounded-xl">
            <RefreshCw class="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p class="text-sm font-medium text-gray-900">System Update</p>
            <p class="text-xs text-gray-500 mb-3">v2.1.0 available</p>
            <button 
              class="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
              @click="checkUpdates"
            >
              Check Updates
            </button>
          </div>
        </div>
      </div>

      <!-- Save System Settings -->
      <div class="flex justify-end">
        <button 
          class="bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="saveSystemSettings"
        >
          Save System Settings
        </button>
      </div>
    </div>

    <!-- About -->
    <div v-if="activeTab === 'about'" class="space-y-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="text-center">
          <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building class="w-8 h-8 text-primary-600" />
          </div>
          
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Smart Lab Management System</h2>
          <p class="text-gray-600 mb-6">Intelligent laboratory management platform</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p class="text-2xl font-bold text-primary-600">{{ aboutInfo.version }}</p>
              <p class="text-sm text-gray-500">Current Version</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-green-600">{{ aboutInfo.uptime }}</p>
              <p class="text-sm text-gray-500">System Uptime</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-blue-600">{{ aboutInfo.users }}</p>
              <p class="text-sm text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">System Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Frontend Framework</span>
              <span class="text-sm font-medium text-gray-900">Vue.js 3.4</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Build Tool</span>
              <span class="text-sm font-medium text-gray-900">Vite 5.0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">UI Framework</span>
              <span class="text-sm font-medium text-gray-900">Tailwind CSS</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">State Management</span>
              <span class="text-sm font-medium text-gray-900">Pinia</span>
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Last Updated</span>
              <span class="text-sm font-medium text-gray-900">{{ aboutInfo.lastUpdated }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Environment</span>
              <span class="text-sm font-medium text-gray-900">{{ aboutInfo.environment }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">License</span>
              <span class="text-sm font-medium text-gray-900">MIT License</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Support</span>
              <a href="mailto:support@smartlab.com" class="text-sm font-medium text-primary-600 hover:text-primary-700">
                support@smartlab.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Cog, 
  Info, 
  Monitor, 
  Smartphone, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Building
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Reactive data
const activeTab = ref('general')

const settingsTabs = [
  { id: 'general', name: 'General', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'system', name: 'System', icon: Cog },
  { id: 'about', name: 'About', icon: Info }
]

const profileSettings = ref({
  name: 'Dr. Sarah Wilson',
  email: 'sarah.wilson@university.edu',
  department: 'Computer Science',
  phone: '+65 9123 4567',
  bio: 'Professor of Computer Science specializing in artificial intelligence and machine learning research.',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=128&h=128&fit=crop&crop=face'
})

const securitySettings = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
})

const activeSessions = ref([
  {
    id: '1',
    device: 'Desktop',
    browser: 'Chrome 118.0',
    location: 'Singapore, SG',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: '2',
    device: 'Mobile',
    browser: 'Safari 17.0',
    location: 'Singapore, SG',
    lastActive: '1 hour ago',
    current: false
  },
  {
    id: '3',
    device: 'Tablet',
    browser: 'Chrome 118.0',
    location: 'Singapore, SG',
    lastActive: '2 days ago',
    current: false
  }
])

const notificationSettings = ref([
  {
    id: 'bookings',
    name: 'Booking Notifications',
    description: 'Receive notifications about booking status and reminders',
    settings: [
      {
        id: 'booking_approved',
        name: 'Booking Approved',
        description: 'When your booking request is approved',
        email: true,
        push: true,
        sms: false
      },
      {
        id: 'booking_rejected',
        name: 'Booking Rejected',
        description: 'When your booking request is rejected',
        email: true,
        push: true,
        sms: false
      },
      {
        id: 'booking_reminder',
        name: 'Booking Reminders',
        description: 'Reminders before your scheduled sessions',
        email: true,
        push: true,
        sms: true
      }
    ]
  },
  {
    id: 'system',
    name: 'System Notifications',
    description: 'Important system updates and maintenance notifications',
    settings: [
      {
        id: 'system_maintenance',
        name: 'Maintenance Alerts',
        description: 'Scheduled maintenance and downtime notifications',
        email: true,
        push: false,
        sms: false
      },
      {
        id: 'security_alerts',
        name: 'Security Alerts',
        description: 'Login attempts and security-related notifications',
        email: true,
        push: true,
        sms: true
      }
    ]
  },
  {
    id: 'environment',
    name: 'Environment Alerts',
    description: 'Laboratory environment monitoring and alerts',
    settings: [
      {
        id: 'env_threshold',
        name: 'Threshold Violations',
        description: 'When environmental parameters exceed safe limits',
        email: true,
        push: true,
        sms: false
      },
      {
        id: 'equipment_status',
        name: 'Equipment Status',
        description: 'Equipment maintenance and status updates',
        email: true,
        push: false,
        sms: false
      }
    ]
  }
])

const systemSettings = ref({
  name: 'Smart Lab Management System',
  adminEmail: 'admin@university.edu',
  sessionTimeout: 120,
  maxFileSize: 10
})

const emailSettings = ref({
  smtpHost: 'smtp.university.edu',
  smtpPort: 587,
  username: 'noreply@university.edu',
  password: '',
  useSSL: true
})

const aboutInfo = ref({
  version: 'v2.1.0',
  uptime: '99.8%',
  users: '156',
  lastUpdated: '2025-09-15',
  environment: 'Production'
})

// Computed properties
const isAdmin = computed(() => {
  return authStore.hasRole('SYS_ADMIN')
})

// Methods
const getDeviceIcon = (device: string) => {
  switch (device.toLowerCase()) {
    case 'desktop':
      return Monitor
    case 'mobile':
    case 'tablet':
      return Smartphone
    default:
      return Monitor
  }
}

const getDeviceClass = (device: string) => {
  switch (device.toLowerCase()) {
    case 'desktop':
      return 'bg-blue-100 text-blue-600'
    case 'mobile':
      return 'bg-green-100 text-green-600'
    case 'tablet':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const saveProfile = () => {
  console.log('Saving profile settings:', profileSettings.value)
  // Simulate API call
  setTimeout(() => {
    alert('Profile updated successfully!')
  }, 1000)
}

const changePassword = () => {
  if (securitySettings.value.newPassword !== securitySettings.value.confirmPassword) {
    alert('New passwords do not match!')
    return
  }
  
  console.log('Changing password...')
  // Simulate API call
  setTimeout(() => {
    alert('Password changed successfully!')
    securitySettings.value.currentPassword = ''
    securitySettings.value.newPassword = ''
    securitySettings.value.confirmPassword = ''
  }, 1000)
}

const toggleTwoFactor = () => {
  securitySettings.value.twoFactorEnabled = !securitySettings.value.twoFactorEnabled
  console.log('2FA toggled:', securitySettings.value.twoFactorEnabled)
  
  if (securitySettings.value.twoFactorEnabled) {
    alert('Two-factor authentication enabled! Please set up your authenticator app.')
  } else {
    alert('Two-factor authentication disabled.')
  }
}

const terminateSession = (sessionId: string) => {
  const index = activeSessions.value.findIndex(s => s.id === sessionId)
  if (index !== -1) {
    activeSessions.value.splice(index, 1)
    console.log('Session terminated:', sessionId)
  }
}

const saveNotifications = () => {
  console.log('Saving notification settings:', notificationSettings.value)
  // Simulate API call
  setTimeout(() => {
    alert('Notification preferences saved!')
  }, 1000)
}

const saveSystemSettings = () => {
  console.log('Saving system settings:', {
    system: systemSettings.value,
    email: emailSettings.value
  })
  // Simulate API call
  setTimeout(() => {
    alert('System settings saved successfully!')
  }, 1000)
}

const testEmailConnection = () => {
  console.log('Testing email connection...')
  // Simulate email test
  setTimeout(() => {
    alert('Email connection test successful!')
  }, 2000)
}

const createBackup = () => {
  console.log('Creating database backup...')
  // Simulate backup creation
  setTimeout(() => {
    alert('Database backup created successfully!')
  }, 3000)
}

const clearLogs = () => {
  if (confirm('Are you sure you want to clear all system logs? This action cannot be undone.')) {
    console.log('Clearing system logs...')
    // Simulate log clearing
    setTimeout(() => {
      alert('System logs cleared successfully!')
    }, 2000)
  }
}

const checkUpdates = () => {
  console.log('Checking for system updates...')
  // Simulate update check
  setTimeout(() => {
    if (confirm('System update v2.1.1 is available. Would you like to download and install it now?')) {
      alert('Update installation started. The system will restart automatically when complete.')
    }
  }, 2000)
}

onMounted(() => {
  // Load user settings
  if (!isAdmin.value) {
    // Remove system tab for non-admin users
    const systemTabIndex = settingsTabs.findIndex(tab => tab.id === 'system')
    if (systemTabIndex !== -1) {
      settingsTabs.splice(systemTabIndex, 1)
    }
  }
})
</script>