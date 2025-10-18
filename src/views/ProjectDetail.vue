<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      <p class="text-gray-500 mt-2">Loading project details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-500">{{ error }}</p>
      <button 
        class="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        @click="loadProject"
      >
        Retry
      </button>
    </div>

    <!-- Project Details -->
    <template v-else-if="project">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <button 
              class="text-gray-600 hover:text-gray-800"
              @click="$router.push('/projects')"
            >
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="text-2xl font-bold text-gray-900">{{ project.title }}</h1>
            <span 
              class="px-3 py-1 text-sm font-medium rounded-full"
              :class="getStatusClass(project.status)"
            >
              {{ getStatusText(project.status) }}
            </span>
            <span 
              class="px-3 py-1 text-sm font-medium rounded-full"
              :class="getPriorityClass(project.priority)"
            >
              {{ project.priority.toUpperCase() }}
            </span>
          </div>
          <p class="text-gray-600">{{ project.description }}</p>
        </div>
        
        <div class="flex items-center space-x-3 ml-6">
          <button 
            v-if="canEditProject"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            @click="editProject"
          >
            <Edit class="w-4 h-4 inline mr-2" />
            Edit
          </button>
          
          <button 
            v-if="canApproveProject"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            @click="showApprovalModal = true"
          >
            <CheckCircle class="w-4 h-4 inline mr-2" />
            Review
          </button>
        </div>
      </div>

      <!-- Project Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Progress</p>
              <p class="text-2xl font-bold text-blue-600">{{ project.progress }}%</p>
            </div>
            <Activity class="w-8 h-8 text-blue-600" />
          </div>
          <div class="mt-3">
            <div class="bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all"
                :style="{ width: project.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Duration</p>
              <p class="text-lg font-bold text-gray-900">{{ formatDuration }}</p>
            </div>
            <Calendar class="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Team Size</p>
              <p class="text-2xl font-bold text-purple-600">{{ teamMembersDetails.length + 1 }}</p>
            </div>
            <Users class="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Budget</p>
              <p class="text-lg font-bold text-yellow-600">
                {{ project.resources?.budget ? `$${project.resources.budget.toLocaleString()}` : 'N/A' }}
              </p>
            </div>
            <DollarSign class="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <!-- Project Phases -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Phases</h3>
        
        <div class="flex items-center justify-between">
          <div 
            v-for="(phase, index) in projectPhases"
            :key="phase.key"
            class="flex items-center"
          >
            <div class="flex items-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center border-2"
                :class="getPhaseStatusClass(phase.key)"
              >
                <component 
                  :is="phase.icon" 
                  class="w-5 h-5"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium" :class="getPhaseTextClass(phase.key)">
                  {{ phase.label }}
                </p>
              </div>
            </div>
            
            <!-- Connector line -->
            <div 
              v-if="index < projectPhases.length - 1"
              class="flex-1 h-0.5 mx-4"
              :class="isPhaseCompleted(projectPhases[index + 1].key) ? 'bg-green-500' : 'bg-gray-300'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Project Details -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            
            <div class="space-y-4">
              <div>
                <h4 class="font-medium text-gray-900 mb-2">Research Objectives</h4>
                <p class="text-gray-600">{{ project.objectives || 'No objectives specified' }}</p>
              </div>
              
              <div v-if="project.deliverables && project.deliverables.length > 0">
                <h4 class="font-medium text-gray-900 mb-2">Expected Deliverables</h4>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                  <li v-for="deliverable in project.deliverables" :key="deliverable">
                    {{ deliverable }}
                  </li>
                </ul>
              </div>
              
              <div v-if="project.tags && project.tags.length > 0">
                <h4 class="font-medium text-gray-900 mb-2">Tags</h4>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="tag in project.tags" 
                    :key="tag"
                    class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Resources -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Required Resources</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="project.resources?.equipment && project.resources.equipment.length > 0">
                <h4 class="font-medium text-gray-900 mb-2">Equipment</h4>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                  <li v-for="item in project.resources.equipment" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
              
              <div v-if="project.resources?.materials && project.resources.materials.length > 0">
                <h4 class="font-medium text-gray-900 mb-2">Materials</h4>
                <ul class="list-disc list-inside text-gray-600 space-y-1">
                  <li v-for="item in project.resources.materials" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Project Info -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            
            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-600">Principal Investigator</p>
                <div class="flex items-center space-x-3 mt-1">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {{ project.principalInvestigator.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ project.principalInvestigator.name }}</p>
                    <p class="text-xs text-gray-500">{{ project.principalInvestigator.email }}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-600">Laboratory</p>
                <p class="text-sm text-gray-900 mt-1">{{ project.laboratory || 'Not assigned' }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-600">Start Date</p>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(project.startDate) }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-600">End Date</p>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(project.endDate) }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-600">Created</p>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(project.createdAt) }}</p>
              </div>
              
              <div>
                <p class="text-sm font-medium text-gray-600">Last Updated</p>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(project.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <!-- Team Members -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
            
            <div class="space-y-3">
              <!-- Principal Investigator -->
              <div class="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {{ project.principalInvestigator.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ project.principalInvestigator.name }}</p>
                  <p class="text-xs text-blue-600">Principal Investigator</p>
                </div>
              </div>
              
              <!-- Team Members - Loading -->
              <div v-if="loadingTeamMembers" class="text-center py-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mx-auto"></div>
                <p class="text-xs text-gray-500 mt-1">Loading team members...</p>
              </div>
              
              <!-- Team Members - Real Data -->
              <div 
                v-else
                v-for="member in teamMembersDetails" 
                :key="member.id"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div 
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  :style="{ background: getAvatarColor(member.name) }"
                >
                  {{ member.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ member.name }}</p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
              
              <!-- No Team Members -->
              <div v-if="!loadingTeamMembers && teamMembersDetails.length === 0" class="text-center py-2">
                <p class="text-xs text-gray-500">No team members added yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Approval Modal -->
    <div 
      v-if="showApprovalModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showApprovalModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-lg mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Review Project</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Review Comments</label>
            <textarea 
              v-model="approvalForm.comments"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="Add review comments (optional)"
            ></textarea>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              class="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
              @click="approveProject"
              :disabled="approving"
            >
              <CheckCircle class="w-4 h-4 inline mr-2" />
              {{ approving ? 'Approving...' : 'Approve' }}
            </button>
            <button 
              class="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              @click="rejectProject"
              :disabled="rejecting"
            >
              <XCircle class="w-4 h-4 inline mr-2" />
              {{ rejecting ? 'Rejecting...' : 'Reject' }}
            </button>
            <button 
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showApprovalModal = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Calendar, 
  Users, 
  DollarSign,
  FileCheck,
  FlaskConical,
  BookOpen,
  Archive
} from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { api } from '@/api'
import type { Project, User } from '@/types'
import { UserRole } from '@/types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Route params
const projectId = computed(() => route.params.projectId as string)

