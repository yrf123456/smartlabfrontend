<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.environment') }}</h1>
        <p class="text-gray-600 mt-1">Monitor laboratory environmental data and conditions</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <select 
          v-model="selectedTimeRange" 
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          @change="updateChart"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="exportData"
        >
          <Download class="w-4 h-4 inline mr-2" />
          Export Data
        </button>
      </div>
    </div>

    <!-- Alert Summary -->
    <div 
      v-if="activeAlerts.length > 0"
      class="bg-red-50 border border-red-200 rounded-xl p-4"
    >
      <div class="flex items-center space-x-2 mb-2">
        <AlertTriangle class="w-5 h-5 text-red-600" />
        <h3 class="text-sm font-medium text-red-800">Active Environmental Alerts</h3>
      </div>
      <div class="space-y-1">
        <p 
          v-for="alert in activeAlerts" 
          :key="alert.id"
          class="text-sm text-red-700"
        >
          <strong>{{ alert.location }}:</strong> {{ alert.message }}
        </p>
      </div>
    </div>

    <!-- Laboratory Environment Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="lab in laboratories"
        :key="lab.id"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <!-- Lab Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <component :is="lab.icon" class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ lab.name }}</h3>
              <p class="text-sm text-gray-500">{{ lab.location }}</p>
            </div>
          </div>
          <span 
            class="px-2 py-1 text-xs font-medium rounded-full"
            :class="getStatusClass(lab.status)"
          >
            {{ getStatusText(lab.status) }}
          </span>
        </div>

        <!-- Environmental Metrics -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- Temperature -->
          <div class="bg-orange-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Thermometer class="w-4 h-4 text-orange-600" />
              <span class="text-xs font-medium text-orange-800">Temperature</span>
            </div>
            <p class="text-lg font-bold text-orange-900">{{ lab.environment.temperature }}°C</p>
            <p class="text-xs text-orange-600">Range: 18-25°C</p>
          </div>

          <!-- Humidity -->
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Droplets class="w-4 h-4 text-blue-600" />
              <span class="text-xs font-medium text-blue-800">Humidity</span>
            </div>
            <p class="text-lg font-bold text-blue-900">{{ lab.environment.humidity }}%</p>
            <p class="text-xs text-blue-600">Range: 40-60%</p>
          </div>

          <!-- Air Quality (PM2.5) -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Wind class="w-4 h-4 text-green-600" />
              <span class="text-xs font-medium text-green-800">Air Quality</span>
            </div>
            <p class="text-lg font-bold text-green-900">{{ lab.environment.pm25 }} μg/m³</p>
            <p class="text-xs text-green-600">PM2.5 Level</p>
          </div>

          <!-- Noise Level -->
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Volume2 class="w-4 h-4 text-purple-600" />
              <span class="text-xs font-medium text-purple-800">Noise</span>
            </div>
            <p class="text-lg font-bold text-purple-900">{{ lab.environment.noise }} dB</p>
            <p class="text-xs text-purple-600">Sound Level</p>
          </div>
        </div>

        <!-- Additional Metrics -->
        <div class="space-y-2 border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center space-x-2 text-gray-600">
              <Zap class="w-4 h-4" />
              <span>Power Consumption</span>
            </span>
            <span class="font-medium text-gray-900">{{ lab.environment.power }} kW</span>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center space-x-2 text-gray-600">
              <Gauge class="w-4 h-4" />
              <span>Air Pressure</span>
            </span>
            <span class="font-medium text-gray-900">{{ lab.environment.pressure }} hPa</span>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center space-x-2 text-gray-600">
              <Clock class="w-4 h-4" />
              <span>Last Updated</span>
            </span>
            <span class="font-medium text-gray-900">{{ lab.lastUpdated }}</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button 
            class="flex-1 bg-primary-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            @click="viewHistory(lab.id)"
          >
            View History
          </button>
          <button 
            class="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            @click="editLabData(lab.id)"
          >
            Edit
          </button>
        </div>
      </div>
    </div>

    <!-- Environmental Trends Chart -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Environmental Trends</h2>
        <div class="flex items-center space-x-2">
          <select 
            v-model="selectedLab" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            @change="updateChart"
          >
            <option value="">All Laboratories</option>
            <option 
              v-for="lab in laboratories" 
              :key="lab.id" 
              :value="lab.id"
            >
              {{ lab.name }}
            </option>
          </select>
          
          <select 
            v-model="selectedMetric" 
            class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            @change="updateChart"
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="pm25">Air Quality</option>
            <option value="noise">Noise Level</option>
          </select>
        </div>
      </div>

      <!-- Real Chart -->
      <div class="bg-gray-50 rounded-lg p-4" style="height: 320px;">
        <canvas ref="environmentChart" style="max-height: 300px;"></canvas>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Sensors</p>
            <p class="text-2xl font-bold text-gray-900">{{ environmentStats.totalSensors }}</p>
          </div>
          <Activity class="w-8 h-8 text-primary-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Alerts</p>
            <p class="text-2xl font-bold text-red-600">{{ environmentStats.activeAlerts }}</p>
          </div>
          <AlertTriangle class="w-8 h-8 text-red-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Avg Temperature</p>
            <p class="text-2xl font-bold text-orange-600">{{ environmentStats.avgTemperature }}°C</p>
          </div>
          <Thermometer class="w-8 h-8 text-orange-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Data Uptime</p>
            <p class="text-2xl font-bold text-green-600">{{ environmentStats.uptime }}%</p>
          </div>
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div 
      v-if="showHistoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showHistoryModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">
            Environmental History - {{ selectedLabData?.name }}
          </h3>
          <button 
            @click="showHistoryModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <!-- History Chart -->
        <div class="mb-6 bg-gray-50 rounded-lg p-4" style="height: 300px;">
          <canvas ref="historyChart" style="max-height: 280px;"></canvas>
        </div>
        
        <!-- History Data Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-2 px-3 font-medium text-gray-900">Time</th>
                <th class="text-left py-2 px-3 font-medium text-gray-900">Temperature</th>
                <th class="text-left py-2 px-3 font-medium text-gray-900">Humidity</th>
                <th class="text-left py-2 px-3 font-medium text-gray-900">Air Quality</th>
                <th class="text-left py-2 px-3 font-medium text-gray-900">Noise</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="record in historyData" :key="record.time" class="hover:bg-gray-50">
                <td class="py-2 px-3 text-sm text-gray-900">{{ record.time }}</td>
                <td class="py-2 px-3 text-sm text-gray-900">{{ record.temperature }}°C</td>
                <td class="py-2 px-3 text-sm text-gray-900">{{ record.humidity }}%</td>
                <td class="py-2 px-3 text-sm text-gray-900">{{ record.pm25 }} μg/m³</td>
                <td class="py-2 px-3 text-sm text-gray-900">{{ record.noise }} dB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Lab Data Modal -->
    <div 
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showEditModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Edit Environmental Data</h3>
          <button 
            @click="showEditModal = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="saveLabData" class="space-y-4" v-if="editingLab">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
            <input 
              :value="editingLab.name"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
              readonly
            >
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input 
                v-model.number="editForm.temperature"
                type="number" 
                step="0.1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
              <input 
                v-model.number="editForm.humidity"
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">PM2.5 (μg/m³)</label>
              <input 
                v-model.number="editForm.pm25"
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Noise (dB)</label>
              <input 
                v-model.number="editForm.noise"
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Power (kW)</label>
              <input 
                v-model.number="editForm.power"
                type="number" 
                step="0.1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pressure (hPa)</label>
              <input 
                v-model.number="editForm.pressure"
                type="number" 
                step="0.1"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
            </div>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Save Changes
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showEditModal = false"
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Volume2, 
  Zap, 
  Gauge, 
  Clock, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  Cpu,
  Smartphone,
  Cloud,
  Shield,
  X
} from 'lucide-vue-next'

