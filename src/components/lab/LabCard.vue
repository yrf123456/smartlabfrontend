const canEdit = computed(() => {
  console.log('LabCard: Checking edit permission')
  console.log('User roles:', authStore.user?.roles)
  
  // 支持多种角色名称格式
  const hasPermission = authStore.hasRole('SYS_ADMIN') || 
                       authStore.hasRole('SYSTEM_ADMIN') ||
                       authStore.hasRole('DEPT_ADMIN') ||
                       authStore.hasRole('DEPARTMENT_ADMIN')
  
  console.log('LabCard: Can edit result:', hasPermission)
  return hasPermission
})<template>
  <div class="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
    <!-- Cover image -->
    <div class="aspect-video bg-gray-100 relative overflow-hidden">
      <img
        :src="lab.coverUrl"
        :alt="lab.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div class="absolute top-3 right-3">
        <span 
          class="px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm"
          :class="getStatusClass(lab.status)"
        >
          {{ getStatusText(lab.status) }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Header -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ lab.name }}</h3>
        <div class="flex items-center text-sm text-gray-500">
          <MapPin class="w-4 h-4 mr-1" />
          <span>{{ lab.location }}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <p class="text-sm text-gray-500">Capacity</p>
          <p class="text-lg font-semibold text-gray-900">{{ lab.capacity }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500">Equipment</p>
          <p class="text-lg font-semibold text-gray-900">{{ equipmentCount }}</p>
        </div>
      </div>

      <!-- Tags -->
      <div class="mb-4">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in lab.tags.slice(0, 3)"
            :key="tag"
            class="px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-md"
          >
            {{ tag }}
          </span>
          <span
            v-if="lab.tags.length > 3"
            class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md"
          >
            +{{ lab.tags.length - 3 }}
          </span>
        </div>
      </div>

      <!-- Open hours -->
      <div class="mb-4 flex items-center text-sm text-gray-500">
        <Clock class="w-4 h-4 mr-2" />
        <span>{{ lab.openHours }}</span>
      </div>

      <!-- Managers -->
      <div class="mb-6">
        <p class="text-sm text-gray-500 mb-2">Managers</p>
        <div class="flex items-center space-x-2">
          <div class="flex -space-x-2">
            <img
              v-for="manager in lab.managers.slice(0, 3)"
              :key="manager.id"
              :src="manager.avatarUrl"
              :alt="manager.name"
              class="w-6 h-6 rounded-full border-2 border-white object-cover"
              :title="manager.name"
            />
          </div>
          <span
            v-if="lab.managers.length > 3"
            class="text-xs text-gray-500"
          >
            +{{ lab.managers.length - 3 }}
          </span>
          <span
            v-else-if="lab.managers.length > 0"
            class="text-sm text-gray-700"
          >
            {{ lab.managers[0].name }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <button
          class="flex-1 bg-primary-500 text-white py-2 px-4 rounded-xl font-medium hover:bg-primary-600 transition-colors"
          :disabled="lab.status !== 'available'"
          @click="$emit('book', lab)"
        >
          {{ lab.status === 'available' ? 'Book Now' : 'Unavailable' }}
        </button>
        
        <button
          class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="$emit('view', lab)"
        >
          <Eye class="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          v-if="canEdit"
          class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          @click="$emit('edit', lab)"
        >
          <Edit class="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Clock, Eye, Edit } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { Lab } from '@/types'

interface Props {
  lab: Lab
}

interface Emits {
  (e: 'view', lab: Lab): void
  (e: 'edit', lab: Lab): void
  (e: 'book', lab: Lab): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const authStore = useAuthStore()

const canEdit = computed(() => {
  // 支持多种角色名称格式
  return authStore.hasRole('SYS_ADMIN') || 
         authStore.hasRole('SYSTEM_ADMIN') ||
         authStore.hasRole('DEPT_ADMIN') ||
         authStore.hasRole('DEPARTMENT_ADMIN')
})

const equipmentCount = computed(() => {
  // Mock equipment count - in real app, this would come from the lab data
  return Math.floor(Math.random() * 20) + 5
})

const getStatusClass = (status: Lab['status']) => {
  switch (status) {
    case 'available':
      return 'bg-green-500/20 text-green-700 border border-green-200'
    case 'maintenance':
      return 'bg-yellow-500/20 text-yellow-700 border border-yellow-200'
    case 'full':
      return 'bg-red-500/20 text-red-700 border border-red-200'
    default:
      return 'bg-gray-500/20 text-gray-700 border border-gray-200'
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

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop'
}
</script>