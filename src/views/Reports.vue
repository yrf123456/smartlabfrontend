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
        >
          <FileText class="w-4 h-4 inline mr-2" />
          Generate Report
        </button>
        
        <button 
          class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
          @click="exportToExcel"
        >
          <Download class="w-4 h-4 inline mr-2" />
          Export Excel
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
          >
            <option value="bookings">Booking Statistics</option>
            <option value="equipment">Equipment Usage</option>
            <option value="access">Access Logs</option>
            <option value="environment">Environment Data</option>
            <option value="users">User Activity</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select 
            v-model="selectedDateRange" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
          >
          <span class="text-gray-500">to</span>
          <input 
            v-model="customDateEnd"
            type="date" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
          <select 
            v-model="selectedLab" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Laboratories</option>
            <option value="ai-lab">AI Laboratory</option>
            <option value="iot-lab">IoT Laboratory</option>
            <option value="cloud-lab">Cloud Computing Lab</option>
            <option value="security-lab">Network Security Lab</option>
          </select>
        </div>
        
        <button 
          class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          @click="applyFilters"
        >
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Report Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Bookings</p>
            <p class="text-2xl font-bold text-gray-900">{{ reportStats.totalBookings }}</p>
            <p class="text-xs text-green-600 mt-1">+12% from last period</p>
          </div>
          <Calendar class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Equipment Usage</p>
            <p class="text-2xl font-bold text-gray-900">{{ reportStats.equipmentUsage }}%</p>
            <p class="text-xs text-green-600 mt-1">+5% from last period</p>
          </div>
          <Monitor class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Lab Utilization</p>
            <p class="text-2xl font-bold text-gray-900">{{ reportStats.labUtilization }}%</p>
            <p class="text-xs text-red-600 mt-1">-3% from last period</p>
          </div>
          <Building class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ reportStats.activeUsers }}</p>
            <p class="text-xs text-green-600 mt-1">+8% from last period</p>
          </div>
          <Users class="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>

    <!-- Booking Statistics Report -->
    <div v-if="selectedReportType === 'bookings'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Booking Statistics Report</h2>
      
      <!-- Chart Area -->
      <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
        <div class="text-center">
          <BarChart3 class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500">Booking trends chart would display here</p>
          <p class="text-sm text-gray-400 mt-1">Showing {{ selectedDateRange }} data</p>
        </div>
      </div>
      
      <!-- Booking Details Table -->
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
            <tr v-for="item in bookingReport" :key="item.lab" class="hover:bg-gray-50">
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
      
      <!-- Equipment Usage Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="equipment in equipmentReport"
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

    <!-- Access Logs Report -->
    <div v-if="selectedReportType === 'access'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Access Logs Report</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Access Summary -->
        <div class="space-y-4">
          <h3 class="text-base font-medium text-gray-900">Access Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span class="text-sm font-medium text-green-800">Successful Entries</span>
              <span class="text-lg font-bold text-green-900">{{ accessReport.successfulEntries }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span class="text-sm font-medium text-red-800">Access Violations</span>
              <span class="text-lg font-bold text-red-900">{{ accessReport.violations }}</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span class="text-sm font-medium text-blue-800">Unique Users</span>
              <span class="text-lg font-bold text-blue-900">{{ accessReport.uniqueUsers }}</span>
            </div>
          </div>
        </div>
        
        <!-- Peak Hours -->
        <div class="space-y-4">
          <h3 class="text-base font-medium text-gray-900">Peak Access Hours</h3>
          <div class="space-y-2">
            <div
              v-for="hour in accessReport.peakHours"
              :key="hour.time"
              class="flex justify-between items-center p-2 border border-gray-200 rounded-lg"
            >
              <span class="text-sm text-gray-700">{{ hour.time }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    class="h-2 bg-blue-500 rounded-full"
                    :style="{ width: `${(hour.count / Math.max(...accessReport.peakHours.map(h => h.count))) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ hour.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Environment Data Report -->
    <div v-if="selectedReportType === 'environment'" class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Environment Data Report</h2>
      
      <!-- Environment Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Thermometer class="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Temperature</p>
          <p class="text-xl font-bold text-gray-900">{{ environmentReport.avgTemp }}°C</p>
          <p class="text-xs text-gray-500">Range: {{ environmentReport.tempRange }}</p>
        </div>
        
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Droplets class="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Humidity</p>
          <p class="text-xl font-bold text-gray-900">{{ environmentReport.avgHumidity }}%</p>
          <p class="text-xs text-gray-500">Range: {{ environmentReport.humidityRange }}</p>
        </div>
        
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <Wind class="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Avg Air Quality</p>
          <p class="text-xl font-bold text-gray-900">{{ environmentReport.avgAirQuality }}</p>
          <p class="text-xs text-gray-500">PM2.5 μg/m³</p>
        </div>
        
        <div class="text-center p-4 border border-gray-200 rounded-xl">
          <AlertTriangle class="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600">Threshold Violations</p>
          <p class="text-xl font-bold text-gray-900">{{ environmentReport.violations }}</p>
          <p class="text-xs text-gray-500">Alerts triggered</p>
        </div>
      </div>
      
      <!-- Environment Alerts -->
      <div class="border-t border-gray-200 pt-6">
        <h3 class="text-base font-medium text-gray-900 mb-4">Recent Environment Alerts</h3>
        <div class="space-y-3">
          <div
            v-for="alert in environmentReport.recentAlerts"
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
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Statistics -->
        <div>
          <h3 class="text-base font-medium text-gray-900 mb-4">User Statistics</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Total Active Users</span>
              <span class="text-lg font-bold text-gray-900">{{ userReport.activeUsers }}</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">New Registrations</span>
              <span class="text-lg font-bold text-green-600">{{ userReport.newUsers }}</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Average Session Duration</span>
              <span class="text-lg font-bold text-blue-600">{{ userReport.avgSession }}h</span>
            </div>
            <div class="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Most Active Department</span>
              <span class="text-lg font-bold text-purple-600">{{ userReport.activeDepartment }}</span>
            </div>
          </div>
        </div>
        
        <!-- Top Users -->
        <div>
          <h3 class="text-base font-medium text-gray-900 mb-4">Most Active Users</h3>
          <div class="space-y-3">
            <div
              v-for="(user, index) in userReport.topUsers"
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

    <!-- Export Options -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Export Options</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="exportToPDF"
        >
          <FileText class="w-6 h-6 text-red-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export to PDF</p>
            <p class="text-xs text-gray-500">Generate PDF report</p>
          </div>
        </button>
        
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="exportToExcel"
        >
          <FileSpreadsheet class="w-6 h-6 text-green-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export to Excel</p>
            <p class="text-xs text-gray-500">Download Excel file</p>
          </div>
        </button>
        
        <button 
          class="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="exportToCSV"
        >
          <Download class="w-6 h-6 text-blue-600" />
          <div class="text-left">
            <p class="text-sm font-medium text-gray-900">Export to CSV</p>
            <p class="text-xs text-gray-500">Download CSV data</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

// Reactive data
const selectedReportType = ref('bookings')
const selectedDateRange = ref('30d')
const selectedLab = ref('')
const customDateStart = ref('')
const customDateEnd = ref('')

const reportStats = ref({
  totalBookings: 1247,
  equipmentUsage: 78,
  labUtilization: 65,
  activeUsers: 156
})

const bookingReport = ref([
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

const equipmentReport = ref([
  {
    id: '1',
    name: 'NVIDIA RTX 4090',
    usageRate: 85,
    totalHours: 742,
    activeDays: 28,
    maintenanceEvents: 2,
    status: 'active'
  },
  {
    id: '2',
    name: 'Dell PowerEdge R750',
    usageRate: 92,
    totalHours: 695,
    activeDays: 30,
    maintenanceEvents: 1,
    status: 'active'
  },
  {
    id: '3',
    name: 'Cisco Catalyst 9300',
    usageRate: 67,
    totalHours: 486,
    activeDays: 25,
    maintenanceEvents: 0,
    status: 'active'
  },
  {
    id: '4',
    name: 'Arduino Mega 2560',
    usageRate: 45,
    totalHours: 324,
    activeDays: 18,
    maintenanceEvents: 1,
    status: 'active'
  },
  {
    id: '5',
    name: 'Oscilloscope DSO-X',
    usageRate: 38,
    totalHours: 275,
    activeDays: 15,
    maintenanceEvents: 3,
    status: 'inactive'
  },
  {
    id: '6',
    name: 'Raspberry Pi 4',
    usageRate: 72,
    totalHours: 521,
    activeDays: 26,
    maintenanceEvents: 0,
    status: 'active'
  }
])

const accessReport = ref({
  successfulEntries: 1425,
  violations: 23,
  uniqueUsers: 142,
  peakHours: [
    { time: '08:00-09:00', count: 89 },
    { time: '09:00-10:00', count: 156 },
    { time: '10:00-11:00', count: 134 },
    { time: '14:00-15:00', count: 98 },
    { time: '15:00-16:00', count: 112 }
  ]
})

const environmentReport = ref({
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
      severity: 'high'
    },
    {
      id: '2',
      message: 'Humidity below minimum (32%)',
      laboratory: 'Network Security Lab',
      timestamp: '2025-09-21 13:15',
      severity: 'medium'
    },
    {
      id: '3',
      message: 'PM2.5 levels elevated (28 μg/m³)',
      laboratory: 'IoT Laboratory',
      timestamp: '2025-09-21 11:45',
      severity: 'low'
    }
  ]
})

const userReport = ref({
  activeUsers: 156,
  newUsers: 12,
  avgSession: 3.4,
  activeDepartment: 'Computer Science',
  topUsers: [
    {
      id: '1',
      name: 'Dr. Sarah Wilson',
      role: 'TEACHER',
      sessions: 47,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=64&h=64&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'John Smith',
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

// Methods
const getUsageClass = (usageRate: number) => {
  if (usageRate >= 80) return 'bg-green-100 text-green-800'
  if (usageRate >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const applyFilters = () => {
  console.log('Applying filters:', {
    reportType: selectedReportType.value,
    dateRange: selectedDateRange.value,
    lab: selectedLab.value,
    customStart: customDateStart.value,
    customEnd: customDateEnd.value
  })
  
  // Simulate filter application with loading state
  // In real implementation, this would fetch filtered data from API
}

const generateReport = () => {
  console.log('Generating report for:', selectedReportType.value)
  // Simulate report generation
}

const exportToPDF = () => {
  console.log('Exporting to PDF...')
  // Simulate PDF export
  setTimeout(() => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${selectedReportType.value}_report_${new Date().toISOString().split('T')[0]}.pdf`
    link.click()
  }, 1000)
}

const exportToExcel = () => {
  console.log('Exporting to Excel...')
  // Simulate Excel export
  setTimeout(() => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${selectedReportType.value}_report_${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
  }, 1000)
}

const exportToCSV = () => {
  console.log('Exporting to CSV...')
  // Simulate CSV export
  let csvContent = ''
  
  if (selectedReportType.value === 'bookings') {
    csvContent = 'Laboratory,Total Bookings,Approved,Rejected,Utilization Rate,Avg Duration\n'
    bookingReport.value.forEach(item => {
      csvContent += `${item.lab},${item.total},${item.approved},${item.rejected},${item.utilizationRate}%,${item.avgDuration}h\n`
    })
  } else if (selectedReportType.value === 'equipment') {
    csvContent = 'Equipment Name,Usage Rate,Total Hours,Active Days,Maintenance Events,Status\n'
    equipmentReport.value.forEach(item => {
      csvContent += `${item.name},${item.usageRate}%,${item.totalHours},${item.activeDays},${item.maintenanceEvents},${item.status}\n`
    })
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${selectedReportType.value}_report_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  // Initialize default date range
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  customDateEnd.value = today.toISOString().split('T')[0]
  customDateStart.value = thirtyDaysAgo.toISOString().split('T')[0]
  
  // Load initial report data
  applyFilters()
})
</script>