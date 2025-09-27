<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Project Management</h1>
        <p class="text-gray-600 mt-1">Manage experimental projects from application to archive</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          v-if="canCreateProject"
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4 inline mr-2" />
          New Project
        </button>
        
        <button 
          v-if="canExportData"
          class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          @click="exportProjects"
        >
          <Download class="w-4 h-4 inline mr-2" />
          Export
        </button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Projects</p>
            <p class="text-2xl font-bold text-gray-900">{{ projectStats.total }}</p>
          </div>
          <FileText class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">In Progress</p>
            <p class="text-2xl font-bold text-blue-600">{{ projectStats.inProgress }}</p>
          </div>
          <Clock class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending Approval</p>
            <p class="text-2xl font-bold text-yellow-600">{{ projectStats.pending }}</p>
          </div>
          <AlertCircle class="w-8 h-8 text-yellow-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Completed</p>
            <p class="text-2xl font-bold text-green-600">{{ projectStats.completed }}</p>
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
            v-model="searchQuery"
            type="text" 
            placeholder="Search projects by title, description, or principal investigator..."
            class="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
        </div>
        
        <div class="flex items-center space-x-3">
          <select 
            v-model="selectedStatus" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
            v-model="selectedLaboratory" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Labs</option>
            <option 
              v-for="lab in laboratories" 
              :key="lab.id" 
              :value="lab.id"
            >
              {{ lab.name }}
            </option>
          </select>
          
          <select 
            v-model="selectedPriority" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div class="space-y-4">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
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
                <span class="ml-1">{{ project.startDate }} - {{ project.endDate }}</span>
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
          
          <div class="flex items-center space-x-2 ml-4">
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

    <!-- Create Project Modal -->
    <div 
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCreateModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
        
        <form @submit.prevent="createProject" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
              <input 
                v-model="createForm.title"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter project title"
                required
              >
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                v-model="createForm.description"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="Describe your project objectives and methodology"
                required
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
              <select 
                v-model="createForm.laboratory"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select 
                v-model="createForm.priority"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                v-model="createForm.startDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input 
                v-model="createForm.endDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <label 
                  v-for="user in availableUsers" 
                  :key="user.id"
                  class="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <input 
                    v-model="createForm.teamMembers"
                    type="checkbox" 
                    :value="user.id"
                    class="rounded border-gray-300"
                  >
                  <div class="flex-1">
                    <span class="text-sm font-medium">{{ user.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ user.role }})</span>
                  </div>
                </label>
              </div>
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Research Objectives</label>
              <textarea 
                v-model="createForm.objectives"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="List the main research objectives and expected outcomes"
              ></textarea>
            </div>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Create Project
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showCreateModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
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
            >
              <CheckCircle class="w-4 h-4 inline mr-2" />
              Approve
            </button>
            <button 
              class="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
              @click="rejectProject"
            >
              <XCircle class="w-4 h-4 inline mr-2" />
              Reject
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

// Define interfaces
interface User {
  id: string
  name: string
  role: string
  email: string
}

interface Project {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'archived' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  principalInvestigator: User
  teamMembers: string[]
  laboratory: string
  startDate: string
  endDate: string
  progress: number
  phases: {
    application: boolean
    design: boolean
    execution: boolean
    archive: boolean
  }
  objectives: string
  createdAt: string
  updatedAt: string
}

interface ProjectPhase {
  key: string
  label: string
  icon: any
}

interface Lab {
  id: string
  name: string
}

// Mock current user role - in real app this would come from auth store
const currentUserRole = ref('TEACHER') // Could be SYS_ADMIN, DEPT_ADMIN, TEACHER, STUDENT, VISITOR

// Reactive data
const showCreateModal = ref(false)
const showApproval = ref(false)
const selectedProject = ref<Project | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedLaboratory = ref('')
const selectedPriority = ref('')

const createForm = ref({
  title: '',
  description: '',
  laboratory: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  startDate: '',
  endDate: '',
  teamMembers: [] as string[],
  objectives: ''
})

const approvalForm = ref({
  comments: ''
})

const projectStats = ref({
  total: 28,
  inProgress: 12,
  pending: 5,
  completed: 11
})