// Chart.js global interface
declare global {
  interface Window {
    Chart: any;
  }
}

// Reactive data
const selectedTimeRange = ref('24h')
const selectedLab = ref('')
const selectedMetric = ref('temperature')
const showHistoryModal = ref(false)
const showEditModal = ref(false)
const selectedLabData = ref<any>(null)
const editingLab = ref<any>(null)

// Chart references
const environmentChart = ref<HTMLCanvasElement | null>(null)
const historyChart = ref<HTMLCanvasElement | null>(null)

// Chart instances
let mainChart: any = null
let detailChart: any = null

const editForm = ref({
  temperature: 0,
  humidity: 0,
  pm25: 0,
  noise: 0,
  power: 0,
  pressure: 0
})

const laboratories = ref([
  {
    id: 'ai-lab',
    name: 'AI Laboratory',
    location: 'Building A, Floor 3',
    icon: Cpu,
    status: 'normal',
    environment: {
      temperature: 23.5,
      humidity: 55,
      pm25: 12,
      noise: 38,
      power: 15.2,
      pressure: 1013.25
    },
    lastUpdated: '2 min ago'
  },
  {
    id: 'iot-lab',
    name: 'IoT Laboratory',
    location: 'Building B, Floor 2',
    icon: Smartphone,
    status: 'warning',
    environment: {
      temperature: 26.8,
      humidity: 72,
      pm25: 18,
      noise: 42,
      power: 8.7,
      pressure: 1012.8
    },
    lastUpdated: '5 min ago'
  },
  {
    id: 'cloud-lab',
    name: 'Cloud Computing Lab',
    location: 'Building C, Floor 1',
    icon: Cloud,
    status: 'normal',
    environment: {
      temperature: 22.1,
      humidity: 48,
      pm25: 8,
      noise: 35,
      power: 22.4,
      pressure: 1014.1
    },
    lastUpdated: '1 min ago'
  },
  {
    id: 'security-lab',
    name: 'Network Security Lab',
    location: 'Building A, Floor 2',
    icon: Shield,
    status: 'critical',
    environment: {
      temperature: 28.2,
      humidity: 35,
      pm25: 25,
      noise: 45,
      power: 12.1,
      pressure: 1011.5
    },
    lastUpdated: '3 min ago'
  },
  {
    id: 'research-lab',
    name: 'Research Lab',
    location: 'Building D, Floor 4',
    icon: Activity,
    status: 'normal',
    environment: {
      temperature: 24.0,
      humidity: 52,
      pm25: 10,
      noise: 40,
      power: 18.9,
      pressure: 1013.7
    },
    lastUpdated: '4 min ago'
  }
])

