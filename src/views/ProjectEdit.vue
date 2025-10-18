<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle class="w-8 h-8 text-red-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Project</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <button
        @click="$router.push('/projects')"
        class="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
      >
        Back to Projects
      </button>
    </div>

    <!-- Permission Denied State -->
    <div v-else-if="!hasRequiredPermission" class="text-center py-20">
      <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Shield class="w-8 h-8 text-yellow-600" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Permission Denied</h3>
      <p class="text-gray-600 mb-2">
        You do not have permission to {{ isEdit ? 'edit' : 'create' }} projects.
      </p>
      <p class="text-sm text-gray-500 mb-4">
        Required permission: {{ isEdit ? 'PROJECT_EDIT' : 'PROJECT_CREATE' }}
      </p>
      <p class="text-sm text-gray-500 mb-6">
        Please contact your administrator if you believe this is an error.
      </p>
      <button
        @click="$router.push('/projects')"
        class="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
      >
        Back to Projects
      </button>
    </div>

    <!-- Form -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Edit Project' : 'Create New Project' }}
          </h1>
          <p class="text-gray-600 mt-1">
            {{ isEdit ? 'Update project information and settings' : 'Fill in the details to create a new research project' }}
          </p>
        </div>
        
        <button 
          class="text-gray-600 hover:text-gray-800"
          @click="$router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <form @submit.prevent="saveProject" class="space-y-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                <input 
                  v-model="form.title"
                  type="text" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter project title"
                  required
                >
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea 
                  v-model="form.description"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="4"
                  placeholder="Describe your project objectives and methodology"
                  required
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
                <select 
                  v-model="form.laboratory"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select Laboratory</option>
                  <option 
                    v-for="lab in laboratories" 
                    :key="lab.id" 
                    :value="lab.name"
                  >
                    {{ lab.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                <select 
                  v-model="form.priority"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input 
                  v-model="form.startDate"
                  type="date" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                <input 
                  v-model="form.endDate"
                  type="date" 
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
              </div>
            </div>
          </div>

          <!-- Project Details -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Project Details</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Research Objectives</label>
              <textarea 
                v-model="form.objectives"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="List the main research objectives and expected outcomes"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Required Equipment</label>
                <textarea 
                  v-model="equipmentText"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="List required equipment (one per line)"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                <textarea 
                  v-model="materialsText"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="List required materials (one per line)"
                ></textarea>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Expected Deliverables</label>
              <textarea 
                v-model="deliverablesText"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="List expected deliverables (one per line)"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Budget (Optional)</label>
              <input 
                v-model.number="form.budget"
                type="number" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter estimated budget"
                min="0"
              >
            </div>
          </div>

          <!-- Team Members -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Team Members</h3>
            
            <!-- Loading State -->
            <div v-if="loadingUsers" class="text-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              <p class="text-sm text-gray-500 mt-2">Loading users...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="usersError" class="text-center py-4">
              <p class="text-sm text-red-500">{{ usersError }}</p>
              <button 
                type="button"
                class="mt-2 text-sm text-primary-500 hover:text-primary-600"
                @click="fetchUsers"
              >
                Retry
              </button>
            </div>
            
            <!-- Users List -->
            <div v-else-if="availableUsers.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <label 
                v-for="user in availableUsers" 
                :key="user.id"
                class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input 
                  v-model="form.teamMembers"
                  type="checkbox" 
                  :value="user.id"
                  class="rounded border-gray-300"
                >
                <div class="flex-1">
                  <span class="text-sm font-medium">{{ user.name }}</span>
                  <span class="text-xs text-gray-500 ml-2">({{ formatRole(user.roles) }})</span>
                </div>
              </label>
            </div>
            
            <!-- Empty State -->
            <div v-else class="text-center py-4">
              <p class="text-sm text-gray-500">No users available</p>
            </div>
          </div>

          <!-- Tags -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Tags</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Project Tags</label>
              <input 
                v-model="tagsText"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter tags separated by commas (e.g., AI, Machine Learning, Research)"
              >
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-3 pt-6 border-t">
            <button 
              type="button"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              @click="$router.back()"
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project') }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, AlertCircle, Shield } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { api } from '@/api'
import type { CreateProjectRequest, UpdateProjectRequest, User, Project } from '@/types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const labStore = useLabStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Route params
const projectId = computed(() => route.params.projectId as string)
const isEdit = computed(() => !!projectId.value)

// Project data (for permission checking in edit mode)
const project = ref<Project | null>(null)

// Form state
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)
const form = ref<CreateProjectRequest & { budget?: number }>({
  title: '',
  description: '',
  laboratory: '',
  priority: 'medium',
  startDate: '',
  endDate: '',
  teamMembers: [],
  objectives: '',
  resources: {},
  deliverables: [],
  tags: []
})

// Text fields for arrays (easier editing)
const equipmentText = ref('')
const materialsText = ref('')
const deliverablesText = ref('')
const tagsText = ref('')

// Users state
const availableUsers = ref<User[]>([])
const loadingUsers = ref(false)
const usersError = ref<string | null>(null)

// Permission-based access control
const canCreate = computed(() => authStore.hasPermission('PROJECT_CREATE'))
const canEdit = computed(() => authStore.hasPermission('PROJECT_EDIT'))

const hasRequiredPermission = computed(() => {
  if (isEdit.value) {
    // For editing: need PROJECT_EDIT permission
    if (!canEdit.value) return false
    
    // Teachers can only edit their own projects
    if (authStore.hasRole('TEACHER') && project.value) {
      return project.value.principalInvestigator.id === authStore.user?.id
    }
    
    return true
  }
  
  return canCreate.value
})

// Computed
const laboratories = computed(() => labStore.labs)

// Format role for display
const formatRole = (roles: string[]) => {
  if (!roles || roles.length === 0) return 'User'
  
  const roleMap: { [key: string]: string } = {
    'ADMIN': 'Admin',
    'SYSTEM_ADMIN': 'Admin',
    'DEPARTMENT_ADMIN': 'Dept Admin',
    'TEACHER': 'Teacher',
    'STUDENT': 'Student',
    'VISITOR': 'Visitor'
  }
  
  return roleMap[roles[0]] || roles[0]
}

// Fetch users from backend
const fetchUsers = async () => {
  try {
    loadingUsers.value = true
    usersError.value = null
    
    const response = await api.users.getList()
    availableUsers.value = response.data || []
    
  } catch (error: any) {
    usersError.value = error.response?.data?.message || error.message || 'Failed to load users'
    availableUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

// Convert text to arrays
const updateArraysFromText = () => {
  form.value.resources = {
    equipment: equipmentText.value ? equipmentText.value.split('\n').filter(item => item.trim()) : [],
    materials: materialsText.value ? materialsText.value.split('\n').filter(item => item.trim()) : [],
    budget: form.value.budget
  }
  form.value.deliverables = deliverablesText.value ? deliverablesText.value.split('\n').filter(item => item.trim()) : []
  form.value.tags = tagsText.value ? tagsText.value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
}

// Convert arrays to text
const updateTextFromArrays = () => {
  equipmentText.value = form.value.resources?.equipment?.join('\n') || ''
  materialsText.value = form.value.resources?.materials?.join('\n') || ''
  deliverablesText.value = form.value.deliverables?.join('\n') || ''
  tagsText.value = form.value.tags?.join(', ') || ''
}

// Watch text changes
watch([equipmentText, materialsText, deliverablesText, tagsText], updateArraysFromText)

const loadProject = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    error.value = null
    
    const loadedProject = await projectStore.fetchProjectById(projectId.value)
    
    // Store project data for permission checking
    project.value = loadedProject
    
    // Populate form with project data
    form.value = {
      title: loadedProject.title,
      description: loadedProject.description,
      laboratory: loadedProject.laboratory || '',
      priority: loadedProject.priority,
      startDate: loadedProject.startDate,
      endDate: loadedProject.endDate,
      teamMembers: loadedProject.teamMembers,
      objectives: loadedProject.objectives,
      resources: loadedProject.resources || {},
      deliverables: loadedProject.deliverables || [],
      tags: loadedProject.tags || []
    }
    
    // Update text fields
    updateTextFromArrays()
    
    console.log('✅ Project data loaded:', loadedProject.title)
  } catch (err: any) {
    console.error('❌ Failed to fetch project:', err)
    error.value = err.message || 'Failed to load project data'
  } finally {
    loading.value = false
  }
}

const saveProject = async () => {
  try {
    saving.value = true
    updateArraysFromText()
    
    if (isEdit.value) {
      console.log('📝 Updating project:', projectId.value)
      const updateData: UpdateProjectRequest = { ...form.value }
      await projectStore.updateProject(projectId.value, updateData)
      
      uiStore.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project updated successfully'
      })
      console.log('✅ Project updated successfully')
    } else {
      console.log('🆕 Creating new project...')
      await projectStore.createProject(form.value)
      
      uiStore.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project created successfully'
      })
      console.log('✅ Project created successfully')
    }
    
    router.push('/projects')
    
  } catch (error: any) {
    console.error('❌ Save failed:', error)
    uiStore.addNotification({
      type: 'error',
      title: 'Error',
      message: isEdit.value ? 'Failed to update project' : 'Failed to create project'
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  console.log('🚀 Project Edit page mounted')
  console.log('📋 Route params:', route.params)
  console.log('📋 Is edit mode:', isEdit.value)
  console.log('👤 Current user:', authStore.user?.name)
  console.log('🔑 User permissions:', authStore.user?.permissions)
  
  // Check permissions
  const requiredPermission = isEdit.value ? 'PROJECT_EDIT' : 'PROJECT_CREATE'
  console.log(`🔑 Checking ${requiredPermission} permission...`)
  
  if (!hasRequiredPermission.value) {
    console.warn(`❌ Access denied: User does not have ${requiredPermission} permission`)
    return
  }
  
  console.log(`✅ Permission check passed: ${requiredPermission}`)
  
  try {
    await Promise.all([
      labStore.fetchLabs(),
      fetchUsers(),
      loadProject()
    ])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
})
</script>