// State
const project = ref<Project | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showApprovalModal = ref(false)
const approving = ref(false)
const rejecting = ref(false)

// Team members state
const teamMembersDetails = ref<User[]>([])
const loadingTeamMembers = ref(false)
const allUsers = ref<User[]>([])

const approvalForm = ref({
  comments: ''
})

const projectPhases = [
  { key: 'application', label: 'Application', icon: FileCheck },
  { key: 'design', label: 'Design', icon: FlaskConical },
  { key: 'execution', label: 'Execution', icon: BookOpen },
  { key: 'archive', label: 'Archive', icon: Archive }
]

const canView = computed(() => authStore.hasPermission('PROJECT_VIEW'))
const canEdit = computed(() => authStore.hasPermission('PROJECT_EDIT'))
const canApprove = computed(() => authStore.hasPermission('PROJECT_APPROVE'))
const canDelete = computed(() => authStore.hasPermission('PROJECT_DELETE'))

const canEditProject = computed(() => {
  if (!project.value || !canEdit.value) return false
  
  // Admin and Department Admin can edit any project
  if (authStore.hasRole('ADMIN') || authStore.hasRole('DEPARTMENT_ADMIN')) {
    return true
  }
  
  // Teachers can only edit their own projects
  if (authStore.hasRole('TEACHER')) {
    return project.value.principalInvestigator.id === authStore.user?.id
  }
  
  return false
})

