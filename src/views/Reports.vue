<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.reports') }}</h1>
        <p class="text-gray-600 mt-1">View and export statistical reports</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="generateReport"
          :disabled="isGenerating"
        >
          <FileText class="w-4 h-4 inline mr-2" />
          {{ isGenerating ? 'Generating...' : 'Generate Report' }}
        </button>
        
        <button 
          v-if="canExportReports"
          class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          @click="exportToExcel"
          :disabled="isExporting"
        >
          <Download class="w-4 h-4 inline mr-2" />
          {{ isExporting ? 'Exporting...' : 'Export Excel' }}
        </button>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select 
            v-model="selectedReportType" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="applyFilters"
          >
            <option value="bookings">Booking Statistics</option>
            <option value="equipment">Equipment Usage</option>
            <option value="environment">Environment Data</option>
            <option value="users">User Activity</option>
            <option value="responsibility">Responsibility Changes</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select 
            v-model="selectedDateRange" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="applyFilters"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <div v-if="selectedDateRange === 'custom'" class="flex items-center space-x-2">
          <input 
            v-model="customDateStart"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="applyFilters"
          >
          <span class="text-gray-500">to</span>
          <input 
            v-model="customDateEnd"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="applyFilters"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
          <select 
            v-model="selectedLab" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="applyFilters"
          >
            <option value="">All Laboratories</option>
            <option value="ai-lab">AI Laboratory</option>
            <option value="iot-lab">IoT Laboratory</option>
            <option value="cloud-lab">Cloud Computing Lab</option>
            <option value="security-lab">Network Security Lab</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Report Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Bookings</p>
            <p class="text-2xl font-bold text-gray-900">{{ filteredReportStats.totalBookings }}</p>
            <p class="text-xs text-green-600 mt-1">+{{ filteredReportStats.bookingGrowth }}% from last period</p>
          </div>
          <Calendar class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Equipment Usage</p>
            <p class="text-2xl font-bold text-gray-900">{{ filteredReportStats.equipmentAvailability }}</p>
            <p class="text-xs text-green-600 mt-1">+{{ filteredReportStats.equipmentGrowth }}% from last period</p>
          </div>
          <Monitor class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Lab Utilization</p>
            <p class="text-2xl font-bold text-gray-900">{{ filteredReportStats.labUtilization }}%</p>
            <p class="text-xs text-red-600 mt-1">{{ filteredReportStats.utilizationGrowth }}% from last period</p>
          </div>
          <Building class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ filteredReportStats.activeUsers }}</p>
            <p class="text-xs text-green-600 mt-1">+{{ filteredReportStats.userGrowth }}% from last period</p>
          </div>
          <Users class="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>

    <!-- Booking Statistics Report -->
    <div v-if="selectedReportType === 'bookings'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Booking Statistics Report</h2>
      
      <!-- Chart Container -->
      <div class="mb-6 bg-gray-50 rounded-lg p-4" style="height: 320px;">
        <canvas ref="bookingChartCanvas" style="max-height: 300px;"></canvas>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-900">Laboratory</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Total Bookings</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Approved</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Rejected</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Utilization Rate</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Avg Duration</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="item in filteredBookingReport" :key="item.lab" class="hover:bg-gray-50">
              <td class="py-3 px-4 text-sm font-medium text-gray-900">{{ item.lab }}</td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ item.total }}</td>
              <td class="py-3 px-4 text-sm text-green-600">{{ item.approved }}</td>
              <td class="py-3 px-4 text-sm text-red-600">{{ item.rejected }}</td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ item.utilizationRate }}%</td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ item.avgDuration }}h</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Equipment Usage Report -->
    <div v-if="selectedReportType === 'equipment'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Equipment Usage Report</h2>
      
      <!-- Chart Container -->
      <div class="mb-6 bg-gray-50 rounded-lg p-4" style="height: 320px;">
        <canvas ref="equipmentChartCanvas" style="max-height: 300px;"></canvas>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="equipment in filteredEquipmentReport"
          :key="equipment.id"
          class="border border-gray-200 rounded-xl p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-medium text-gray-900">{{ equipment.name }}</h3>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getUsageClass(equipment.usageRate)"
            >
              {{ equipment.usageRate }}%
            </span>
          </div>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Total Usage Hours:</span>
              <span class="font-medium">{{ equipment.totalHours }}h</span>
            </div>
            <div class="flex justify-between">
              <span>Active Days:</span>
              <span class="font-medium">{{ equipment.activeDays }} days</span>
            </div>
            <div class="flex justify-between">
              <span>Maintenance Events:</span>
              <span class="font-medium">{{ equipment.maintenanceEvents }}</span>
            </div>
            <div class="flex justify-between">
              <span>Current Status:</span>
              <span 
                class="font-medium"
                :class="equipment.status === 'active' ? 'text-green-600' : 'text-red-600'"
              >
                {{ equipment.status === 'active' ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Environment Data Report -->
    <div v-if="selectedReportType === 'environment'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Environment Data Report</h2>
      
      <!-- Chart Container -->
      <div class="mb-6 bg-gray-50 rounded-lg p-4" style="height: 320px;">
        <canvas ref="environmentChartCanvas" style="max-height: 300px;"></canvas>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Thermometer class="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Temperature</p>
          <p class="text-xl font-bold text-gray-900">{{ filteredEnvironmentReport.avgTemp }}°C</p>
          <p class="text-xs text-gray-500">Range: {{ filteredEnvironmentReport.tempRange }}</p>
        </div>
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Droplets class="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Humidity</p>
          <p class="text-xl font-bold text-gray-900">{{ filteredEnvironmentReport.avgHumidity }}%</p>
          <p class="text-xs text-gray-500">Range: {{ filteredEnvironmentReport.humidityRange }}</p>
        </div>
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Wind class="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Air Quality</p>
          <p class="text-xl font-bold text-gray-900">{{ filteredEnvironmentReport.avgAirQuality }}</p>
          <p class="text-xs text-gray-500">PM2.5 μg/m³</p>
        </div>
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <AlertTriangle class="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Threshold Violations</p>
          <p class="text-xl font-bold text-gray-900">{{ filteredEnvironmentReport.violations }}</p>
          <p class="text-xs text-gray-500">Alerts triggered</p>
        </div>
      </div>
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-base font-medium text-gray-900 mb-4">Recent Environment Alerts</h3>
        <div class="space-y-3">
          <div
            v-for="alert in filteredEnvironmentReport.recentAlerts"
            :key="alert.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div 
                class="w-3 h-3 rounded-full"
                :class="alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'"
              ></div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ alert.message }}</p>
                <p class="text-xs text-gray-500">{{ alert.laboratory }} • {{ alert.timestamp }}</p>
              </div>
            </div>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="alert.severity === 'high' ? 'bg-red-100 text-red-800' : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'"
            >
              {{ alert.severity }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- User Activity Report -->
    <div v-if="selectedReportType === 'users'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">User Activity Report</h2>
      
      <!-- Chart Container -->
      <div class="mb-6 bg-gray-50 rounded-lg p-4" style="height: 320px;">
        <canvas ref="userChartCanvas" style="max-height: 300px;"></canvas>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Statistics -->
        <div>
          <h3 class="text-base font-medium text-gray-900 mb-4">User Statistics</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Total Active Users</span>
              <span class="text-lg font-bold text-gray-900">{{ filteredUserReport.activeUsers }}</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">New Registrations</span>
              <span class="text-lg font-bold text-green-600">{{ filteredUserReport.newUsers }}</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Average Session Duration</span>
              <span class="text-lg font-bold text-blue-600">{{ filteredUserReport.avgSession }}h</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Most Active Department</span>
              <span class="text-lg font-bold text-purple-600">{{ filteredUserReport.activeDepartment }}</span>
            </div>
          </div>
        </div>
        
        <!-- Top Users -->
        <div>
          <h3 class="text-base font-medium text-gray-900 mb-4">Most Active Users</h3>
          <div class="space-y-3">
            <div
              v-for="(user, index) in filteredUserReport.topUsers"
              :key="user.id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <span 
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'"
                >
                  {{ index + 1 }}
                </span>
                <img 
                  :src="user.avatarUrl" 
                  :alt="user.name"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.role }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">{{ user.sessions }}</p>
                <p class="text-xs text-gray-500">sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Responsibility Changes Report -->
    <div v-if="selectedReportType === 'responsibility'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Responsibility Changes</h2>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-900">Users</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Department</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Previous Role</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">New Role</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Changed By</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="r in filteredResponsibilityLogs" :key="r.id" class="hover:bg-gray-50">
              <td class="py-3 px-4 text-sm text-gray-900">
                <div class="flex items-center space-x-3">
                  <img :src="r.avatarUrl" :alt="r.userName" class="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <div class="font-medium">{{ r.userName }}</div>
                    <div class="text-xs text-gray-500">{{ r.email }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">
                {{ formatDept(r.departmentFrom, r.departmentTo) }}
              </td>
              <td class="py-3 px-4 text-sm">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="roleBadgeClass(r.roleFrom)">
                  {{ r.roleFrom }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm">
                <span class="px-2 py-1 text-xs font-medium rounded-full" :class="roleBadgeClass(r.roleTo)">
                  {{ r.roleTo }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">
                {{ r.operator }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Export Options -->
    <div v-if="canExportReports" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Export Options</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportToPDF"
          :disabled="isExporting"
        >
          <FileText class="w-6 h-6 text-red-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Print Report</p>
            <p class="text-xs text-gray-500">Open print dialog</p>
          </div>
        </button>
        
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportToExcel"
          :disabled="isExporting"
        >
          <FileSpreadsheet class="w-6 h-6 text-green-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export to Excel</p>
            <p class="text-xs text-gray-500">Download .xlsx file with styling</p>
          </div>
        </button>
        
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportToCSV"
          :disabled="isExporting"
        >
          <Download class="w-6 h-6 text-blue-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export to CSV</p>
            <p class="text-xs text-gray-500">Download raw data (.csv)</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import * as XLSX from 'xlsx'
import { 
  FileText, 
  Download, 
  Calendar, 
  Monitor, 
  Building, 
  Users, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-vue-next'

// Chart.js imports
declare global {
  interface Window {
    Chart: any;
  }
}

const router = useRouter()
const authStore = useAuthStore()

// Permission checks
const canViewReports = computed(() => authStore.hasPermission('REPORTS_VIEW'))
const canExportReports = computed(() => authStore.hasPermission('REPORTS_EXPORT'))

// Reactive data
const selectedReportType = ref('equipment')
const selectedDateRange = ref('30d')
const selectedLab = ref('')
const customDateStart = ref('')
const customDateEnd = ref('')
const isGenerating = ref(false)
const isExporting = ref(false)
const isLoading = ref(false)

// Chart references
const bookingChartCanvas = ref<HTMLCanvasElement | null>(null)
const equipmentChartCanvas = ref<HTMLCanvasElement | null>(null)
const environmentChartCanvas = ref<HTMLCanvasElement | null>(null)
const userChartCanvas = ref<HTMLCanvasElement | null>(null)

// Chart instances
let bookingChart: any = null
let equipmentChart: any = null
let environmentChart: any = null
let userChart: any = null

// Backend data - using refs instead of computed for direct API responses
const reportStats = ref({
  totalBookings: 0,
  equipmentAvailability: '0%',
  labUtilization: '0%',
  activeUsers: 0,
  bookingGrowth: 0,
  equipmentGrowth: 0,
  utilizationGrowth: 0,
  userGrowth: 0
})

const bookingReport = ref<any[]>([])
const equipmentReport = ref<any[]>([])
const environmentReport = ref<any>({
  avgTemp: 0,
  tempRange: '',
  avgHumidity: 0,
  humidityRange: '',
  avgAirQuality: 0,
  violations: 0,
  recentAlerts: []
})
const userReport = ref<any>({
  activeUsers: 0,
  newUsers: 0,
  avgSession: 0,
  activeDepartment: '',
  topUsers: []
})
const responsibilityLogs = ref<any[]>([])

// Laboratory mapping
const LAB_KEY_TO_ID: Record<string, string> = {
  '': '',
  'ai-lab': '1',
  'iot-lab': '2',
  'cloud-lab': '3',
  'security-lab': '4',
}

const LAB_KEY_TO_NAME: Record<string, string> = {
  '': '',
  'ai-lab': 'AI Laboratory',
  'iot-lab': 'IoT Laboratory',
  'cloud-lab': 'Cloud Computing Lab',
  'security-lab': 'Network Security Lab',
}

// Computed properties for displaying data
const filteredReportStats = computed(() => reportStats.value)
const filteredBookingReport = computed(() => bookingReport.value)
const filteredEquipmentReport = computed(() => equipmentReport.value)
const filteredEnvironmentReport = computed(() => environmentReport.value)
const filteredUserReport = computed(() => userReport.value)
const filteredResponsibilityLogs = computed(() => responsibilityLogs.value)

// Helper methods
const getUsageClass = (usageRate: number) => {
  if (usageRate >= 80) return 'bg-green-100 text-green-800'
  if (usageRate >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const roleBadgeClass = (role: string) => {
  const r = role.toLowerCase()
  if (r.includes('admin')) return 'bg-red-100 text-red-800'
  if (r.includes('researcher')) return 'bg-blue-100 text-blue-800'
  if (r.includes('assistant')) return 'bg-purple-100 text-purple-800'
  if (r.includes('teacher')) return 'bg-indigo-100 text-indigo-800'
  if (r.includes('student')) return 'bg-green-100 text-green-800'
  if (r.includes('visitor')) return 'bg-gray-100 text-gray-800'
  return 'bg-yellow-100 text-yellow-800'
}

const formatDept = (from: string, to: string) => (from === to ? from : `${from} → ${to}`)

// Fetch data from backend
const fetchReportData = async () => {
  isLoading.value = true
  try {
    const params = {
      dateRange: selectedDateRange.value,
      startDate: selectedDateRange.value === 'custom' ? customDateStart.value : undefined,
      endDate: selectedDateRange.value === 'custom' ? customDateEnd.value : undefined,
      labId: selectedLab.value ? LAB_KEY_TO_ID[selectedLab.value] : undefined
    }

    // Fetch stats (always needed for summary cards)
    const statsResponse = await api.reports.getStats(params)
    reportStats.value = statsResponse.data

    // Fetch specific report data based on selected type
    if (selectedReportType.value === 'bookings') {
      const response = await api.reports.getBookingReport(params)
      bookingReport.value = response.data
    } else if (selectedReportType.value === 'equipment') {
      const response = await api.reports.getEquipmentReport(params)
      equipmentReport.value = response.data
    } else if (selectedReportType.value === 'environment') {
      const response = await api.reports.getEnvironmentReport(params)
      environmentReport.value = response.data
    } else if (selectedReportType.value === 'users') {
      const response = await api.reports.getUserReport(params)
      userReport.value = response.data
    } else if (selectedReportType.value === 'responsibility') {
      const respParams = {
        dateRange: selectedDateRange.value,
        startDate: selectedDateRange.value === 'custom' ? customDateStart.value : undefined,
        endDate: selectedDateRange.value === 'custom' ? customDateEnd.value : undefined
      }
      const response = await api.reports.getResponsibilityChanges(respParams)
      responsibilityLogs.value = response.data
    }

    // Update charts after data is loaded
    nextTick(() => {
      updateCharts()
    })
  } catch (error) {
    console.error('Failed to fetch report data:', error)
    alert('Failed to load report data. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const applyFilters = () => {
  console.log('Applying filters:', {
    reportType: selectedReportType.value,
    dateRange: selectedDateRange.value,
    lab: selectedLab.value,
    customStart: customDateStart.value,
    customEnd: customDateEnd.value
  })
  
  // Fetch fresh data from backend
  fetchReportData()
}

const generateReport = async () => {
  isGenerating.value = true
  try {
    await fetchReportData()
    console.log('Report generated successfully')
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isGenerating.value = false
  }
}

// Chart management functions
const loadChartJS = async () => {
  if (window.Chart) {
    setTimeout(initializeCharts, 500)
    return
  }
  
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
  script.onload = () => {
    console.log('Chart.js loaded')
    setTimeout(initializeCharts, 500)
  }
  document.head.appendChild(script)
}

const initializeCharts = () => {
  nextTick(() => {
    updateCharts()
  })
}

const createBookingChart = () => {
  if (!bookingChartCanvas.value || !window.Chart || bookingReport.value.length === 0) return
  
  if (bookingChart) {
    bookingChart.destroy()
  }
  
  const ctx = bookingChartCanvas.value.getContext('2d')
  const data = bookingReport.value
  
  bookingChart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.lab),
      datasets: [
        {
          label: 'Approved',
          data: data.map(item => item.approved),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Rejected',
          data: data.map(item => item.rejected),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Booking Approval Status by Laboratory'
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const createEquipmentChart = () => {
  if (!equipmentChartCanvas.value || !window.Chart || equipmentReport.value.length === 0) return
  
  if (equipmentChart) {
    equipmentChart.destroy()
  }
  
  const ctx = equipmentChartCanvas.value.getContext('2d')
  const data = equipmentReport.value
  
  equipmentChart = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.name),
      datasets: [{
        data: data.map(item => item.usageRate),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(147, 51, 234, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Equipment Usage Rate Distribution'
        },
        legend: {
          position: 'right'
        }
      }
    }
  })
}

const createEnvironmentChart = () => {
  if (!environmentChartCanvas.value || !window.Chart) return
  
  if (environmentChart) {
    environmentChart.destroy()
  }
  
  const ctx = environmentChartCanvas.value.getContext('2d')
  
  // Generate sample data for the last 7 days
  const labels = []
  const tempData = []
  const humidityData = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    tempData.push(22 + Math.random() * 4)
    humidityData.push(50 + Math.random() * 20)
  }
  
  environmentChart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: 'rgba(251, 113, 133, 1)',
          backgroundColor: 'rgba(251, 113, 133, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: humidityData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Environment Conditions (Last 7 Days)'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Humidity (%)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  })
}

const createUserChart = () => {
  if (!userChartCanvas.value || !window.Chart || !userReport.value.topUsers) return
  
  if (userChart) {
    userChart.destroy()
  }
  
  const ctx = userChartCanvas.value.getContext('2d')
  const data = userReport.value.topUsers.slice(0, 5)
  
  if (data.length === 0) return
  
  userChart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map((user: any) => user.name),
      datasets: [{
        label: 'Sessions',
        data: data.map((user: any) => user.sessions),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(156, 163, 175, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderColor: [
          'rgba(251, 191, 36, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Top 5 Most Active Users'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const updateCharts = () => {
  setTimeout(() => {
    if (selectedReportType.value === 'bookings') {
      createBookingChart()
    } else if (selectedReportType.value === 'equipment') {
      createEquipmentChart()
    } else if (selectedReportType.value === 'environment') {
      createEnvironmentChart()
    } else if (selectedReportType.value === 'users') {
      createUserChart()
    }
  }, 100)
}

// Export to Excel with Beautiful Styling
const exportToExcel = () => {
  isExporting.value = true
  
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new()
    
    // Report metadata
    const reportTitle = selectedReportType.value.charAt(0).toUpperCase() + selectedReportType.value.slice(1) + ' Report'
    const currentDate = new Date().toLocaleDateString()
    const selectedLabName = selectedLab.value ? LAB_KEY_TO_NAME[selectedLab.value] : 'All Laboratories'
    
    // Create Summary Sheet
    const summaryData = [
      ['Laboratory Report'],
      [''],
      ['Report Information'],
      ['Report Type', reportTitle],
      ['Date Range', selectedDateRange.value],
      ['Laboratory', selectedLabName],
      ['Generated', currentDate],
      [''],
      ['Summary Statistics'],
      ['Total Bookings', reportStats.value.totalBookings],
      ['Equipment Availability', reportStats.value.equipmentAvailability],
      ['Lab Utilization', reportStats.value.labUtilization],
      ['Active Users', reportStats.value.activeUsers],
      ['Booking Growth', `${reportStats.value.bookingGrowth}%`],
      ['Equipment Growth', `${reportStats.value.equipmentGrowth}%`],
      ['Utilization Growth', `${reportStats.value.utilizationGrowth}%`],
      ['User Growth', `${reportStats.value.userGrowth}%`]
    ]
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Set column widths for summary
    wsSummary['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ]
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
    
    // Add specific report data sheets based on type
    if (selectedReportType.value === 'bookings' && bookingReport.value.length > 0) {
      const bookingData = [
        ['Booking Statistics Report'],
        [''],
        ['Laboratory', 'Total', 'Approved', 'Rejected', 'Utilization Rate', 'Avg Duration (h)']
      ]
      
      bookingReport.value.forEach(item => {
        bookingData.push([
          item.lab,
          item.total,
          item.approved,
          item.rejected,
          `${item.utilizationRate}%`,
          item.avgDuration
        ])
      })
      
      const wsBooking = XLSX.utils.aoa_to_sheet(bookingData)
      wsBooking['!cols'] = [
        { wch: 25 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 18 },
        { wch: 18 }
      ]
      
      XLSX.utils.book_append_sheet(wb, wsBooking, 'Bookings')
    }
    
    if (selectedReportType.value === 'equipment' && equipmentReport.value.length > 0) {
      const equipmentData = [
        ['Equipment Usage Report'],
        [''],
        ['Name', 'Lab', 'Usage Rate', 'Total Hours', 'Active Days', 'Maintenance', 'Status']
      ]
      
      equipmentReport.value.forEach(item => {
        equipmentData.push([
          item.name,
          item.lab,
          `${item.usageRate}%`,
          `${item.totalHours}h`,
          item.activeDays,
          item.maintenanceEvents,
          item.status
        ])
      })
      
      const wsEquipment = XLSX.utils.aoa_to_sheet(equipmentData)
      wsEquipment['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 }
      ]
      
      XLSX.utils.book_append_sheet(wb, wsEquipment, 'Equipment')
    }
    
    if (selectedReportType.value === 'responsibility' && responsibilityLogs.value.length > 0) {
      const responsibilityData = [
        ['Responsibility Changes Report'],
        [''],
        ['User Name', 'Email', 'Dept From', 'Dept To', 'Role From', 'Role To', 'Operator']
      ]
      
      responsibilityLogs.value.forEach(item => {
        responsibilityData.push([
          item.userName,
          item.email,
          item.departmentFrom,
          item.departmentTo,
          item.roleFrom,
          item.roleTo,
          item.operator
        ])
      })
      
      const wsResponsibility = XLSX.utils.aoa_to_sheet(responsibilityData)
      wsResponsibility['!cols'] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 }
      ]
      
      XLSX.utils.book_append_sheet(wb, wsResponsibility, 'Responsibility')
    }
    
    if (selectedReportType.value === 'users' && userReport.value.topUsers) {
      const userData = [
        ['User Activity Report'],
        [''],
        ['Statistics'],
        ['Active Users', userReport.value.activeUsers],
        ['New Users', userReport.value.newUsers],
        ['Avg Session (h)', userReport.value.avgSession],
        ['Active Department', userReport.value.activeDepartment],
        [''],
        ['Top Users'],
        ['Name', 'Role', 'Sessions']
      ]
      
      userReport.value.topUsers.forEach((user: any) => {
        userData.push([
          user.name,
          user.role,
          user.sessions
        ])
      })
      
      const wsUser = XLSX.utils.aoa_to_sheet(userData)
      wsUser['!cols'] = [
        { wch: 25 },
        { wch: 20 },
        { wch: 12 }
      ]
      
      XLSX.utils.book_append_sheet(wb, wsUser, 'Users')
    }
    
    if (selectedReportType.value === 'environment') {
      const envData = [
        ['Environment Data Report'],
        [''],
        ['Avg Temperature', `${environmentReport.value.avgTemp}°C`],
        ['Temperature Range', environmentReport.value.tempRange],
        ['Avg Humidity', `${environmentReport.value.avgHumidity}%`],
        ['Humidity Range', environmentReport.value.humidityRange],
        ['Avg Air Quality', environmentReport.value.avgAirQuality],
        ['Violations', environmentReport.value.violations],
        [''],
        ['Recent Alerts'],
        ['Message', 'Laboratory', 'Timestamp', 'Severity']
      ]
      
      environmentReport.value.recentAlerts.forEach((alert: any) => {
        envData.push([
          alert.message,
          alert.laboratory,
          alert.timestamp,
          alert.severity
        ])
      })
      
      const wsEnv = XLSX.utils.aoa_to_sheet(envData)
      wsEnv['!cols'] = [
        { wch: 40 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 }
      ]
      
      XLSX.utils.book_append_sheet(wb, wsEnv, 'Environment')
    }
    
    // Generate Excel file
    const fileName = `${selectedReportType.value}_report_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    console.log('Excel export completed:', fileName)
  } catch (error) {
    console.error('Error exporting Excel:', error)
    alert('Error exporting Excel file. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Export to CSV (Simple Data)
const exportToCSV = () => {
  isExporting.value = true
  
  try {
    let csvContent = '\uFEFF' // UTF-8 BOM
    
    // Add basic header info
    csvContent += `Report Type,${selectedReportType.value.charAt(0).toUpperCase() + selectedReportType.value.slice(1)}\n`
    csvContent += `Date Range,${selectedDateRange.value}\n`
    csvContent += `Laboratory,${selectedLab.value ? LAB_KEY_TO_NAME[selectedLab.value] : 'All Laboratories'}\n`
    csvContent += `Generated,${new Date().toLocaleDateString()}\n\n`
    
    // Add data based on report type
    if (selectedReportType.value === 'bookings' && bookingReport.value.length > 0) {
      csvContent += `Laboratory,Total,Approved,Rejected,Utilization,Avg Duration\n`
      bookingReport.value.forEach(item => {
        csvContent += `"${item.lab}",${item.total},${item.approved},${item.rejected},${item.utilizationRate}%,${item.avgDuration}h\n`
      })
    } else if (selectedReportType.value === 'equipment' && equipmentReport.value.length > 0) {
      csvContent += `Name,Lab,Usage,Hours,Days,Maintenance,Status\n`
      equipmentReport.value.forEach(item => {
        csvContent += `"${item.name}","${item.lab}",${item.usageRate}%,${item.totalHours}h,${item.activeDays},${item.maintenanceEvents},"${item.status}"\n`
      })
    } else if (selectedReportType.value === 'responsibility' && responsibilityLogs.value.length > 0) {
      csvContent += `User,Email,Dept From,Dept To,Role From,Role To,Operator\n`
      responsibilityLogs.value.forEach(item => {
        csvContent += `"${item.userName}","${item.email}","${item.departmentFrom}","${item.departmentTo}","${item.roleFrom}","${item.roleTo}","${item.operator}"\n`
      })
    } else if (selectedReportType.value === 'users' && userReport.value.topUsers) {
      csvContent += `Name,Role,Sessions\n`
      userReport.value.topUsers.forEach((user: any) => {
        csvContent += `"${user.name}","${user.role}",${user.sessions}\n`
      })
    } else if (selectedReportType.value === 'environment') {
      csvContent += `Message,Laboratory,Timestamp,Severity\n`
      environmentReport.value.recentAlerts.forEach((alert: any) => {
        csvContent += `"${alert.message}","${alert.laboratory}","${alert.timestamp}","${alert.severity}"\n`
      })
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${selectedReportType.value}_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log('CSV export completed')
  } catch (error) {
    console.error('Error exporting CSV:', error)
    alert('Error exporting CSV file. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Export to PDF (Print)
const exportToPDF = () => {
  isExporting.value = true
  
  try {
    const reportTitle = selectedReportType.value.charAt(0).toUpperCase() + selectedReportType.value.slice(1) + ' Report'
    const currentDate = new Date().toLocaleDateString()
    const selectedLabName = selectedLab.value ? LAB_KEY_TO_NAME[selectedLab.value] : 'All Laboratories'
    
    let htmlContent = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #4b5563; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
            .summary { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: 600; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .stat-item { margin: 8px 0; padding: 8px; background: white; border-radius: 4px; }
            .stat-label { font-weight: 600; color: #4b5563; display: inline-block; width: 180px; }
            .stat-value { color: #1f2937; font-weight: 500; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          
          <div class="summary">
            <h2>Report Information</h2>
            <div class="stat-item"><span class="stat-label">Report Type:</span> <span class="stat-value">${reportTitle}</span></div>
            <div class="stat-item"><span class="stat-label">Date Range:</span> <span class="stat-value">${selectedDateRange.value}</span></div>
            <div class="stat-item"><span class="stat-label">Laboratory:</span> <span class="stat-value">${selectedLabName}</span></div>
            <div class="stat-item"><span class="stat-label">Generated:</span> <span class="stat-value">${currentDate}</span></div>
          </div>
          
          <div class="summary">
            <h2>Summary Statistics</h2>
            <div class="stat-item"><span class="stat-label">Total Bookings:</span> <span class="stat-value">${reportStats.value.totalBookings}</span></div>
            <div class="stat-item"><span class="stat-label">Equipment Availability:</span> <span class="stat-value">${reportStats.value.equipmentAvailability}</span></div>
            <div class="stat-item"><span class="stat-label">Lab Utilization:</span> <span class="stat-value">${reportStats.value.labUtilization}</span></div>
            <div class="stat-item"><span class="stat-label">Active Users:</span> <span class="stat-value">${reportStats.value.activeUsers}</span></div>
          </div>
    `
    
    if (selectedReportType.value === 'bookings' && bookingReport.value.length > 0) {
      htmlContent += `
        <h2>Booking Details</h2>
        <table>
          <thead>
            <tr>
              <th>Laboratory</th>
              <th>Total</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Utilization</th>
              <th>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
      `
      bookingReport.value.forEach(item => {
        htmlContent += `
          <tr>
            <td>${item.lab}</td>
            <td>${item.total}</td>
            <td style="color: #16a34a;">${item.approved}</td>
            <td style="color: #dc2626;">${item.rejected}</td>
            <td>${item.utilizationRate}%</td>
            <td>${item.avgDuration}h</td>
          </tr>
        `
      })
      htmlContent += '</tbody></table>'
    }
    
    if (selectedReportType.value === 'equipment' && equipmentReport.value.length > 0) {
      htmlContent += `
        <h2>Equipment Details</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Lab</th>
              <th>Usage</th>
              <th>Hours</th>
              <th>Days</th>
              <th>Maintenance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `
      equipmentReport.value.forEach(item => {
        htmlContent += `
          <tr>
            <td>${item.name}</td>
            <td>${item.lab}</td>
            <td>${item.usageRate}%</td>
            <td>${item.totalHours}h</td>
            <td>${item.activeDays}</td>
            <td>${item.maintenanceEvents}</td>
            <td style="color: ${item.status === 'active' ? '#16a34a' : '#dc2626'};">${item.status}</td>
          </tr>
        `
      })
      htmlContent += '</tbody></table>'
    }
    
    if (selectedReportType.value === 'responsibility' && responsibilityLogs.value.length > 0) {
      htmlContent += `
        <h2>Responsibility Changes</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Dept From</th>
              <th>Dept To</th>
              <th>Role From</th>
              <th>Role To</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
      `
      responsibilityLogs.value.forEach(item => {
        htmlContent += `
          <tr>
            <td>${item.userName}</td>
            <td>${item.email}</td>
            <td>${item.departmentFrom}</td>
            <td>${item.departmentTo}</td>
            <td>${item.roleFrom}</td>
            <td>${item.roleTo}</td>
            <td>${item.operator}</td>
          </tr>
        `
      })
      htmlContent += '</tbody></table>'
    }
    
    htmlContent += '</body></html>'
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()
    } else {
      alert('Please allow popups to print the report')
    }
    
    console.log('PDF export initiated')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Error exporting PDF. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Watch for report type changes
watch(selectedReportType, () => {
  fetchReportData()
})

onMounted(() => {
  // Permission check
  if (!canViewReports.value) {
    console.warn('❌ Access denied: User does not have REPORTS_VIEW permission')
    router.push('/dashboard')
    return
  }

  console.log('✅ Permission check passed: REPORTS_VIEW')
  
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  customDateEnd.value = today.toISOString().split('T')[0]
  customDateStart.value = thirtyDaysAgo.toISOString().split('T')[0]
  loadChartJS()
  fetchReportData()
})
</script>

<style scoped>
canvas {
  max-height: 300px !important;
  width: 100% !important;
  height: auto !important;
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>