const projectPhases: ProjectPhase[] = [
  { key: 'application', label: 'Application', icon: FileCheck },
  { key: 'design', label: 'Design', icon: FlaskConical },
  { key: 'execution', label: 'Execution', icon: BookOpen },
  { key: 'archive', label: 'Archive', icon: Archive }
]

const laboratories = ref<Lab[]>([
  { id: 'ai-lab', name: 'AI Laboratory' },
  { id: 'iot-lab', name: 'IoT Laboratory' },
  { id: 'cloud-lab', name: 'Cloud Computing Lab' },
  { id: 'security-lab', name: 'Network Security Lab' }
])

const availableUsers = ref<User[]>([
  { id: '1', name: 'Dr. Sarah Wilson', role: 'TEACHER', email: 'sarah@example.com' },
  { id: '2', name: 'John Smith', role: 'STUDENT', email: 'john@example.com' },
  { id: '3', name: 'Emily Davis', role: 'STUDENT', email: 'emily@example.com' },
  { id: '4', name: 'Prof. Mike Johnson', role: 'TEACHER', email: 'mike@example.com' }
])

const projects = ref<Project[]>([
  {
    id: '1',
    title: 'Machine Learning in Medical Diagnosis',
    description: 'Developing an AI system for automated medical image analysis and diagnosis using deep learning techniques.',
    status: 'in_progress',
    priority: 'high',
    principalInvestigator: {
      id: '1',
      name: 'Dr. Sarah Wilson',
      role: 'TEACHER',
      email: 'sarah@example.com'
    },
    teamMembers: ['2', '3'],
    laboratory: 'AI Laboratory',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    progress: 65,
    phases: {
      application: true,
      design: true,
      execution: true,
      archive: false
    },
    objectives: 'Improve medical diagnosis accuracy by 25% using AI algorithms',
    createdAt: '2025-01-10',
    updatedAt: '2025-09-20'
  },
  {
    id: '2',
    title: 'IoT Environmental Monitoring System',
    description: 'Building a comprehensive IoT network for real-time environmental monitoring in smart buildings.',
    status: 'pending',
    priority: 'medium',
    principalInvestigator: {
      id: '4',
      name: 'Prof. Mike Johnson',
      role: 'TEACHER',
      email: 'mike@example.com'
    },
    teamMembers: ['2'],
    laboratory: 'IoT Laboratory',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    progress: 0,
    phases: {
      application: true,
      design: false,
      execution: false,
      archive: false
    },
    objectives: 'Create efficient energy management system for smart buildings',
    createdAt: '2025-09-15',
    updatedAt: '2025-09-27'
  },
  {
    id: '3',
    title: 'Blockchain Security Framework',
    description: 'Research and development of advanced security protocols for blockchain networks.',
    status: 'completed',
    priority: 'high',
    principalInvestigator: {
      id: '1',
      name: 'Dr. Sarah Wilson',
      role: 'TEACHER',
      email: 'sarah@example.com'
    },
    teamMembers: ['3'],
    laboratory: 'Network Security Lab',
    startDate: '2024-08-01',
    endDate: '2025-01-31',
    progress: 100,
    phases: {
      application: true,
      design: true,
      execution: true,
      archive: true
    },
    objectives: 'Enhance blockchain security by implementing novel consensus mechanisms',
    createdAt: '2024-07-20',
    updatedAt: '2025-02-01'
  }
])

// Computed properties
const filteredProjects = computed(() => {
  return projects.value.filter(project => {
    const matchesSearch = !searchQuery.value || 
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.principalInvestigator.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = !selectedStatus.value || project.status === selectedStatus.value
    const matchesLab = !selectedLaboratory.value || project.laboratory.toLowerCase().includes(selectedLaboratory.value.toLowerCase())
    const matchesPriority = !selectedPriority.value || project.priority === selectedPriority.value
    
    return matchesSearch && matchesStatus && matchesLab && matchesPriority
  })
})

// Permission computed properties
const canCreateProject = computed(() => {
  return ['SYS_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT'].includes(currentUserRole.value)
})

