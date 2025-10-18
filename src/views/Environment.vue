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
          v-if="canConfigure"
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

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
        <div class="h-20 bg-gray-200 rounded mb-4"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>

    <!-- Laboratory Environment Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="lab in laboratories"
        :key="lab.id"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
      >
        <!-- Lab Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Activity class="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ lab.name }}</h3>
              <p class="text-sm text-gray-500">{{ lab.location || 'No location' }}</p>
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
            <p class="text-lg font-bold text-orange-900">
              {{ lab.environment.temperature != null ? lab.environment.temperature.toFixed(1) : '--' }}°C
            </p>
            <p class="text-xs text-orange-600">Range: 18-25°C</p>
          </div>

          <!-- Humidity -->
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Droplets class="w-4 h-4 text-blue-600" />
              <span class="text-xs font-medium text-blue-800">Humidity</span>
            </div>
            <p class="text-lg font-bold text-blue-900">
              {{ lab.environment.humidity != null ? Math.round(lab.environment.humidity) : '--' }}%
            </p>
            <p class="text-xs text-blue-600">Range: 40-60%</p>
          </div>

          <!-- Air Quality (PM2.5) -->
          <div class="bg-green-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Wind class="w-4 h-4 text-green-600" />
              <span class="text-xs font-medium text-green-800">Air Quality</span>
            </div>
            <p class="text-lg font-bold text-green-900">
              {{ lab.environment.pm25 != null ? Math.round(lab.environment.pm25) : '--' }} μg/m³
            </p>
            <p class="text-xs text-green-600">PM2.5 Level</p>
          </div>

          <!-- Noise Level -->
          <div class="bg-purple-50 rounded-lg p-3">
            <div class="flex items-center space-x-2 mb-1">
              <Volume2 class="w-4 h-4 text-purple-600" />
              <span class="text-xs font-medium text-purple-800">Noise</span>
            </div>
            <p class="text-lg font-bold text-purple-900">
              {{ lab.environment.noise != null ? Math.round(lab.environment.noise) : '--' }} dB
            </p>
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
            <span class="font-medium text-gray-900">
              {{ lab.environment.power != null ? lab.environment.power.toFixed(1) : '--' }} kW
            </span>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center space-x-2 text-gray-600">
              <Gauge class="w-4 h-4" />
              <span>Air Pressure</span>
            </span>
            <span class="font-medium text-gray-900">
              {{ lab.environment.pressure != null ? lab.environment.pressure.toFixed(1) : '--' }} hPa
            </span>
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
            v-if="canConfigure"
            class="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            @click="editLabData(lab.id)"
          >
            Edit
          </button>
          <span v-else class="flex-1 text-center text-xs text-gray-400 py-2">
            View Only
          </span>
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
              <tr v-for="record in historyData" :key="record.ts" class="hover:bg-gray-50">
                <td class="py-2 px-3 text-sm text-gray-900">{{ formatTime(record.ts) }}</td>
                <td class="py-2 px-3 text-sm text-gray-900">
                  {{ record.temp != null ? record.temp.toFixed(1) : '--' }}°C
                </td>
                <td class="py-2 px-3 text-sm text-gray-900">
                  {{ record.hum != null ? Math.round(record.hum) : '--' }}%
                </td>
                <td class="py-2 px-3 text-sm text-gray-900">
                  {{ record.pm25 != null ? Math.round(record.pm25) : '--' }} μg/m³
                </td>
                <td class="py-2 px-3 text-sm text-gray-900">
                  {{ record.noise != null ? Math.round(record.noise) : '--' }} dB
                </td>
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
          <h3 class="text-lg font-semibold text-gray-900">Add Environmental Data</h3>
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
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Humidity (%)</label>
              <input 
                v-model.number="editForm.humidity"
                type="number"
                step="0.1" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              >
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">PM2.5 (μg/m³)</label>
              <input 
                v-model.number="editForm.pm25"
                type="number"
                step="0.1" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Noise (dB)</label>
              <input 
                v-model.number="editForm.noise"
                type="number"
                step="0.1" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                required
              >
            </div>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              :disabled="submitting"
            >
              {{ submitting ? 'Saving...' : 'Save Data' }}
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showEditModal = false"
              :disabled="submitting"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
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
  Activity, 
  CheckCircle,
  X
} from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'

declare global {
  interface Window {
    Chart: any;
  }
}

const router = useRouter()
const authStore = useAuthStore()

// Permission-based access control
const canView = computed(() => authStore.hasPermission('ENVIRONMENT_VIEW'))
const canConfigure = computed(() => authStore.hasPermission('ENVIRONMENT_CONFIG'))

