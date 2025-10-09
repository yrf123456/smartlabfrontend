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
          class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          @click="exportToExcel"
          :disabled="isExporting"
        >
          <Download class="w-4 h-4 inline mr-2" />
          {{ isExporting ? 'Exporting...' : 'Export CSV' }}
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
            <p class="text-2xl font-bold text-gray-900">{{ filteredReportStats.equipmentUsage }}%</p>
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
    <div class="bg-white rounded-xl p-6 border border-gray-200">
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
            <p class="text-sm font-medium text-gray-900">Export for Excel</p>
            <p class="text-xs text-gray-500">Download CSV format</p>
          </div>
        </button>
        
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="exportToCSV"
          :disabled="isExporting"
        >
          <Download class="w-6 h-6 text-blue-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export Data</p>
            <p class="text-xs text-gray-500">Download raw CSV data</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { 
  FileBarChart, 
  FileText, 
  Download, 
  Calendar, 
  Monitor, 
  Building, 
  Users, 
  BarChart3, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-vue-next'

// Chart.js imports (assuming Chart.js is installed)
declare global {
  interface Window {
    Chart: any;
  }
}

// Reactive data
const selectedReportType = ref('equipment') // Changed default to equipment
const selectedDateRange = ref('30d')
const selectedLab = ref('')
const customDateStart = ref('')
const customDateEnd = ref('')
const isGenerating = ref(false)
const isExporting = ref(false)

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

// Raw data
const rawReportStats = ref({
  totalBookings: 1247,
  equipmentUsage: 78,
  labUtilization: 65,
  activeUsers: 156,
  bookingGrowth: 12,
  equipmentGrowth: 5,
  utilizationGrowth: -3,
  userGrowth: 8
})

const rawBookingReport = ref([
  {
    lab: 'AI Laboratory',
    total: 342,
    approved: 298,
    rejected: 44,
    utilizationRate: 87,
    avgDuration: 3.2
  },
  {
    lab: 'IoT Laboratory',
    total: 256,
    approved: 231,
    rejected: 25,
    utilizationRate: 74,
    avgDuration: 2.8
  },
  {
    lab: 'Cloud Computing Lab',
    total: 398,
    approved: 365,
    rejected: 33,
    utilizationRate: 92,
    avgDuration: 4.1
  },
  {
    lab: 'Network Security Lab',
    total: 251,
    approved: 218,
    rejected: 33,
    utilizationRate: 68,
    avgDuration: 2.5
  }
])

const rawEquipmentReport = ref([
  {
    id: '1',
    name: 'NVIDIA RTX 4090',
    usageRate: 85,
    totalHours: 742,
    activeDays: 28,
    maintenanceEvents: 2,
    status: 'active',
    lab: 'AI Laboratory'
  },
  {
    id: '2',
    name: 'Dell PowerEdge R750',
    usageRate: 92,
    totalHours: 695,
    activeDays: 30,
    maintenanceEvents: 1,
    status: 'active',
    lab: 'Cloud Computing Lab'
  },
  {
    id: '3',
    name: 'Cisco Catalyst 9300',
    usageRate: 67,
    totalHours: 486,
    activeDays: 25,
    maintenanceEvents: 0,
    status: 'active',
    lab: 'Network Security Lab'
  },
  {
    id: '4',
    name: 'Arduino Mega 2560',
    usageRate: 45,
    totalHours: 324,
    activeDays: 18,
    maintenanceEvents: 1,
    status: 'active',
    lab: 'IoT Laboratory'
  },
  {
    id: '5',
    name: 'Oscilloscope DSO-X',
    usageRate: 38,
    totalHours: 275,
    activeDays: 15,
    maintenanceEvents: 3,
    status: 'inactive',
    lab: 'IoT Laboratory'
  },
  {
    id: '6',
    name: 'Raspberry Pi 4',
    usageRate: 72,
    totalHours: 521,
    activeDays: 26,
    maintenanceEvents: 0,
    status: 'active',
    lab: 'IoT Laboratory'
  }
])

const rawEnvironmentReport = ref({
  avgTemp: 23.4,
  tempRange: '18.2°C - 28.1°C',
  avgHumidity: 56,
  humidityRange: '32% - 78%',
  avgAirQuality: 14.2,
  violations: 8,
  recentAlerts: [
    {
      id: '1',
      message: 'Temperature exceeded threshold (28.1°C)',
      laboratory: 'Network Security Lab',
      timestamp: '2025-09-21 14:30',
      severity: 'high' as const
    },
    {
      id: '2',
      message: 'Humidity below minimum (32%)',
      laboratory: 'Network Security Lab',
      timestamp: '2025-09-21 13:15',
      severity: 'medium' as const
    },
    {
      id: '3',
      message: 'PM2.5 levels elevated (28 μg/m³)',
      laboratory: 'IoT Laboratory',
      timestamp: '2025-09-21 11:45',
      severity: 'low' as const
    }
  ]
})

const rawUserReport = ref({
  activeUsers: 156,
  newUsers: 12,
  avgSession: 3.4,
  activeDepartment: 'Computer Science',
  topUsers: [
    {
      id: '1',
      name: 'John Smith',
      role: 'SYSTEM ADMIN',
      sessions: 47,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Dr. Sarah Wilson',
      role: 'STUDENT',
      sessions: 38,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'Prof. Mike Johnson',
      role: 'TEACHER',
      sessions: 35,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'STUDENT',
      sessions: 32,
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'Lisa Chen',
      role: 'STUDENT',
      sessions: 28,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face'
    }
  ]
})

const responsibilityLogs = ref([
  {
    id: 'chg-001',
    userName: 'Emily Davis',
    email: 'emily.davis@university.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    departmentFrom: 'Computer Science',
    departmentTo: 'Information Technology',
    roleFrom: 'Student',
    roleTo: 'Research Assistant',
    operator: 'Dr. Sarah Wilson',
  },
  {
    id: 'chg-002',
    userName: 'John Smith',
    email: 'john.smith@student.university.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    departmentFrom: 'Cybersecurity',
    departmentTo: 'Data Science',
    roleFrom: 'Research Assistant',
    roleTo: 'Researcher',
    operator: 'Prof. Michael Johnson',
  },
  {
    id: 'chg-003',
    userName: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@student.university.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
    departmentFrom: 'Data Science',
    departmentTo: 'Cybersecurity',
    roleFrom: 'Student',
    roleTo: 'Student',
    operator: 'System',
  },
])

// Laboratory mapping
const LAB_KEY_TO_NAME: Record<string, string> = {
  '': '',
  'ai-lab': 'AI Laboratory',
  'iot-lab': 'IoT Laboratory',
  'cloud-lab': 'Cloud Computing Lab',
  'security-lab': 'Network Security Lab',
}

// Computed filtered data
const filteredReportStats = computed(() => {
  // Apply filters to stats based on selected lab and date range
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  
  if (!selectedLabName) {
    return rawReportStats.value
  }
  
  // Filter stats based on lab selection
  const labBookings = rawBookingReport.value.find(b => b.lab === selectedLabName)
  if (labBookings) {
    return {
      ...rawReportStats.value,
      totalBookings: labBookings.total,
      equipmentUsage: labBookings.utilizationRate,
      labUtilization: Math.round(labBookings.utilizationRate * 0.8),
      activeUsers: Math.round(rawReportStats.value.activeUsers * 0.6)
    }
  }
  
  return rawReportStats.value
})

const filteredBookingReport = computed(() => {
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  if (!selectedLabName) {
    return rawBookingReport.value
  }
  return rawBookingReport.value.filter(item => item.lab === selectedLabName)
})

const filteredEquipmentReport = computed(() => {
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  if (!selectedLabName) {
    return rawEquipmentReport.value
  }
  return rawEquipmentReport.value.filter(item => item.lab === selectedLabName)
})

const filteredEnvironmentReport = computed(() => {
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  
  if (!selectedLabName) {
    return rawEnvironmentReport.value
  }
  
  // Filter alerts by lab
  return {
    ...rawEnvironmentReport.value,
    recentAlerts: rawEnvironmentReport.value.recentAlerts.filter(alert => 
      alert.laboratory === selectedLabName
    )
  }
})

const filteredUserReport = computed(() => {
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  
  if (!selectedLabName) {
    return rawUserReport.value
  }
  
  // Simulate filtered user data
  return {
    ...rawUserReport.value,
    activeUsers: Math.round(rawUserReport.value.activeUsers * 0.6),
    newUsers: Math.round(rawUserReport.value.newUsers * 0.5),
    topUsers: rawUserReport.value.topUsers.slice(0, 3)
  }
})

const filteredResponsibilityLogs = computed(() => {
  const selectedLabName = LAB_KEY_TO_NAME[selectedLab.value]
  
  return responsibilityLogs.value.filter(r => {
    if (selectedLabName) {
      const hit = r.departmentFrom.includes(selectedLabName) || r.departmentTo.includes(selectedLabName)
      if (!hit) return false
    }
    return true
  })
})

// Methods
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

const applyFilters = () => {
  console.log('Applying filters:', {
    reportType: selectedReportType.value,
    dateRange: selectedDateRange.value,
    lab: selectedLab.value,
    customStart: customDateStart.value,
    customEnd: customDateEnd.value
  })
  
  // Trigger chart updates
  nextTick(() => {
    updateCharts()
  })
}

const generateReport = async () => {
  isGenerating.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update data based on current filters
    applyFilters()
    
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
    // Chart.js already loaded, initialize immediately
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
    // Initialize chart based on current report type
    updateCharts()
  })
}

