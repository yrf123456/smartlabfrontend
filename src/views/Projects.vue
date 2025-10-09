<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('project.title') }} Management</h1>
        <p class="text-gray-600 mt-1">Manage experimental projects from application to archive</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          v-if="canCreateProject"
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="$router.push('/projects/new')"
        >
          <Plus class="w-4 h-4 inline mr-2" />
          New Project
        </button>
        
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Projects</p>
            <p class="text-2xl font-bold text-gray-900">{{ projectStore.projectStats.total }}</p>
          </div>
          <FileText class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">{{ projectStore.projectStats.inProgress }}</p>
          </div>
          <Clock class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Approval</p>
            <p class="text-2xl font-bold text-yellow-600">{{ projectStore.projectStats.pending }}</p>
          </div>
          <AlertCircle class="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Completed</p>
            <p class="text-2xl font-bold text-green-600">{{ projectStore.projectStats.completed }}</p>
          </div>
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
      </div>
    </div>

    <!-- Filter and Search -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div class="flex-1">
          <input 
            v-model="projectStore.filters.keyword"
            type="text" 
            placeholder="Search projects by title, description, or principal investigator..."
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
            @input="debouncedSearch"
          >
        </div>
        
        <div class="flex items-center space-x-3">
          <select 
            v-model="projectStore.filters.status" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="projectStore.setFilters({ status: $event.target.value })"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select 
            v-model="projectStore.filters.laboratory" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="projectStore.setFilters({ laboratory: $event.target.value })"
          >
            <option value="">All Labs</option>
            <option 
              v-for="lab in laboratories" 
              :key="lab.id" 
              :value="lab.name"
            >
              {{ lab.name }}
            </option>
          </select>
          
          <select 
            v-model="projectStore.filters.priority" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="projectStore.setFilters({ priority: $event.target.value })"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <button 
            class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div v-if="projectStore.loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
      <p class="text-gray-500 mt-2">Loading projects...</p>
    </div>
    
    <div v-else-if="projectStore.error" class="text-center py-8">
      <p class="text-red-500">{{ projectStore.error }}</p>
      <button 
        class="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        @click="projectStore.fetchProjects(true)"
      >
        Retry
      </button>
    </div>
    
    <div v-else-if="projectStore.filteredProjects.length === 0" class="text-center py-8">
      <FileText class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
      <p class="text-gray-500 mb-4">Get started by creating your first project</p>
      <button 
        v-if="canCreateProject"
        class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
        @click="$router.push('/projects/new')"
      >
        <Plus class="w-4 h-4 inline mr-2" />
        Create Project
      </button>
    </div>
    
    <div v-else class="space-y-4">
      <div
        v-for="project in projectStore.filteredProjects"
        :key="project.id"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        @click="viewProject(project.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-3">
              <h3 class="text-lg font-semibold text-gray-900">{{ project.title }}</h3>
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getStatusClass(project.status)"
              >
                {{ getStatusText(project.status) }}
              </span>
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="getPriorityClass(project.priority)"
              >
                {{ project.priority.toUpperCase() }}
              </span>
            </div>
            
            <p class="text-gray-600 mb-4 line-clamp-2">{{ project.description }}</p>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span class="font-medium">Principal Investigator:</span>
                <span class="ml-1">{{ project.principalInvestigator.name }}</span>
              </div>
              
              <div>
                <span class="font-medium">Laboratory:</span>
                <span class="ml-1">{{ project.laboratory || 'Not assigned' }}</span>
              </div>
              
              <div>
                <span class="font-medium">Duration:</span>
                <span class="ml-1">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
              </div>
              
              <div>
                <span class="font-medium">Progress:</span>
                <div class="flex items-center space-x-2 mt-1">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      :style="{ width: project.progress + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs">{{ project.progress }}%</span>
                </div>
              </div>
            </div>
            
            <!-- Project Phases -->
            <div class="mt-4">
              <div class="flex items-center space-x-4">
                <div 
                  v-for="phase in projectPhases"
                  :key="phase.key"
                  class="flex items-center space-x-2"
                >
                  <component 
                    :is="phase.icon" 
                    class="w-4 h-4"
                    :class="getPhaseClass(project, phase.key)"
                  />
                  <span 
                    class="text-xs"
                    :class="getPhaseTextClass(project, phase.key)"
                  >
                    {{ phase.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2 ml-4" @click.stop>
            <button 
              class="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              @click="viewProject(project.id)"
            >
              View Details
            </button>
            
            <button 
              v-if="canEditProject(project)"
              class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              @click="editProject(project.id)"
            >
              Edit
            </button>
            
            <button 
              v-if="canApproveProject(project)"
              class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              @click="showApprovalModal(project)"
            >
              Review
            </button>
            
            <button 
              v-if="canDeleteProject(project)"
              class="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              @click="deleteProject(project.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div 
      v-if="showApproval"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showApproval = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-lg mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Review Project Application</h3>
        
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900">{{ selectedProject?.title }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ selectedProject?.description }}</p>
          </div>
          
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
              @click="showApproval = false"
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
import { useRouter } from 'vue-router'
import { 
  Plus, 
  Download, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  FileCheck,
  FlaskConical,
  BookOpen,
  Archive
} from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import type { Project } from '@/types'
import { UserRole } from '@/types'

const router = useRouter()
const projectStore = useProjectStore()
const labStore = useLabStore()
const authStore = useAuthStore()
const uiStore = useUiStore()

// Reactive data
const showApproval = ref(false)
const selectedProject = ref<Project | null>(null)
const approving = ref(false)
const rejecting = ref(false)

const approvalForm = ref({
  comments: ''
})

const projectPhases = [
  { key: 'application', label: 'Application', icon: FileCheck },
  { key: 'design', label: 'Design', icon: FlaskConical },
  { key: 'execution', label: 'Execution', icon: BookOpen },
  { key: 'archive', label: 'Archive', icon: Archive }
]

// Computed properties
const laboratories = computed(() => labStore.labs)

const canCreateProject = computed(() => {
  return authStore.hasRole(UserRole.SYSTEM_ADMIN) ||
         authStore.hasRole(UserRole.DEPARTMENT_ADMIN) ||
         authStore.hasRole(UserRole.TEACHER) ||
         authStore.hasRole(UserRole.STUDENT)
})

const canExportData = computed(() => {
  return authStore.hasRole(UserRole.SYSTEM_ADMIN) ||
         authStore.hasRole(UserRole.DEPARTMENT_ADMIN) ||
         authStore.hasRole(UserRole.TEACHER)
})

// Methods
const canEditProject = (project: Project) => {
  if (authStore.hasRole(UserRole.SYSTEM_ADMIN) || authStore.hasRole(UserRole.DEPARTMENT_ADMIN)) {
    return true
  }
  if (authStore.hasRole(UserRole.TEACHER)) {
    return project.principalInvestigator.id === authStore.user?.id
  }
  return false
}

const canApproveProject = (project: Project) => {
  return (authStore.hasRole(UserRole.SYSTEM_ADMIN) || authStore.hasRole(UserRole.DEPARTMENT_ADMIN)) && 
         project.status === 'pending'
}

const canDeleteProject = (project: Project) => {
  return (authStore.hasRole(UserRole.SYSTEM_ADMIN) || authStore.hasRole(UserRole.DEPARTMENT_ADMIN)) && 
         ['pending', 'rejected'].includes(project.status)
}

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

const getPhaseClass = (project: Project, phaseKey: string) => {
  return project.phases[phaseKey as keyof typeof project.phases] 
    ? 'text-green-600' 
    : 'text-gray-400'
}

const getPhaseTextClass = (project: Project, phaseKey: string) => {
  return project.phases[phaseKey as keyof typeof project.phases] 
    ? 'text-green-600' 
    : 'text-gray-400'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const viewProject = (projectId: string) => {
  router.push(`/projects/${projectId}`)
}

const editProject = (projectId: string) => {
  router.push(`/projects/${projectId}/edit`)
}

const deleteProject = async (projectId: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await projectStore.deleteProject(projectId)
      uiStore.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project deleted successfully'
      })
    } catch (error) {
      uiStore.addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete project'
      })
    }
  }
}

const showApprovalModal = (project: Project) => {
  selectedProject.value = project
  showApproval.value = true
  approvalForm.value.comments = ''
}

const approveProject = async () => {
  if (!selectedProject.value) return
  
  try {
    approving.value = true
    await projectStore.approveProject(selectedProject.value.id, approvalForm.value.comments)
    
    uiStore.addNotification({
      type: 'success',
      title: 'Success',
      message: 'Project approved successfully'
    })
    
    showApproval.value = false
    approvalForm.value.comments = ''
    selectedProject.value = null
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
  if (!selectedProject.value) return
  
  try {
    rejecting.value = true
    await projectStore.rejectProject(selectedProject.value.id, approvalForm.value.comments)
    
    uiStore.addNotification({
      type: 'success',
      title: 'Success',
      message: 'Project rejected successfully'
    })
    
    showApproval.value = false
    approvalForm.value.comments = ''
    selectedProject.value = null
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

const exportProjects = () => {
  console.log('Export projects to CSV/Excel')
  // Implementation for exporting project data
}

const clearFilters = () => {
  projectStore.clearFilters()
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    projectStore.setFilters({ keyword: projectStore.filters.keyword })
  }, 300)
}

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      labStore.fetchLabs()
    ])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>