import axios from 'axios'
import type { ApiResponse, User, Lab, BookingEvent, Equipment, EnvPoint, Project, CreateProjectRequest, UpdateProjectRequest, UserStats } from '@/types'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

const request = axios.create({
  baseURL,
  timeout: 10000
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 0) {
      return { code: 0, data: res.data, message: res.msg || 'success' }
    } else {
      return Promise.reject(new Error(res.msg || 'Error'))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
const authApi = {
  login: async (data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await request.post('/auth/login', data)
    return {
      code: 0,
      data: {
        token: response.data.token,
        user: {
          id: response.data.user.id,
          username: response.data.user.username,
          name: response.data.user.name,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
          roles: response.data.user.roles || [],
          permissions: response.data.user.permissions || [],
          status: response.data.user.status
        }
      },
      message: 'success'
    }
  },
  
  register: async (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    role?: string
    department?: string
  }): Promise<ApiResponse<{ user: User; token: string; requiresApproval?: boolean }>> => {
    const response = await request.post('/auth/register', data)
    return {
      code: 0,
      data: {
        token: response.data.token,
        user: {
          id: response.data.user.id,
          username: response.data.user.username,
          name: response.data.user.name,
          email: response.data.user.email,
          avatarUrl: response.data.user.avatarUrl,
          roles: response.data.user.roles || [],
          permissions: response.data.user.permissions || [],
          status: response.data.user.status
        },
        requiresApproval: response.data.requiresApproval
      },
      message: 'success'
    }
  },
  
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await request.get('/auth/me')
    return {
      code: 0,
      data: {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        email: response.data.email,
        avatarUrl: response.data.avatarUrl,
        roles: response.data.roles || [],
        permissions: response.data.permissions || [],
        status: response.data.status
      },
      message: 'success'
    }
  },
  
  logout: (): Promise<ApiResponse> => {
    return request.post('/auth/logout')
  }
}

// Labs API
const labsApi = {
  getList: (params?: { keyword?: string; tags?: string[]; status?: string }): Promise<ApiResponse<Lab[]>> => {
    return request.get('/labs', { params })
  },
  
  getById: (id: string): Promise<ApiResponse<Lab>> => {
    return request.get(`/labs/${id}`)
  },
  
  create: (data: Omit<Lab, 'id'>): Promise<ApiResponse<Lab>> => {
    return request.post('/labs', data)
  },
  
  update: (id: string, data: Partial<Lab>): Promise<ApiResponse<Lab>> => {
    return request.put(`/labs/${id}`, data)
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await request.delete(`/labs/${id}`)
    return {
      code: 0,
      data: undefined,
      message: 'success'
    }
  }
}