const canExportData = computed(() => {
  return ['SYS_ADMIN', 'DEPT_ADMIN', 'TEACHER'].includes(currentUserRole.value)
})

// Methods
const canEditProject = (project: Project) => {
  if (['SYS_ADMIN', 'DEPT_ADMIN'].includes(currentUserRole.value)) return true
  if (currentUserRole.value === 'TEACHER') return true // Teachers can edit their own projects
  return false
}

const canApproveProject = (project: Project) => {
  return ['SYS_ADMIN', 'DEPT_ADMIN'].includes(currentUserRole.value) && project.status === 'pending'
}

const canDeleteProject = (project: Project) => {
  return ['SYS_ADMIN', 'DEPT_ADMIN'].includes(currentUserRole.value) && 
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

const viewProject = (projectId: string) => {
  console.log('View project details:', projectId)
  // Navigate to project detail page
}

const editProject = (projectId: string) => {
  console.log('Edit project:', projectId)
  // Navigate to project edit page
}

const deleteProject = (projectId: string) => {
  if (confirm('Are you sure you want to delete this project?')) {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      updateProjectStats()
    }
  }
}

const showApprovalModal = (project: Project) => {
  selectedProject.value = project
  showApproval.value = true
}

const approveProject = () => {
  if (!selectedProject.value) return
  
  const project = projects.value.find(p => p.id === selectedProject.value!.id)
  if (project) {
    project.status = 'approved'
    project.updatedAt = new Date().toISOString().split('T')[0]
    console.log('Project approved:', selectedProject.value.id, 'Comments:', approvalForm.value.comments)
  }
  
  showApproval.value = false
  approvalForm.value.comments = ''
  selectedProject.value = null
  updateProjectStats()
}

const rejectProject = () => {
  if (!selectedProject.value) return
  
  const project = projects.value.find(p => p.id === selectedProject.value!.id)
  if (project) {
    project.status = 'rejected'
    project.updatedAt = new Date().toISOString().split('T')[0]
    console.log('Project rejected:', selectedProject.value.id, 'Comments:', approvalForm.value.comments)
  }
  
  showApproval.value = false
  approvalForm.value.comments = ''
  selectedProject.value = null
  updateProjectStats()
}

const createProject = () => {
  const newProject: Project = {
    id: Date.now().toString(),
    title: createForm.value.title,
    description: createForm.value.description,
    status: 'pending',
    priority: createForm.value.priority,
    principalInvestigator: availableUsers.value[0], // In real app, this would be current user
    teamMembers: createForm.value.teamMembers,
    laboratory: createForm.value.laboratory,
    startDate: createForm.value.startDate,
    endDate: createForm.value.endDate,
    progress: 0,
    phases: {
      application: true,
      design: false,
      execution: false,
      archive: false
    },
    objectives: createForm.value.objectives,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  }
  
  projects.value.unshift(newProject)
  showCreateModal.value = false
  
  // Reset form
  createForm.value = {
    title: '',
    description: '',
    laboratory: '',
    priority: 'medium',
    startDate: '',
    endDate: '',
    teamMembers: [],
    objectives: ''
  }
  
  updateProjectStats()
}

const exportProjects = () => {
  console.log('Export projects to CSV/Excel')
  // Implementation for exporting project data
}

const updateProjectStats = () => {
  projectStats.value = {
    total: projects.value.length,
    inProgress: projects.value.filter(p => p.status === 'in_progress').length,
    pending: projects.value.filter(p => p.status === 'pending').length,
    completed: projects.value.filter(p => p.status === 'completed').length
  }
}

onMounted(() => {
  updateProjectStats()
  
  // Simulate real-time updates
  setInterval(() => {
    // Randomly update project progress for in-progress projects
    projects.value.forEach(project => {
      if (project.status === 'in_progress' && Math.random() > 0.9) {
        project.progress = Math.min(100, project.progress + Math.floor(Math.random() * 5))
        project.updatedAt = new Date().toISOString().split('T')[0]
        
        // Auto-complete project when progress reaches 100%
        if (project.progress === 100) {
          project.status = 'completed'
          project.phases.execution = true
        }
      }
    })
    updateProjectStats()
  }, 60000) // Update every minute
})
</script>