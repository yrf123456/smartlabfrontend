import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { Project } from '@/types'
import { api } from '@/api'

interface ProjectFilters {
  keyword: string
  status: Project['status'] | ''
  priority: Project['priority'] | ''
  laboratory: string
  principalInvestigator: string
}

interface ProjectStats {
  total: number
  pending: number
  approved: number
  inProgress: number
  completed: number
  archived: number
  rejected: number
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  const filters = ref<ProjectFilters>({
    keyword: '',
    status: '',
    priority: '',
    laboratory: '',
    principalInvestigator: ''
  })
  const viewMode = ref<'list' | 'kanban'>('list')
  const sortBy = ref<'createdAt' | 'updatedAt' | 'startDate' | 'priority'>('updatedAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const filteredProjects = computed(() => {
    console.log('📄 Computing filtered projects, total:', projects.value.length)
    
    let filtered = [...projects.value]
    
    // Apply filters
    if (filters.value.keyword) {
      const keyword = filters.value.keyword.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword) ||
        project.principalInvestigator.name.toLowerCase().includes(keyword)
      )
    }
    
    if (filters.value.status) {
      filtered = filtered.filter(project => project.status === filters.value.status)
    }
    
    if (filters.value.priority) {
      filtered = filtered.filter(project => project.priority === filters.value.priority)
    }
    
    if (filters.value.laboratory) {
      filtered = filtered.filter(project => 
        project.laboratory?.toLowerCase().includes(filters.value.laboratory.toLowerCase())
      )
    }
    
    if (filters.value.principalInvestigator) {
      filtered = filtered.filter(project =>
        project.principalInvestigator.name.toLowerCase().includes(filters.value.principalInvestigator.toLowerCase())
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      switch (sortBy.value) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'startDate':
          aValue = new Date(a.startDate).getTime()
          bValue = new Date(b.startDate).getTime()
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
      }
      
      return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    return filtered
  })

  const projectStats = computed((): ProjectStats => {
    return {
      total: projects.value.length,
      pending: projects.value.filter(p => p.status === 'pending').length,
      approved: projects.value.filter(p => p.status === 'approved').length,
      inProgress: projects.value.filter(p => p.status === 'in_progress').length,
      completed: projects.value.filter(p => p.status === 'completed').length,
      archived: projects.value.filter(p => p.status === 'archived').length,
      rejected: projects.value.filter(p => p.status === 'rejected').length
    }
  })

  const pendingProjects = computed(() => {
    return projects.value.filter(project => project.status === 'pending')
  })

  const myProjects = computed(() => {
    // This would need access to current user from auth store
    // return projects.value.filter(project => project.principalInvestigator.id === currentUserId)
    return projects.value
  })

  const fetchProjects = async (force = false) => {
    if (initialized.value && !force && projects.value.length > 0) {
      console.log('✅ Projects already loaded, skipping fetch')
      return projects.value
    }

    try {
      console.log('📡 Fetching projects...')
      loading.value = true
      error.value = null
      
      const response = await api.projects.getList(filters.value)
      
      projects.value = response.data || []
      initialized.value = true
      
      console.log('✅ Projects fetched successfully:', projects.value.length, 'items')
      
      await nextTick()
      
      return projects.value
    } catch (err: any) {
      console.error('⌛ Failed to fetch projects:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch projects'
      projects.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProjectById = async (id: string) => {
    try {
      console.log('📡 Fetching project by ID:', id)
      
      const existingProject = projects.value.find(project => project.id === id)
      if (existingProject) {
        console.log('✅ Project found in store:', existingProject.title)
        return existingProject
      }
      
      const response = await api.projects.getById(id)
      const project = response.data
      
      console.log('✅ Project fetched from API:', project.title)
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index > -1) {
        projects.value[index] = project
      } else {
        projects.value.push(project)
      }
      
      await nextTick()
      return project
    } catch (err: any) {
      console.error('⌛ Failed to fetch project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch project details'
      throw err
    }
  }

  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('📡 Creating project:', projectData.title)
      const response = await api.projects.create(projectData)
      const newProject = response.data
      
      projects.value.unshift(newProject)
      
      console.log('✅ Project created successfully:', newProject.title)
      await nextTick()
      
      return newProject
    } catch (err: any) {
      console.error('⌛ Failed to create project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create project'
      throw err
    }
  }

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      console.log('📡 Updating project:', id)
      const response = await api.projects.update(id, projectData)
      const updatedProject = response.data
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index > -1) {
        projects.value[index] = updatedProject
      }
      
      console.log('✅ Project updated successfully:', updatedProject.title)
      await nextTick()
      
      return updatedProject
    } catch (err: any) {
      console.error('⌛ Failed to update project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update project'
      throw err
    }
  }

  const approveProject = async (id: string, comments?: string) => {
    try {
      console.log('📡 Approving project:', id)
      const response = await api.projects.approve(id, { approved: true, comments })
      const updatedProject = response.data
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index > -1) {
        projects.value[index] = updatedProject
      }
      
      console.log('✅ Project approved successfully')
      await nextTick()
      
      return updatedProject
    } catch (err: any) {
      console.error('⌛ Failed to approve project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to approve project'
      throw err
    }
  }

  const rejectProject = async (id: string, reason?: string) => {
    try {
      console.log('📡 Rejecting project:', id)
      const response = await api.projects.reject(id, { approved: false, comments: reason })
      const updatedProject = response.data
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index > -1) {
        projects.value[index] = updatedProject
      }
      
      console.log('✅ Project rejected successfully')
      await nextTick()
      
      return updatedProject
    } catch (err: any) {
      console.error('⌛ Failed to reject project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reject project'
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      console.log('📡 Deleting project:', id)
      await api.projects.delete(id)
      
      const index = projects.value.findIndex(p => p.id === id)
      if (index > -1) {
        projects.value.splice(index, 1)
      }
      
      console.log('✅ Project deleted successfully')
      await nextTick()
    } catch (err: any) {
      console.error('⌛ Failed to delete project:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete project'
      throw err
    }
  }

  const setFilters = async (newFilters: Partial<ProjectFilters>) => {
    console.log('📄 Setting filters:', newFilters)
    filters.value = { ...filters.value, ...newFilters }
    await nextTick()
  }

  const clearFilters = async () => {
    console.log('🧹 Clearing filters')
    filters.value = {
      keyword: '',
      status: '',
      priority: '',
      laboratory: '',
      principalInvestigator: ''
    }
    await nextTick()
  }

  const setSorting = (field: typeof sortBy.value, order: typeof sortOrder.value) => {
    console.log('📊 Setting sort:', field, order)
    sortBy.value = field
    sortOrder.value = order
  }

  const setViewMode = (mode: typeof viewMode.value) => {
    console.log('👁️ Setting view mode:', mode)
    viewMode.value = mode
  }

  const refreshData = async () => {
    console.log('🔄 Refreshing project data')
    initialized.value = false
    await fetchProjects(true)
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    console.log('🔄 Resetting project store')
    projects.value = []
    loading.value = false
    error.value = null
    initialized.value = false
    filters.value = {
      keyword: '',
      status: '',
      priority: '',
      laboratory: '',
      principalInvestigator: ''
    }
    viewMode.value = 'list'
    sortBy.value = 'updatedAt'
    sortOrder.value = 'desc'
  }

  return {
    projects,
    loading,
    error,
    initialized,
    filters,
    viewMode,
    sortBy,
    sortOrder,
    filteredProjects,
    projectStats,
    pendingProjects,
    myProjects,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    approveProject,
    rejectProject,
    deleteProject,
    setFilters,
    clearFilters,
    setSorting,
    setViewMode,
    refreshData,
    clearError,
    reset
  }
})