const canApproveProject = computed(() => {
  if (!project.value || !canApprove.value) return false
  
  return (authStore.hasRole('ADMIN') || authStore.hasRole('DEPARTMENT_ADMIN')) && 
         project.value.status === 'pending'
})

const formatDuration = computed(() => {
  if (!project.value) return ''
  
  const start = new Date(project.value.startDate)
  const end = new Date(project.value.endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 30) {
    return `${diffDays} days`
  } else if (diffDays < 365) {
    const months = Math.round(diffDays / 30)
    return `${months} month${months > 1 ? 's' : ''}`
  } else {
    const years = Math.round(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''}`
  }
})

// Methods
const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-purple-100 text-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending Review'
    case 'approved':
      return 'Approved'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'archived':
      return 'Archived'
    case 'rejected':
      return 'Rejected'
    default:
      return status
  }
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const isPhaseCompleted = (phaseKey: string) => {
  return project.value?.phases[phaseKey as keyof typeof project.value.phases] || false
}

const getPhaseStatusClass = (phaseKey: string) => {
  const completed = isPhaseCompleted(phaseKey)
  return completed 
    ? 'border-green-500 bg-green-50 text-green-600' 
    : 'border-gray-300 bg-gray-50 text-gray-400'
}

const getPhaseTextClass = (phaseKey: string) => {
  const completed = isPhaseCompleted(phaseKey)
  return completed ? 'text-green-600' : 'text-gray-500'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const getAvatarColor = (name: string) => {
  // Generate a consistent color based on the name
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

const editProject = () => {
  router.push(`/projects/${projectId.value}/edit`)
}

const approveProject = async () => {
  if (!project.value) return
  
  try {
    approving.value = true
    await projectStore.approveProject(project.value.id, approvalForm.value.comments)
    
    // Reload project data
    await loadProject()
    
    uiStore.addNotification({
      type: 'success',
      title: 'Success',
      message: 'Project approved successfully'
    })
    
    showApprovalModal.value = false
    approvalForm.value.comments = ''
    
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to approve project'
    })
  } finally {
    approving.value = false
  }
}

const rejectProject = async () => {
  if (!project.value) return
  
  try {
    rejecting.value = true
    await projectStore.rejectProject(project.value.id, approvalForm.value.comments)
    
    // Reload project data
    await loadProject()
    
    uiStore.addNotification({
      type: 'success',
      title: 'Success',
      message: 'Project rejected successfully'
    })
    
    showApprovalModal.value = false
    approvalForm.value.comments = ''
    
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to reject project'
    })
  } finally {
    rejecting.value = false
  }
}

const loadTeamMembers = async () => {
  if (!project.value || !project.value.teamMembers || project.value.teamMembers.length === 0) {
    teamMembersDetails.value = []
    return
  }
  
  try {
    loadingTeamMembers.value = true
    
    // Fetch all users if not already loaded
    if (allUsers.value.length === 0) {
      const response = await api.users.getList()
      allUsers.value = response.data || []
    }
    
    // Filter to get only team members
    teamMembersDetails.value = allUsers.value.filter(user => 
      project.value!.teamMembers.includes(user.id)
    )
    
  } catch (error) {
    console.error('Failed to load team members:', error)
    teamMembersDetails.value = []
  } finally {
    loadingTeamMembers.value = false
  }
}

const loadProject = async () => {
  try {
    loading.value = true
    error.value = null
    
    project.value = await projectStore.fetchProjectById(projectId.value)
    
    // Load team members details
    await loadTeamMembers()
    
  } catch (err: any) {
    error.value = err.message || 'Failed to load project details'
    console.error('Failed to load project:', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('🚀 Project Detail page mounted')
  console.log('📋 Project ID:', projectId.value)
  console.log('👤 Current user:', authStore.user?.name)
  console.log('🔑 User permissions:', authStore.user?.permissions)
  console.log('📋 Permission check:', {
    canView: canView.value,
    canEdit: canEdit.value,
    canApprove: canApprove.value,
    canDelete: canDelete.value
  })

  // Permission check: Must have PROJECT_VIEW permission
  if (!canView.value) {
    console.warn('❌ Access denied: User does not have PROJECT_VIEW permission')
    router.push('/dashboard')
    return
  }

  console.log('✅ Permission check passed: PROJECT_VIEW')
  
  await loadProject()
})
</script>