const activeAlerts = ref([
  {
    id: 'alert-1',
    location: 'IoT Laboratory',
    message: 'Humidity level exceeds normal range (72%)'
  },
  {
    id: 'alert-2',
    location: 'Network Security Lab',
    message: 'Temperature too high (28.2°C)'
  },
  {
    id: 'alert-3',
    location: 'Network Security Lab',
    message: 'Humidity below minimum threshold (35%)'
  }
])

const environmentStats = computed(() => {
  const totalSensors = laboratories.value.length * 6; // 6 sensors per lab
  const activeAlertsCount = activeAlerts.value.length;
  const avgTemp = laboratories.value.reduce((sum, lab) => sum + lab.environment.temperature, 0) / laboratories.value.length;
  
  return {
    totalSensors,
    activeAlerts: activeAlertsCount,
    avgTemperature: Math.round(avgTemp * 10) / 10,
    uptime: 99.2
  }
})

// Generate mock history data
const historyData = ref<any[]>([])

const generateHistoryData = () => {
  const data = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      temperature: Math.round((22 + Math.random() * 6) * 10) / 10,
      humidity: Math.round(45 + Math.random() * 30),
      pm25: Math.round(8 + Math.random() * 20),
      noise: Math.round(35 + Math.random() * 15)
    })
  }
  
  historyData.value = data
}

// Methods
const getStatusClass = (status: string) => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800'
    case 'critical':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return 'Normal'
    case 'warning':
      return 'Warning'
    case 'critical':
      return 'Critical'
    default:
      return 'Unknown'
  }
}

const viewHistory = (labId: string) => {
  selectedLabData.value = laboratories.value.find(lab => lab.id === labId)
  showHistoryModal.value = true
  
  nextTick(() => {
    createHistoryChart()
  })
}

const editLabData = (labId: string) => {
  editingLab.value = laboratories.value.find(lab => lab.id === labId)
  if (editingLab.value) {
    editForm.value = { ...editingLab.value.environment }
    showEditModal.value = true
  }
}

const saveLabData = () => {
  if (editingLab.value) {
    // Update the lab data
    editingLab.value.environment = { ...editForm.value }
    editingLab.value.lastUpdated = 'Just now'
    
    // Update status based on values
    const temp = editForm.value.temperature
    const humidity = editForm.value.humidity
    
    if (temp < 18 || temp > 25 || humidity < 40 || humidity > 60) {
      if (temp < 15 || temp > 28 || humidity < 30 || humidity > 70) {
        editingLab.value.status = 'critical'
      } else {
        editingLab.value.status = 'warning'
      }
    } else {
      editingLab.value.status = 'normal'
    }
    
    showEditModal.value = false
    updateChart()
  }
}

