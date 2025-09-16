<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Laboratory Management</h1>
        <p class="text-gray-600 mt-1">Manage and view all laboratories</p>
      </div>
      
      <!-- Create Button (Admin Only) -->
      <div v-if="canCreate" class="flex items-center space-x-3">
        <button
          @click="handleCreateNew"
          class="inline-flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus class="w-5 h-5" />
          <span class="hidden sm:inline">New Laboratory</span>
        </button>
      </div>
    </div>

    <!-- Filters and View Toggle -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <!-- Search and Filters -->
        <div class="flex-1 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <!-- Search -->
          <div class="relative lg:w-80">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search laboratory name or location..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="maintenance">Under Maintenance</option>
            <option value="full">Full</option>
          </select>

          <!-- Tags Filter -->
          <div class="relative">
            <button
              @click="showTagFilter = !showTagFilter"
              class="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              <Tag class="w-5 h-5 text-gray-500" />
              <span>Tags</span>
              <span v-if="selectedTags.length > 0" class="bg-primary-100 text-primary-700 px-2 py-1 rounded-lg text-xs">
                {{ selectedTags.length }}
              </span>
              <ChevronDown class="w-4 h-4 text-gray-400" />
            </button>
            
            <!-- Tag Dropdown -->
            <div
              v-if="showTagFilter"
              class="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10 w-64"
            >
              <div class="space-y-2">
                <label
                  v-for="tag in availableTags"
                  :key="tag"
                  class="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    v-model="selectedTags"
                    :value="tag"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="text-sm text-gray-700">{{ tag }}</span>
                </label>
              </div>
              
              <!-- Clear Tags -->
              <div v-if="selectedTags.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                <button
                  @click="selectedTags = []"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <!-- Clear Filters -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-50"
          >
            <X class="w-4 h-4" />
            <span class="text-sm">Clear Filters</span>
          </button>
        </div>

        <!-- View Toggle -->
        <div class="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
          <button
            @click="setViewMode('grid')"
            :class="[
              'p-2 rounded-lg transition-colors',
              currentViewMode === 'grid' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <Grid class="w-5 h-5" />
          </button>
          <button
            @click="setViewMode('list')"
            :class="[
              'p-2 rounded-lg transition-colors',
              currentViewMode === 'list' 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <List class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
        >
          <div class="h-40 bg-gray-200 rounded-xl mb-4"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            <div class="flex space-x-2">
              <div class="h-6 bg-gray-200 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="currentError" class="text-center py-12">
      <div class="bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-red-900 mb-2">Error Loading Labs</h3>
        <p class="text-red-700 mb-4">{{ currentError }}</p>
        <button
          @click="refreshLabs"
          class="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentFilteredLabs.length === 0 && !isLoading" class="text-center py-12">
      <div class="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
        <Building2 class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ hasActiveFilters ? 'No Results Found' : 'No Laboratories' }}
        </h3>
        <p class="text-gray-500 mb-6">
          {{ hasActiveFilters ? 'Try adjusting your filters' : 'Create your first laboratory to get started' }}
        </p>
        
        <div class="space-y-3">
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="block w-full bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Clear Filters
          </button>
          
          <button
            v-if="canCreate && !hasActiveFilters"
            @click="handleCreateNew"
            class="block w-full bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Create Laboratory
          </button>
        </div>
      </div>
    </div>

    <!-- Labs Content -->
    <div v-else>
      <!-- Results Count -->
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>Showing {{ currentFilteredLabs.length }} of {{ totalLabs }} laboratories</span>
      </div>

      <!-- Grid View -->
      <div
        v-if="currentViewMode === 'grid'"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <LabCard
          v-for="lab in currentFilteredLabs"
          :key="lab.id"
          :lab="lab"
          @view="handleViewLab"
          @edit="handleEditLab"
          @book="handleBookLab"
        />
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Location</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Capacity</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Managers</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="lab in currentFilteredLabs"
                :key="lab.id"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <img
                      :src="lab.coverUrl"
                      :alt="lab.name"
                      class="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p class="font-medium text-gray-900">{{ lab.name }}</p>
                      <div class="flex flex-wrap gap-1 mt-1">
                        <span
                          v-for="tag in lab.tags.slice(0, 2)"
                          :key="tag"
                          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {{ tag }}
                        </span>
                        <span
                          v-if="lab.tags.length > 2"
                          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          +{{ lab.tags.length - 2 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-900">{{ lab.location }}</td>
                <td class="px-6 py-4 text-gray-900">{{ lab.capacity }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusClass(lab.status)
                    ]"
                  >
                    {{ getStatusText(lab.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex -space-x-2">
                    <img
                      v-for="manager in lab.managers.slice(0, 3)"
                      :key="manager.id"
                      :src="manager.avatarUrl"
                      :alt="manager.name"
                      :title="manager.name"
                      class="w-8 h-8 rounded-full border-2 border-white"
                    />
                    <div
                      v-if="lab.managers.length > 3"
                      class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-600"
                    >
                      +{{ lab.managers.length - 3 }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="handleViewLab(lab)"
                      class="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title="View Details"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                    <button
                      v-if="lab.status === 'available'"
                      @click="handleBookLab(lab)"
                      class="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100"
                      title="Quick Book"
                    >
                      <Calendar class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import type { Lab } from '@/types'
import { UserRole } from '@/types'

// Icons
import {
  Plus, Search, Tag, ChevronDown, X, Grid, List, 
  AlertCircle, RefreshCw, Building2, Eye, Calendar
} from 'lucide-vue-next'

// Components
import LabCard from '@/components/lab/LabCard.vue'

const router = useRouter()
const labStore = useLabStore()
const authStore = useAuthStore()

// Reactive data
const showTagFilter = ref(false)
const searchQuery = ref('')
const statusFilter = ref<Lab['status'] | ''>('')
const selectedTags = ref<string[]>([])

// Computed properties - 正确的响应式访问方式
const isLoading = computed(() => labStore.loading)
const currentError = computed(() => labStore.error)
const currentFilteredLabs = computed(() => labStore.filteredLabs)
const availableTags = computed(() => labStore.availableTags)
const currentViewMode = computed(() => labStore.viewMode)
const totalLabs = computed(() => labStore.labs.length)

const canCreate = computed(() => 
  authStore.hasRole(UserRole.SYSTEM_ADMIN) || 
  authStore.hasRole(UserRole.DEPARTMENT_ADMIN)
)

const canEdit = computed(() => 
  authStore.hasRole(UserRole.SYSTEM_ADMIN) || 
  authStore.hasRole(UserRole.DEPARTMENT_ADMIN)
)

const hasActiveFilters = computed(() => 
  searchQuery.value !== '' || 
  statusFilter.value !== '' || 
  selectedTags.value.length > 0
)

// Methods
const setViewMode = (mode: 'grid' | 'list') => {
  labStore.setViewMode(mode)
}

const clearFilters = async () => {
  searchQuery.value = ''
  statusFilter.value = ''
  selectedTags.value = []
  await labStore.clearFilters()
}

const refreshLabs = async () => {
  try {
    await labStore.refreshData()
  } catch (err) {
    console.error('Failed to refresh labs:', err)
  }
}

const handleViewLab = (lab: Lab) => {
  router.push(`/labs/${lab.id}`)
}

const handleEditLab = (lab: Lab) => {
  router.push(`/labs/${lab.id}/edit`)
}

const handleBookLab = (lab: Lab) => {
  // Navigate to booking page with lab pre-selected
  router.push(`/bookings?labId=${lab.id}`)
}

const handleCreateNew = () => {
  router.push('/labs/new/edit')
  console.log('Current routes:', router.getRoutes())
}

const getStatusClass = (status: Lab['status']) => {
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

const getStatusText = (status: Lab['status']) => {
  switch (status) {
    case 'available':
      return 'Available'
    case 'maintenance':
      return 'Maintenance'
    case 'full':
      return 'Full'
    default:
      return 'Unknown'
  }
}

// Watchers
watch(searchQuery, async (newValue) => {
  await labStore.setFilters({ keyword: newValue })
})

watch(statusFilter, async (newValue) => {
  await labStore.setFilters({ status: newValue })
})

watch(selectedTags, async (newValue) => {
  await labStore.setFilters({ tags: newValue })
}, { deep: true })

// Close tag filter when clicking outside
watch(showTagFilter, (show) => {
  if (show) {
    nextTick(() => {
      const handleClickOutside = (event: Event) => {
        const target = event.target as Element
        if (!target.closest('.relative')) {
          showTagFilter.value = false
          document.removeEventListener('click', handleClickOutside)
        }
      }
      document.addEventListener('click', handleClickOutside)
    })
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 Labs page mounted, fetching data...')
  try {
    await labStore.fetchLabs()
    console.log('✅ Labs data loaded:', labStore.labs.length, 'items')
  } catch (err) {
    console.error('❌ Failed to load labs:', err)
  }
})
</script>