const loading = ref(true)
const submitting = ref(false)
const selectedTimeRange = ref('24h')
const selectedLab = ref('')
const selectedMetric = ref('temperature')
const showHistoryModal = ref(false)
const showEditModal = ref(false)
const selectedLabData = ref<any>(null)
const editingLab = ref<any>(null)

const environmentChart = ref<HTMLCanvasElement | null>(null)
const historyChart = ref<HTMLCanvasElement | null>(null)

let mainChart: any = null
let detailChart: any = null

const editForm = ref({
  temperature: 0,
  humidity: 0,
  pm25: 0,
  noise: 0
})

const laboratories = ref<any[]>([])
const activeAlerts = ref<any[]>([])
const historyData = ref<any[]>([])
const environmentStats = ref({
  totalSensors: 0,
  activeAlerts: 0,
  avgTemperature: 0,
  uptime: 0
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800'
    case 'full':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available':
      return 'Normal'
    case 'maintenance':
      return 'Maintenance'
    case 'full':
      return 'Full'
    default:
      return status
  }
}

const formatTime = (ts: string) => {
  const date = new Date(ts)
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

const loadEnvironmentData = async () => {
  try {
    loading.value = true
    const response = await api.environment.getAllLabsEnv()
    if (response.code === 0) {
      laboratories.value = response.data.map((lab: any) => ({
        id: String(lab.id),
        name: lab.name,
        location: lab.location,
        status: lab.status,
        environment: {
          temperature: lab.environment?.temperature ?? null,
          humidity: lab.environment?.humidity ?? null,
          pm25: lab.environment?.pm25 ?? null,
          noise: lab.environment?.noise ?? null,
          power: lab.environment?.power ?? null,
          pressure: lab.environment?.pressure ?? null
        },
        lastUpdated: lab.lastUpdated || 'No data'
      }))
      console.log('✅ Environment data loaded:', laboratories.value.length, 'labs')
    }
  } catch (error) {
    console.error('❌ Failed to load environment data:', error)
  } finally {
    loading.value = false
  }
}

const loadAlerts = async () => {
  try {
    const response = await api.environment.getAlerts()
    if (response.code === 0) {
      activeAlerts.value = response.data
    }
  } catch (error) {
    console.error('Failed to load alerts:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await api.environment.getStats()
    if (response.code === 0) {
      environmentStats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const viewHistory = async (labId: string) => {
  selectedLabData.value = laboratories.value.find(lab => lab.id == labId)
  showHistoryModal.value = true
  
  try {
    const to = new Date()
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000)
    
    const response = await api.environment.getSeries(
      labId,
      {
        from: from.toISOString(),
        to: to.toISOString()
      }
    )
    
    if (response.code === 0) {
      historyData.value = response.data
      nextTick(() => {
        createHistoryChart()
      })
    }
  } catch (error) {
    console.error('Failed to load history data:', error)
  }
}

const editLabData = (labId: string) => {
  if (!canConfigure.value) {
    alert('You do not have permission to configure environment data')
    return
  }

  editingLab.value = laboratories.value.find(lab => lab.id == labId)
  if (editingLab.value) {
    editForm.value = {
      temperature: editingLab.value.environment.temperature || 22,
      humidity: editingLab.value.environment.humidity || 50,
      pm25: editingLab.value.environment.pm25 || 10,
      noise: editingLab.value.environment.noise || 40
    }
    showEditModal.value = true
  }
}

const saveLabData = async () => {
  if (!editingLab.value) return
  
  if (!canConfigure.value) {
    alert('You do not have permission to save environment data')
    return
  }
  
  try {
    submitting.value = true
    
    const response = await api.environment.addEnvData(
      editingLab.value.id,
      {
        temperature: editForm.value.temperature,
        humidity: editForm.value.humidity,
        pm25: editForm.value.pm25,
        noise: editForm.value.noise
      }
    )
    
    if (response.code === 0) {
      showEditModal.value = false
      await loadEnvironmentData()
      await loadAlerts()
      await loadStats()
      updateChart()
      console.log('✅ Environment data saved successfully')
    }
  } catch (error) {
    console.error('❌ Failed to save data:', error)
    alert('Failed to save environmental data')
  } finally {
    submitting.value = false
  }
}

const exportData = () => {
  if (!canConfigure.value) {
    alert('You do not have permission to export data')
    return
  }

  let csvContent = '\uFEFF'
  csvContent += 'Laboratory,Temperature,Humidity,PM2.5,Noise,Power,Pressure,Status,Last Updated\n'
  
  laboratories.value.forEach(lab => {
    const env = lab.environment
    csvContent += `"${lab.name}",${env.temperature || ''},${env.humidity || ''},${env.pm25 || ''},${env.noise || ''},${env.power || ''},${env.pressure || ''},"${lab.status}","${lab.lastUpdated}"\n`
  })
  
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
  console.log('✅ Data exported successfully')
}

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

const createMainChart = async () => {
  if (!environmentChart.value || !window.Chart) return
  
  if (mainChart) {
    mainChart.destroy()
  }
  
  const ctx = environmentChart.value.getContext('2d')
  
  const labels: string[] = []
  const datasets: any[] = []
  
  try {
    const to = new Date()
    let from: Date
    
    switch (selectedTimeRange.value) {
      case '1h':
        from = new Date(to.getTime() - 60 * 60 * 1000)
        break
      case '24h':
        from = new Date(to.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        from = new Date(to.getTime() - 24 * 60 * 60 * 1000)
    }
    
    const colors = [
      'rgba(59, 130, 246, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(251, 191, 36, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(147, 51, 234, 1)',
    ]
    
    const fillColors = [
      'rgba(59, 130, 246, 0.1)',
      'rgba(34, 197, 94, 0.1)',
      'rgba(251, 191, 36, 0.1)',
      'rgba(239, 68, 68, 0.1)',
      'rgba(147, 51, 234, 0.1)',
    ]
    
    if (selectedLab.value) {
      const response = await api.environment.getSeries(
        selectedLab.value,
        {
          from: from.toISOString(),
          to: to.toISOString()
        }
      )
      
      if (response.code === 0 && response.data.length > 0) {
        const lab = laboratories.value.find(l => l.id == selectedLab.value)
        const data = response.data
        
        labels.push(...data.map((d: any) => formatTime(d.ts)))
        
        const metricKey = selectedMetric.value === 'temperature' ? 'temp' :
                         selectedMetric.value === 'humidity' ? 'hum' :
                         selectedMetric.value === 'pm25' ? 'pm25' : 'noise'
        
        datasets.push({
          label: lab?.name || 'Lab',
          data: data.map((d: any) => d[metricKey]),
          borderColor: colors[0],
          backgroundColor: fillColors[0],
          borderWidth: 2,
          fill: true,
          tension: 0.4
        })
      }
    } else {
      const labsToShow = laboratories.value.slice(0, 5)
      
      for (let i = 0; i < labsToShow.length; i++) {
        const lab = labsToShow[i]
        
        try {
          const response = await api.environment.getSeries(
            lab.id,
            {
              from: from.toISOString(),
              to: to.toISOString()
            }
          )
          
          if (response.code === 0 && response.data.length > 0) {
            if (labels.length === 0) {
              labels.push(...response.data.map((d: any) => formatTime(d.ts)))
            }
            
            const metricKey = selectedMetric.value === 'temperature' ? 'temp' :
                             selectedMetric.value === 'humidity' ? 'hum' :
                             selectedMetric.value === 'pm25' ? 'pm25' : 'noise'
            
            datasets.push({
              label: lab.name,
              data: response.data.map((d: any) => d[metricKey]),
              borderColor: colors[i],
              backgroundColor: fillColors[i],
              borderWidth: 2,
              fill: false,
              tension: 0.4
            })
          }
        } catch (error) {
          console.error(`Failed to load data for lab ${lab.id}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Failed to create chart:', error)
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
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: datasets.length > 0 ? datasets : [{
        label: 'No Data',
        data: [],
        borderColor: 'rgba(156, 163, 175, 1)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)'
      }]
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
  if (!historyChart.value || !window.Chart || historyData.value.length === 0) return
  
  if (detailChart) {
    detailChart.destroy()
  }
  
  const ctx = historyChart.value.getContext('2d')
  
  detailChart = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: historyData.value.map(d => formatTime(d.ts)),
      datasets: [
        {
          label: 'Temperature (°C)',
          data: historyData.value.map(d => d.temp),
          borderColor: 'rgba(251, 113, 133, 1)',
          backgroundColor: 'rgba(251, 113, 133, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Humidity (%)',
          data: historyData.value.map(d => d.hum),
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

onMounted(async () => {
  console.log('Environment page mounted')
  console.log('Current user:', authStore.user?.name)
  console.log('User permissions:', authStore.user?.permissions)
  console.log('Permission check:', {
    canView: canView.value,
    canConfigure: canConfigure.value
  })

  if (!canView.value) {
    console.warn('Access denied: User does not have ENVIRONMENT_VIEW permission')
    router.push('/dashboard')
    return
  }

  console.log('Permission check passed: ENVIRONMENT_VIEW')

  await loadEnvironmentData()
  await loadAlerts()
  await loadStats()
  loadChartJS()
  
  setInterval(async () => {
    await loadEnvironmentData()
    await loadAlerts()
    await loadStats()
    if (mainChart) {
      updateChart()
    }
  }, 30000)
})
</script>

<style scoped>
canvas {
  max-height: 300px !important;
  width: 100% !important;
  height: auto !important;
}
</style>