const createBookingChart = () => {
  if (!bookingChartCanvas.value || !window.Chart) return
  
  if (bookingChart) {
    bookingChart.destroy()
  }
  
  const ctx = bookingChartCanvas.value.getContext('2d')
  const data = filteredBookingReport.value
  
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
  if (!equipmentChartCanvas.value || !window.Chart) return
  
  if (equipmentChart) {
    equipmentChart.destroy()
  }
  
  const ctx = equipmentChartCanvas.value.getContext('2d')
  const data = filteredEquipmentReport.value
  
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
    tempData.push(22 + Math.random() * 4) // 22-26°C
    humidityData.push(50 + Math.random() * 20) // 50-70%
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
  if (!userChartCanvas.value || !window.Chart) return
  
  if (userChart) {
    userChart.destroy()
  }
  
  const ctx = userChartCanvas.value.getContext('2d')
  const data = filteredUserReport.value.topUsers.slice(0, 5)
  
  userChart = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(user => user.name),
      datasets: [{
        label: 'Sessions',
        data: data.map(user => user.sessions),
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
  // Add delay to ensure DOM is ready
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

// Export functions - Simplified and reliable implementations
const exportToPDF = () => {
  isExporting.value = true
  
  try {
    // Create a simple HTML content for PDF
    const reportTitle = selectedReportType.value.charAt(0).toUpperCase() + selectedReportType.value.slice(1) + ' Report'
    const currentDate = new Date().toLocaleDateString()
    const selectedLabName = selectedLab.value ? LAB_KEY_TO_NAME[selectedLab.value] : 'All Laboratories'
    
    let htmlContent = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            .summary { background: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #007bff; color: white; }
            .stat-item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          
          <div class="summary">
            <h2>Report Information</h2>
            <div class="stat-item"><strong>Generated:</strong> ${currentDate}</div>
            <div class="stat-item"><strong>Date Range:</strong> ${selectedDateRange.value}</div>
            <div class="stat-item"><strong>Laboratory:</strong> ${selectedLabName}</div>
          </div>
          
          <div class="summary">
            <h2>Summary Statistics</h2>
            <div class="stat-item"><strong>Total Bookings:</strong> ${filteredReportStats.value.totalBookings}</div>
            <div class="stat-item"><strong>Equipment Usage:</strong> ${filteredReportStats.value.equipmentUsage}%</div>
            <div class="stat-item"><strong>Lab Utilization:</strong> ${filteredReportStats.value.labUtilization}%</div>
            <div class="stat-item"><strong>Active Users:</strong> ${filteredReportStats.value.activeUsers}</div>
          </div>
    `
    
    // Add report-specific data
    if (selectedReportType.value === 'bookings' && filteredBookingReport.value.length > 0) {
      htmlContent += `
        <h2>Booking Details</h2>
        <table>
          <thead>
            <tr>
              <th>Laboratory</th>
              <th>Total Bookings</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Utilization Rate</th>
              <th>Avg Duration</th>
            </tr>
          </thead>
          <tbody>
      `
      filteredBookingReport.value.forEach(item => {
        htmlContent += `
          <tr>
            <td>${item.lab}</td>
            <td>${item.total}</td>
            <td>${item.approved}</td>
            <td>${item.rejected}</td>
            <td>${item.utilizationRate}%</td>
            <td>${item.avgDuration}h</td>
          </tr>
        `
      })
      htmlContent += '</tbody></table>'
    }
    
    if (selectedReportType.value === 'equipment' && filteredEquipmentReport.value.length > 0) {
      htmlContent += `
        <h2>Equipment Details</h2>
        <table>
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Usage Rate</th>
              <th>Total Hours</th>
              <th>Active Days</th>
              <th>Maintenance Events</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `
      filteredEquipmentReport.value.forEach(item => {
        htmlContent += `
          <tr>
            <td>${item.name}</td>
            <td>${item.usageRate}%</td>
            <td>${item.totalHours}h</td>
            <td>${item.activeDays} days</td>
            <td>${item.maintenanceEvents}</td>
            <td>${item.status}</td>
          </tr>
        `
      })
      htmlContent += '</tbody></table>'
    }
    
    if (selectedReportType.value === 'responsibility' && filteredResponsibilityLogs.value.length > 0) {
      htmlContent += `
        <h2>Responsibility Changes</h2>
        <table>
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Department From</th>
              <th>Department To</th>
              <th>Role From</th>
              <th>Role To</th>
              <th>Changed By</th>
            </tr>
          </thead>
          <tbody>
      `
      filteredResponsibilityLogs.value.forEach(item => {
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
    
    // Open print dialog with the content
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()
    } else {
      alert('Please allow popups to export PDF')
    }
    
    console.log('PDF export initiated')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('Error exporting PDF. Please try again.')
  } finally {
    isExporting.value = false
  }
}

const exportToExcel = () => {
  isExporting.value = true
  
  try {
    // Create CSV content that Excel can open properly
    let csvContent = '\uFEFF' // BOM for UTF-8
    
    // Add metadata
    csvContent += `Laboratory Report\n`
    csvContent += `Report Type,${selectedReportType.value.charAt(0).toUpperCase() + selectedReportType.value.slice(1)}\n`
    csvContent += `Date Range,${selectedDateRange.value}\n`
    csvContent += `Laboratory,${selectedLab.value ? LAB_KEY_TO_NAME[selectedLab.value] : 'All Laboratories'}\n`
    csvContent += `Generated,${new Date().toLocaleDateString()}\n\n`
    
    // Add summary
    csvContent += `Summary Statistics\n`
    csvContent += `Total Bookings,${filteredReportStats.value.totalBookings}\n`
    csvContent += `Equipment Usage,${filteredReportStats.value.equipmentUsage}%\n`
    csvContent += `Lab Utilization,${filteredReportStats.value.labUtilization}%\n`
    csvContent += `Active Users,${filteredReportStats.value.activeUsers}\n\n`
    
    // Add detailed data based on report type
    if (selectedReportType.value === 'bookings' && filteredBookingReport.value.length > 0) {
      csvContent += `Booking Details\n`
      csvContent += `Laboratory,Total Bookings,Approved,Rejected,Utilization Rate,Avg Duration\n`
      filteredBookingReport.value.forEach(item => {
        csvContent += `"${item.lab}",${item.total},${item.approved},${item.rejected},${item.utilizationRate}%,${item.avgDuration}h\n`
      })
    } else if (selectedReportType.value === 'equipment' && filteredEquipmentReport.value.length > 0) {
      csvContent += `Equipment Details\n`
      csvContent += `Equipment Name,Usage Rate,Total Hours,Active Days,Maintenance Events,Status\n`
      filteredEquipmentReport.value.forEach(item => {
        csvContent += `"${item.name}",${item.usageRate}%,${item.totalHours}h,${item.activeDays} days,${item.maintenanceEvents},"${item.status}"\n`
      })
    } else if (selectedReportType.value === 'responsibility' && filteredResponsibilityLogs.value.length > 0) {
      csvContent += `Responsibility Changes\n`
      csvContent += `User Name,Email,Department From,Department To,Role From,Role To,Changed By\n`
      filteredResponsibilityLogs.value.forEach(item => {
        csvContent += `"${item.userName}","${item.email}","${item.departmentFrom}","${item.departmentTo}","${item.roleFrom}","${item.roleTo}","${item.operator}"\n`
      })
    } else if (selectedReportType.value === 'access') {
      csvContent += `Access Data\n`
      csvContent += `Successful Entries,${filteredAccessReport.value.successfulEntries}\n`
      csvContent += `Violations,${filteredAccessReport.value.violations}\n`
      csvContent += `Unique Users,${filteredAccessReport.value.uniqueUsers}\n\n`
      csvContent += `Peak Hours\n`
      csvContent += `Time Range,Access Count\n`
      filteredAccessReport.value.peakHours.forEach(hour => {
        csvContent += `"${hour.time}",${hour.count}\n`
      })
    } else if (selectedReportType.value === 'users') {
      csvContent += `User Activity\n`
      csvContent += `Active Users,${filteredUserReport.value.activeUsers}\n`
      csvContent += `New Users,${filteredUserReport.value.newUsers}\n`
      csvContent += `Avg Session,${filteredUserReport.value.avgSession}h\n`
      csvContent += `Most Active Department,"${filteredUserReport.value.activeDepartment}"\n\n`
      csvContent += `Top Users\n`
      csvContent += `User Name,Role,Sessions\n`
      filteredUserReport.value.topUsers.forEach(user => {
        csvContent += `"${user.name}","${user.role}",${user.sessions}\n`
      })
    } else if (selectedReportType.value === 'environment') {
      csvContent += `Environment Data\n`
      csvContent += `Average Temperature,${filteredEnvironmentReport.value.avgTemp}°C\n`
      csvContent += `Temperature Range,"${filteredEnvironmentReport.value.tempRange}"\n`
      csvContent += `Average Humidity,${filteredEnvironmentReport.value.avgHumidity}%\n`
      csvContent += `Humidity Range,"${filteredEnvironmentReport.value.humidityRange}"\n`
      csvContent += `Average Air Quality,${filteredEnvironmentReport.value.avgAirQuality}\n`
      csvContent += `Violations,${filteredEnvironmentReport.value.violations}\n\n`
      csvContent += `Recent Alerts\n`
      csvContent += `Message,Laboratory,Timestamp,Severity\n`
      filteredEnvironmentReport.value.recentAlerts.forEach(alert => {
        csvContent += `"${alert.message}","${alert.laboratory}","${alert.timestamp}","${alert.severity}"\n`
      })
    }
    
    // Create and download file
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
    
    console.log('Excel-compatible CSV exported successfully')
  } catch (error) {
    console.error('Error exporting Excel:', error)
    alert('Error exporting Excel file. Please try again.')
  } finally {
    isExporting.value = false
  }
}

const exportToCSV = () => {
  isExporting.value = true
  
  try {
    let csvContent = '\uFEFF' // BOM for proper UTF-8 encoding
    let fileName = ''
    
    if (selectedReportType.value === 'bookings' && filteredBookingReport.value.length > 0) {
      csvContent += 'Laboratory,Total Bookings,Approved,Rejected,Utilization Rate,Avg Duration\n'
      filteredBookingReport.value.forEach(item => {
        csvContent += `"${item.lab}",${item.total},${item.approved},${item.rejected},${item.utilizationRate}%,${item.avgDuration}h\n`
      })
      fileName = `booking_report_${new Date().toISOString().split('T')[0]}.csv`
    } 
    else if (selectedReportType.value === 'equipment' && filteredEquipmentReport.value.length > 0) {
      csvContent += 'Equipment Name,Usage Rate,Total Hours,Active Days,Maintenance Events,Status\n'
      filteredEquipmentReport.value.forEach(item => {
        csvContent += `"${item.name}",${item.usageRate}%,${item.totalHours}h,${item.activeDays} days,${item.maintenanceEvents},"${item.status}"\n`
      })
      fileName = `equipment_report_${new Date().toISOString().split('T')[0]}.csv`
    } 
    else if (selectedReportType.value === 'responsibility' && filteredResponsibilityLogs.value.length > 0) {
      csvContent += 'User Name,Email,Department From,Department To,Role From,Role To,Changed By\n'
      filteredResponsibilityLogs.value.forEach(item => {
        csvContent += `"${item.userName}","${item.email}","${item.departmentFrom}","${item.departmentTo}","${item.roleFrom}","${item.roleTo}","${item.operator}"\n`
      })
      fileName = `responsibility_report_${new Date().toISOString().split('T')[0]}.csv`
    } 
    else if (selectedReportType.value === 'users') {
      csvContent += 'Metric,Value\n'
      csvContent += `"Active Users",${filteredUserReport.value.activeUsers}\n`
      csvContent += `"New Users",${filteredUserReport.value.newUsers}\n`
      csvContent += `"Average Session Duration","${filteredUserReport.value.avgSession}h"\n`
      csvContent += `"Most Active Department","${filteredUserReport.value.activeDepartment}"\n\n`
      csvContent += 'User Name,Role,Sessions\n'
      filteredUserReport.value.topUsers.forEach(user => {
        csvContent += `"${user.name}","${user.role}",${user.sessions}\n`
      })
      fileName = `user_report_${new Date().toISOString().split('T')[0]}.csv`
    } 
    else if (selectedReportType.value === 'environment') {
      csvContent += 'Environment Metric,Value\n'
      csvContent += `"Average Temperature","${filteredEnvironmentReport.value.avgTemp}°C"\n`
      csvContent += `"Temperature Range","${filteredEnvironmentReport.value.tempRange}"\n`
      csvContent += `"Average Humidity","${filteredEnvironmentReport.value.avgHumidity}%"\n`
      csvContent += `"Humidity Range","${filteredEnvironmentReport.value.humidityRange}"\n`
      csvContent += `"Average Air Quality",${filteredEnvironmentReport.value.avgAirQuality}\n`
      csvContent += `"Violations",${filteredEnvironmentReport.value.violations}\n\n`
      csvContent += 'Alert Message,Laboratory,Timestamp,Severity\n'
      filteredEnvironmentReport.value.recentAlerts.forEach(alert => {
        csvContent += `"${alert.message}","${alert.laboratory}","${alert.timestamp}","${alert.severity}"\n`
      })
      fileName = `environment_report_${new Date().toISOString().split('T')[0]}.csv`
    } 
    else {
      csvContent += 'Message\n'
      csvContent += '"No data available for the selected filters"\n'
      fileName = `report_${new Date().toISOString().split('T')[0]}.csv`
    }
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
    
    console.log('CSV exported successfully:', fileName)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    alert('Error exporting CSV file. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Watch for report type changes to update charts
watch(selectedReportType, () => {
  nextTick(() => {
    updateCharts()
  })
})

onMounted(() => {
  // Initialize default date range
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  customDateEnd.value = today.toISOString().split('T')[0]
  customDateStart.value = thirtyDaysAgo.toISOString().split('T')[0]
  
  // Load Chart.js and initialize charts
  loadChartJS()
  
  // Load initial report data
  applyFilters()
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