// Bookings API
const bookingsApi = {
  getList: async (params?: { from?: string; to?: string; labId?: string }): Promise<ApiResponse<BookingEvent[]>> => {
    try {
      const response = await request.get('/bookings', { params })
      
      const bookings: BookingEvent[] = (response.data || []).map((item: any) => ({
        id: String(item.id),
        labId: String(item.labId),
        title: item.title,
        start: item.start,
        end: item.end,
        requester: item.requester ? {
          id: String(item.requester.id),
          name: item.requester.name,
          avatarUrl: item.requester.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          avatarUrl: ''
        },
        status: item.status,
        participants: item.participants || 0,
        note: item.note || '',
        bookingType: item.bookingType || 'lab',
        equipmentId: item.equipmentId ? String(item.equipmentId) : undefined,
        equipment: item.equipment ? {
          id: String(item.equipment.id),
          name: item.equipment.name,
          code: item.equipment.code,
          type: item.equipment.type
        } : undefined
      }))
      
      return {
        code: 0,
        data: bookings,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<ApiResponse<BookingEvent>> => {
    try {
      const response = await request.get(`/bookings/${id}`)
      
      const booking: BookingEvent = {
        id: String(response.data.id),
        labId: String(response.data.labId),
        title: response.data.title,
        start: response.data.start,
        end: response.data.end,
        requester: response.data.requester ? {
          id: String(response.data.requester.id),
          name: response.data.requester.name,
          avatarUrl: response.data.requester.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          avatarUrl: ''
        },
        status: response.data.status,
        participants: response.data.participants || 0,
        note: response.data.note || ''
      }
      
      return {
        code: 0,
        data: booking,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
      throw error
    }
  },
  
  create: async (data: {
    labId: number
    title: string
    start: string
    end: string
    requesterId: number
    participants: number
    note?: string
    equipmentId?: number
    bookingType?: 'lab' | 'equipment'
  }): Promise<ApiResponse<BookingEvent>> => {
    try {
      const response = await request.post('/bookings', data)
      
      const booking: BookingEvent = {
        id: String(response.data.id),
        labId: String(response.data.labId),
        title: response.data.title,
        start: response.data.start,
        end: response.data.end,
        requester: response.data.requester ? {
          id: String(response.data.requester.id),
          name: response.data.requester.name,
          avatarUrl: response.data.requester.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          avatarUrl: ''
        },
        status: response.data.status,
        participants: response.data.participants || 0,
        note: response.data.note || '',
        bookingType: response.data.bookingType || 'lab',
        equipmentId: response.data.equipmentId ? String(response.data.equipmentId) : undefined,
        equipment: response.data.equipment ? {
          id: String(response.data.equipment.id),
          name: response.data.equipment.name,
          code: response.data.equipment.code,
          type: response.data.equipment.type
        } : undefined
      }
      
      return {
        code: 0,
        data: booking,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
      throw error
    }
  },
  
  approve: async (id: string): Promise<ApiResponse<BookingEvent>> => {
    try {
      const response = await request.put(`/bookings/${id}/approve`)
      
      const booking: BookingEvent = {
        id: String(response.data.id),
        labId: String(response.data.labId),
        title: response.data.title,
        start: response.data.start,
        end: response.data.end,
        requester: response.data.requester ? {
          id: String(response.data.requester.id),
          name: response.data.requester.name,
          avatarUrl: response.data.requester.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          avatarUrl: ''
        },
        status: response.data.status,
        participants: response.data.participants || 0,
        note: response.data.note || ''
      }
      
      return {
        code: 0,
        data: booking,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to approve booking:', error)
      throw error
    }
  },
  
  reject: async (id: string): Promise<ApiResponse<BookingEvent>> => {
    try {
      const response = await request.put(`/bookings/${id}/reject`)
      
      const booking: BookingEvent = {
        id: String(response.data.id),
        labId: String(response.data.labId),
        title: response.data.title,
        start: response.data.start,
        end: response.data.end,
        requester: response.data.requester ? {
          id: String(response.data.requester.id),
          name: response.data.requester.name,
          avatarUrl: response.data.requester.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          avatarUrl: ''
        },
        status: response.data.status,
        participants: response.data.participants || 0,
        note: response.data.note || ''
      }
      
      return {
        code: 0,
        data: booking,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to reject booking:', error)
      throw error
    }
  }
}

// Equipment API
const equipmentApi = {
  getList: async (params?: { labId?: string; status?: string }): Promise<ApiResponse<Equipment[]>> => {
    const response = await request.get('/equipment', { params })
    return {
      code: 0,
      data: response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        type: item.type,
        labId: item.labId,
        status: item.status,
        maintainDue: item.maintainDue
      })),
      message: 'success'
    }
  },

  getById: async (id: string): Promise<ApiResponse<Equipment>> => {
    const response = await request.get(`/equipment/${id}`)
    return {
      code: 0,
      data: {
        id: response.data.id,
        name: response.data.name,
        code: response.data.code,
        type: response.data.type,
        labId: response.data.labId,
        status: response.data.status,
        maintainDue: response.data.maintainDue
      },
      message: 'success'
    }
  },

  create: async (data: {
    name: string
    code: string
    type: string
    labId: number
    maintainDue?: string
  }): Promise<ApiResponse<Equipment>> => {
    const response = await request.post('/equipment', data)
    return {
      code: 0,
      data: {
        id: response.data.id,
        name: response.data.name,
        code: response.data.code,
        type: response.data.type,
        labId: response.data.labId,
        status: response.data.status,
        maintainDue: response.data.maintainDue
      },
      message: 'success'
    }
  },

  update: async (id: string, data: {
    name?: string
    code?: string
    type?: string
    labId?: number
    status?: string
    maintainDue?: string
  }): Promise<ApiResponse<Equipment>> => {
    const response = await request.put(`/equipment/${id}`, data)
    return {
      code: 0,
      data: {
        id: response.data.id,
        name: response.data.name,
        code: response.data.code,
        type: response.data.type,
        labId: response.data.labId,
        status: response.data.status,
        maintainDue: response.data.maintainDue
      },
      message: 'success'
    }
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Equipment>> => {
    const response = await request({
      method: 'PATCH',
      url: `/equipment/${id}/status`,
      params: { status }
    })
    return {
      code: 0,
      data: {
        id: response.data.id,
        name: response.data.name,
        code: response.data.code,
        type: response.data.type,
        labId: response.data.labId,
        status: response.data.status,
        maintainDue: response.data.maintainDue
      },
      message: 'success'
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await request.delete(`/equipment/${id}`)
    return {
      code: 0,
      data: undefined,
      message: 'success'
    }
  }
}

// Environment API
const environmentApi = {
  getSeries: (labId: string, params?: { from?: string; to?: string }): Promise<ApiResponse<EnvPoint[]>> => {
    return request.get(`/env/${labId}/series`, { params })
  },
  
  getLatest: (labId: string): Promise<ApiResponse<any>> => {
    return request.get(`/env/${labId}/latest`)
  },
  
  getAllLabsEnv: (): Promise<ApiResponse<any[]>> => {
    return request.get('/env/labs')
  },
  
  addEnvData: (labId: string, data: {
    temperature: number
    humidity: number
    pm25: number
    noise: number
  }): Promise<ApiResponse<void>> => {
    return request.post(`/env/${labId}/data`, data)
  },
  
  getStats: (): Promise<ApiResponse<{
    totalSensors: number
    activeAlerts: number
    avgTemperature: number
    uptime: number
  }>> => {
    return request.get('/env/stats')
  },
  
  getAlerts: (): Promise<ApiResponse<any[]>> => {
    return request.get('/env/alerts')
  },
  
  getThresholds: (): Promise<ApiResponse<any[]>> => {
    return request.get('/env/thresholds')
  },
  
  updateThresholds: (data: any[]): Promise<ApiResponse<void>> => {
    return request.put('/env/thresholds', data)
  }
}

// Users API
const usersApi = {
  getList: async (params?: { 
    keyword?: string
    role?: string
    status?: string 
  }): Promise<ApiResponse<User[]>> => {
    try {
      const response = await request.get('/users', { params })
      const users: User[] = (response.data || []).map((item: any) => ({
        id: item.id,
        username: item.username || item.email,
        name: item.name,
        email: item.email,
        avatarUrl: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
        roles: item.roles || [],
        status: item.status || 'active',
        department: item.department || 'Unknown'
      }))
      return { code: 0, data: users, message: 'success' }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  },

  getStats: async (): Promise<ApiResponse<UserStats>> => {
    try {
      const response = await request.get('/admin/users/stats')
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
      throw error
    }
  },

  update: async (userId: string, data: {
    role: string
    department: string
  }): Promise<ApiResponse<void>> => {
    try {
      await request.put(`/admin/users/${userId}`, data)
      return { code: 0, data: undefined, message: 'success' }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  },

  updateStatus: async (userId: string, status: number): Promise<ApiResponse<void>> => {
    try {
      await request.patch(`/admin/users/${userId}/status`, null, {
        params: { status }
      })
      return { code: 0, data: undefined, message: 'success' }
    } catch (error) {
      console.error('Failed to update user status:', error)
      throw error
    }
  },

  delete: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      await request.delete(`/admin/users/${userId}`)
      return { code: 0, data: undefined, message: 'success' }
    } catch (error) {
      console.error('Failed to delete user:', error)
      throw error
    }
  },

  bulkUpdatePermissions: async (permissions: Array<{
    permissionId: string
    roles: Record<string, boolean>
  }>): Promise<ApiResponse<void>> => {
    try {
      await request.put('/admin/permissions/bulk', permissions)
      return { code: 0, data: undefined, message: 'success' }
    } catch (error) {
      console.error('Failed to update permissions:', error)
      throw error
    }
  },

  getPermissions: async (): Promise<ApiResponse<Array<{
    id: string
    name: string
    description: string
    roles: Record<string, boolean>
  }>>> => {
    try {
      const response = await request.get('/admin/permissions')
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      throw error
    }
  }
}

// Dashboard API
interface DashboardStats {
  todayBookings: number
  todayBookingsTrend: number
  equipmentAvailability: string
  equipmentAvailabilityTrend: number
  alertCount: number
  alertCountTrend: number
  weeklyUsage: string
  weeklyUsageTrend: number
}

interface LabEnv {
  id: string
  name: string
  status: string
  env: {
    temp: number | null
    hum: number | null
    pm25: number | null
    noise: number | null
  }
}

interface Activity {
  title: string
  description: string
  time: string
  icon: string
}

interface PendingApproval {
  id: string
  title: string
  requester: {
    name: string
    avatarUrl: string
  }
  time: string
}

const dashboardApi = {
  getStats: (): Promise<ApiResponse<DashboardStats>> => {
    return request.get('/dashboard/stats')
  },
  
  getLabsEnv: (): Promise<ApiResponse<LabEnv[]>> => {
    return request.get('/dashboard/labs-env')
  },
  
  getActivities: (): Promise<ApiResponse<Activity[]>> => {
    return request.get('/dashboard/activities')
  },
  
  getPendingApprovals: (): Promise<ApiResponse<PendingApproval[]>> => {
    return request.get('/dashboard/pending-approvals')
  }
}

// Projects API
const projectsApi = {
  getList: async (params?: {
    keyword?: string
    status?: string
    priority?: string
    laboratory?: string
  }): Promise<ApiResponse<Project[]>> => {
    try {
      const response = await request.get('/projects', { params })
      
      const projects: Project[] = (response.data || []).map((item: any) => ({
        id: String(item.id),
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        principalInvestigator: item.principalInvestigator ? {
          id: String(item.principalInvestigator.id),
          name: item.principalInvestigator.name,
          email: item.principalInvestigator.email,
          avatarUrl: item.principalInvestigator.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          email: '',
          avatarUrl: ''
        },
        laboratory: item.laboratory || '',
        startDate: item.startDate,
        endDate: item.endDate,
        progress: item.progress || 0,
        teamMembers: item.teamMembers || [],
        objectives: item.objectives || '',
        resources: item.resources || {},
        deliverables: item.deliverables || [],
        tags: item.tags || [],
        phases: item.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
      
      return {
        code: 0,
        data: projects,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<ApiResponse<Project>> => {
    try {
      const response = await request.get(`/projects/${id}`)
      
      const project: Project = {
        id: String(response.data.id),
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        principalInvestigator: response.data.principalInvestigator ? {
          id: String(response.data.principalInvestigator.id),
          name: response.data.principalInvestigator.name,
          email: response.data.principalInvestigator.email,
          avatarUrl: response.data.principalInvestigator.avatarUrl || ''
        } : {
          id: '0',
          name: 'Unknown',
          email: '',
          avatarUrl: ''
        },
        laboratory: response.data.laboratory || '',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        progress: response.data.progress || 0,
        teamMembers: response.data.teamMembers || [],
        objectives: response.data.objectives || '',
        resources: response.data.resources || {},
        deliverables: response.data.deliverables || [],
        tags: response.data.tags || [],
        phases: response.data.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
      
      return {
        code: 0,
        data: project,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
      throw error
    }
  },

  getStats: (): Promise<ApiResponse<{
    total: number
    pending: number
    approved: number
    inProgress: number
    completed: number
    archived: number
    rejected: number
  }>> => {
    return request.get('/projects/stats')
  },

  create: async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
    try {
      const response = await request.post('/projects', data)
      
      const project: Project = {
        id: String(response.data.id),
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        principalInvestigator: response.data.principalInvestigator,
        laboratory: response.data.laboratory || '',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        progress: response.data.progress || 0,
        teamMembers: response.data.teamMembers || [],
        objectives: response.data.objectives || '',
        resources: response.data.resources || {},
        deliverables: response.data.deliverables || [],
        tags: response.data.tags || [],
        phases: response.data.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
      
      return {
        code: 0,
        data: project,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  },

  update: async (id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
    try {
      const response = await request.put(`/projects/${id}`, data)
      
      const project: Project = {
        id: String(response.data.id),
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        principalInvestigator: response.data.principalInvestigator,
        laboratory: response.data.laboratory || '',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        progress: response.data.progress || 0,
        teamMembers: response.data.teamMembers || [],
        objectives: response.data.objectives || '',
        resources: response.data.resources || {},
        deliverables: response.data.deliverables || [],
        tags: response.data.tags || [],
        phases: response.data.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
      
      return {
        code: 0,
        data: project,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  },

  approve: async (id: string, body?: { approved: boolean; comments?: string }): Promise<ApiResponse<Project>> => {
    try {
      const response = await request.post(`/projects/${id}/approve`, body)
      
      const project: Project = {
        id: String(response.data.id),
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        principalInvestigator: response.data.principalInvestigator,
        laboratory: response.data.laboratory || '',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        progress: response.data.progress || 0,
        teamMembers: response.data.teamMembers || [],
        objectives: response.data.objectives || '',
        resources: response.data.resources || {},
        deliverables: response.data.deliverables || [],
        tags: response.data.tags || [],
        phases: response.data.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
      
      return {
        code: 0,
        data: project,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to approve project:', error)
      throw error
    }
  },

  reject: async (id: string, body?: { approved: boolean; comments?: string }): Promise<ApiResponse<Project>> => {
    try {
      const response = await request.post(`/projects/${id}/reject`, body)
      
      const project: Project = {
        id: String(response.data.id),
        title: response.data.title,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        principalInvestigator: response.data.principalInvestigator,
        laboratory: response.data.laboratory || '',
        startDate: response.data.startDate,
        endDate: response.data.endDate,
        progress: response.data.progress || 0,
        teamMembers: response.data.teamMembers || [],
        objectives: response.data.objectives || '',
        resources: response.data.resources || {},
        deliverables: response.data.deliverables || [],
        tags: response.data.tags || [],
        phases: response.data.phases || {
          application: false,
          design: false,
          execution: false,
          archive: false
        },
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
      
      return {
        code: 0,
        data: project,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to reject project:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    await request.delete(`/projects/${id}`)
    return {
      code: 0,
      data: undefined,
      message: 'success'
    }
  }
}

// Reports API
interface ReportStats {
  totalBookings: number
  equipmentAvailability: string
  labUtilization: string
  activeUsers: number
  bookingGrowth: number
  equipmentGrowth: number
  utilizationGrowth: number
  userGrowth: number
}

interface BookingReport {
  lab: string
  total: number
  approved: number
  rejected: number
  utilizationRate: number
  avgDuration: number
}

interface EquipmentReport {
  id: string
  name: string
  lab: string
  usageRate: number
  totalHours: number
  activeDays: number
  maintenanceEvents: number
  status: string
}

interface EnvironmentReport {
  avgTemp: number
  tempRange: string
  avgHumidity: number
  humidityRange: string
  avgAirQuality: number
  violations: number
  recentAlerts: Array<{
    id: string
    message: string
    laboratory: string
    timestamp: string
    severity: string
  }>
}

interface UserReport {
  activeUsers: number
  newUsers: number
  avgSession: number
  activeDepartment: string
  topUsers: Array<{
    id: string
    name: string
    role: string
    sessions: number
    avatarUrl: string
  }>
}

interface ResponsibilityChange {
  id: string
  userName: string
  email: string
  avatarUrl: string
  departmentFrom: string
  departmentTo: string
  roleFrom: string
  roleTo: string
  operator: string
  changedAt: string
}

const reportsApi = {
  getStats: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
    labId?: string
  }): Promise<ApiResponse<ReportStats>> => {
    try {
      const response = await request.get('/reports/stats', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch report stats:', error)
      throw error
    }
  },

  getBookingReport: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
    labId?: string
  }): Promise<ApiResponse<BookingReport[]>> => {
    try {
      const response = await request.get('/reports/bookings', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch booking report:', error)
      throw error
    }
  },

  getEquipmentReport: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
    labId?: string
  }): Promise<ApiResponse<EquipmentReport[]>> => {
    try {
      const response = await request.get('/reports/equipment', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch equipment report:', error)
      throw error
    }
  },

  getEnvironmentReport: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
    labId?: string
  }): Promise<ApiResponse<EnvironmentReport>> => {
    try {
      const response = await request.get('/reports/environment', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch environment report:', error)
      throw error
    }
  },

  getUserReport: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
    labId?: string
  }): Promise<ApiResponse<UserReport>> => {
    try {
      const response = await request.get('/reports/users', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch user report:', error)
      throw error
    }
  },

  getResponsibilityChanges: async (params: {
    dateRange?: string
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<ResponsibilityChange[]>> => {
    try {
      const response = await request.get('/reports/responsibility', { params })
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch responsibility changes:', error)
      throw error
    }
  }
}

// Settings API
const settingsApi = {
  getProfile: async (): Promise<ApiResponse<{
    id: string
    name: string
    email: string
    department: string
    avatarUrl: string
  }>> => {
    try {
      const response = await request.get('/settings/profile')
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      throw error
    }
  },

  updateProfile: async (data: {
    name: string
    email: string
    department: string
    avatarUrl?: string
  }): Promise<ApiResponse<{
    id: string
    name: string
    email: string
    department: string
    avatarUrl: string
  }>> => {
    try {
      const response = await request.put('/settings/profile', data)
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{
    avatarUrl: string
  }>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await request.post('/settings/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      throw error
    }
  },

  changePassword: async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<ApiResponse<void>> => {
    try {
      await request.post('/settings/password', data)
      return {
        code: 0,
        data: undefined,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      throw error
    }
  }
}

const uploadApi = {
  // Generic upload
  upload: async (file: File, type: 'avatar' | 'lab' | 'equipment' | 'project' = 'lab'): Promise<ApiResponse<{
    url: string
    filename: string
    type: string
  }>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await request.post(`/upload?type=${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return {
        code: 0,
        data: response.data,
        message: 'success'
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  },
  
  // Specific upload endpoints
  uploadAvatar: async (file: File) => {
    return uploadApi.upload(file, 'avatar')
  },
  
  uploadLabCover: async (file: File) => {
    return uploadApi.upload(file, 'lab')
  }
}

// Export unified API object
export const api = {
  auth: authApi,
  labs: labsApi,
  bookings: bookingsApi,
  equipment: equipmentApi,
  environment: environmentApi,
  users: usersApi,
  dashboard: dashboardApi,
  projects: projectsApi,
  reports: reportsApi,
  settings: settingsApi,
  upload: uploadApi
}

export { authApi, labsApi, bookingsApi, equipmentApi, environmentApi, usersApi, dashboardApi, projectsApi, reportsApi, settingsApi ,uploadApi}