const exportData = () => {
  // Create CSV content
  let csvContent = '\uFEFF' // BOM for UTF-8
  csvContent += 'Laboratory,Temperature,Humidity,PM2.5,Noise,Power,Pressure,Status,Last Updated\n'
  
  laboratories.value.forEach(lab => {
    csvContent += `"${lab.name}",${lab.environment.temperature},${lab.environment.humidity},${lab.environment.pm25},${lab.environment.noise},${lab.environment.power},${lab.environment.pressure},"${lab.status}","${lab.lastUpdated}"\n`
  })
  
  // Download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `environment_data_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Chart functions
const loadChartJS = async () => {
  if (window.Chart) {
    setTimeout(initializeChart, 500)
    return
  }
  
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js'
  script.onload = () => {
    console.log('Chart.js loaded')
    setTimeout(initializeChart, 500)
  }
  document.head.appendChild(script)
}

const initializeChart = () => {
  nextTick(() => {
    createMainChart()
  })
}

const createMainChart = () => {
  if (!environmentChart.value || !window.Chart) return
  
  if (mainChart) {
    mainChart.destroy()
  }
  
  const ctx = environmentChart.value.getContext('2d')
  
  // Generate sample data based on current labs and metric
  const labels = []
  const datasets = []
  
  // Time labels for last 24 hours
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    labels.push(time.getHours().toString().padStart(2, '0') + ':00')
  }
  
  const colors = [
    'rgba(59, 130, 246, 1)',   // blue
    'rgba(34, 197, 94, 1)',    // green  
    'rgba(251, 191, 36, 1)',   // yellow
    'rgba(239, 68, 68, 1)',    // red
    'rgba(147, 51, 234, 1)',   // purple
  ]
  
  const fillColors = [
    'rgba(59, 130, 246, 0.1)',
    'rgba(34, 197, 94, 0.1)', 
    'rgba(251, 191, 36, 0.1)',
    'rgba(239, 68, 68, 0.1)',
    'rgba(147, 51, 234, 0.1)',
  ]
  
  if (selectedLab.value) {
    // Show single lab data
    const lab = laboratories.value.find(l => l.id === selectedLab.value)
    if (lab) {
      const baseValue = lab.environment[selectedMetric.value as keyof typeof lab.environment] as number
      const data = labels.map(() => baseValue + (Math.random() - 0.5) * baseValue * 0.1)
      
      datasets.push({
        label: lab.name,
        data: data,
        borderColor: colors[0],
        backgroundColor: fillColors[0],
        borderWidth: 2,
        fill: true,
        tension: 0.4
      })
    }
  } else {
    // Show all labs
    laboratories.value.forEach((lab, index) => {
      if (index < 5) { // Limit to 5 lines for readability
        const baseValue = lab.environment[selectedMetric.value as keyof typeof lab.environment] as number
        const data = labels.map(() => baseValue + (Math.random() - 0.5) * baseValue * 0.1)
        
        datasets.push({
          label: lab.name,
          data: data,
          borderColor: colors[index],
          backgroundColor: fillColors[index],
          borderWidth: 2,
          fill: false,
          tension: 0.4
        })
      }
    })
  }
  
  const metricInfo = {
    temperature: { unit: '°C', title: 'Temperature' },
    humidity: { unit: '%', title: 'Humidity' },
    pm25: { unit: 'μg/m³', title: 'PM2.5 Air Quality' },
    noise: { unit: 'dB', title: 'Noise Level' }
  }
  
  const currentMetric = metricInfo[selectedMetric.value as keyof typeof metricInfo]
  
  mainChart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: `${currentMetric.title} Trends - ${selectedTimeRange.value.toUpperCase()}`
        },
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: `${currentMetric.title} (${currentMetric.unit})`
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        }
      }
    }
  })
}

const createHistoryChart = () => {
  if (!historyChart.value || !window.Chart) return
  
  if (detailChart) {
    detailChart.destroy()
  }
  
  const ctx = historyChart.value.getContext('2d')
  
  detailChart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: historyData.value.map(d => d.time),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: historyData.value.map(d => d.temperature),
          borderColor: 'rgba(251, 113, 133, 1)',
          backgroundColor: 'rgba(251, 113, 133, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: historyData.value.map(d => d.humidity),
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
          text: `24-Hour Environmental History - ${selectedLabData.value?.name}`
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

const updateChart = () => {
  setTimeout(() => {
    if (mainChart) {
      createMainChart()
    }
  }, 100)
}

onMounted(() => {
  generateHistoryData()
  loadChartJS()
  
  // Simulate real-time data updates
  setInterval(() => {
    laboratories.value.forEach(lab => {
      // Slight random variations in environmental data
      lab.environment.temperature += (Math.random() - 0.5) * 0.2
      lab.environment.humidity += (Math.random() - 0.5) * 2
      lab.environment.pm25 += (Math.random() - 0.5) * 1
      lab.environment.noise += (Math.random() - 0.5) * 2
      
      // Round to reasonable precision
      lab.environment.temperature = Math.round(lab.environment.temperature * 10) / 10
      lab.environment.humidity = Math.round(lab.environment.humidity)
      lab.environment.pm25 = Math.round(lab.environment.pm25)
      lab.environment.noise = Math.round(lab.environment.noise)
      
      // Update timestamp
      lab.lastUpdated = `${Math.floor(Math.random() * 5) + 1} min ago`
    })
    
    // Update chart if it exists
    if (mainChart) {
      updateChart()
    }
  }, 30000) // Update every 30 seconds
})
</script>

<style scoped>
canvas {
  max-height: 300px !important;
  width: 100% !important;
  height: auto !important;
}
</style>