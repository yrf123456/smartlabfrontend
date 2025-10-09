import axios from 'axios'
import type { ApiResponse, User, Lab, BookingEvent, Equipment, EnvPoint } from '@/types'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

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
  }
}

// Bookings API
const bookingsApi = {
  getList: (params?: { from?: string; to?: string; labId?: string }): Promise<ApiResponse<BookingEvent[]>> => {
    return request.get('/bookings', { params })
  },
  
  create: (data: {
    labId: number
    title: string
    start: string
    end: string
    requesterId: number
    participants: number
    note?: string
  }): Promise<ApiResponse<BookingEvent>> => {
    return request.post('/bookings', data)
  },
  
  approve: (id: string): Promise<ApiResponse<BookingEvent>> => {
    return request.put(`/bookings/${id}/approve`)
  },
  
  reject: (id: string): Promise<ApiResponse<BookingEvent>> => {
    return request.put(`/bookings/${id}/reject`)
  }
}

// Equipment API
const equipmentApi = {
  getList: (params?: { labId?: string; status?: string }): Promise<ApiResponse<Equipment[]>> => {
    return request.get('/equipment', { params })
  }
}

// Environment API
const environmentApi = {
  getSeries: (labId: string, params?: { from?: string; to?: string }): Promise<ApiResponse<EnvPoint[]>> => {
    return request.get(`/env/${labId}/series`, { params })
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
  getList: (params?: { keyword?: string }): Promise<ApiResponse<User[]>> => {
    return request.get('/users', { params })
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

// Export unified API object
export const api = {
  auth: authApi,
  labs: labsApi,
  bookings: bookingsApi,
  equipment: equipmentApi,
  environment: environmentApi,
  users: usersApi,
  dashboard: dashboardApi
}

// Also export individual APIs for backward compatibility
export { authApi, labsApi, bookingsApi, equipmentApi, environmentApi, usersApi, dashboardApi }