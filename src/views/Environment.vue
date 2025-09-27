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
            @click="configureAlerts(lab.id)"
          >
            Alerts
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
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="pm25">Air Quality</option>
            <option value="noise">Noise Level</option>
          </select>
        </div>
      </div>

      <!-- Mock Chart Area -->
      <div class="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div class="text-center">
          <TrendingUp class="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p class="text-gray-500">{{ selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1) }} trend chart would display here</p>
          <p class="text-sm text-gray-400 mt-1">Showing {{ selectedTimeRange }} data for {{ selectedLab ? laboratories.find(l => l.id === selectedLab)?.name : 'all laboratories' }}</p>
        </div>
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

    <!-- Alert Configuration Modal -->
    <div 
      v-if="showAlertModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showAlertModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Configure Environmental Alerts</h3>
        
        <form @submit.prevent="saveAlertSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Temperature Range (°C)</label>
            <div class="grid grid-cols-2 gap-2">
              <input 
                v-model="alertSettings.tempMin"
                type="number" 
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Min"
              >
              <input 
                v-model="alertSettings.tempMax"
                type="number" 
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Max"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Humidity Range (%)</label>
            <div class="grid grid-cols-2 gap-2">
              <input 
                v-model="alertSettings.humidityMin"
                type="number" 
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Min"
              >
              <input 
                v-model="alertSettings.humidityMax"
                type="number" 
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Max"
              >
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">PM2.5 Threshold (μg/m³)</label>
            <input 
              v-model="alertSettings.pm25Max"
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Maximum PM2.5 level"
            >
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Save Settings
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showAlertModal = false"
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
import { ref, onMounted } from 'vue'
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
  Shield
} from 'lucide-vue-next'

// Reactive data
const selectedTimeRange = ref('24h')
const selectedLab = ref('')
const selectedMetric = ref('temperature')
const showAlertModal = ref(false)

const alertSettings = ref({
  tempMin: 18,
  tempMax: 25,
  humidityMin: 40,
  humidityMax: 60,
  pm25Max: 35
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

const environmentStats = ref({
  totalSensors: 28,
  activeAlerts: 3,
  avgTemperature: 24.9,
  uptime: 99.2
})

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
  console.log('View history for lab:', labId)
}

const configureAlerts = (labId: string) => {
  showAlertModal.value = true
  console.log('Configure alerts for lab:', labId)
}

const exportData = () => {
  console.log('Export environmental data for range:', selectedTimeRange.value)
}

const saveAlertSettings = () => {
  console.log('Save alert settings:', alertSettings.value)
  showAlertModal.value = false
}

onMounted(() => {
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
  }, 30000) // Update every 30 seconds
})
</script>