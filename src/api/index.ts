import axios from 'axios'
import type { ApiResponse, User, Lab, BookingEvent, Equipment, EnvPoint, RegisterRequest, RegisterResponse } from '@/types'
import { mockApi } from './mock'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

console.log('🔧 API Configuration:', { baseURL, useMock })

const request = axios.create({
  baseURL,
  timeout: 10000
})

interface CustomError extends Error {
  response?: {
    data?: {
      message?: string
    }
  }
}

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

request.interceptors.response.use(
  (response) => {
    const data = response.data
    
    if (data && typeof data.code !== 'undefined') {
      if (data.code === 0) {
        return {
          code: 0,
          data: data.data,
          message: data.msg || 'Success'
        }
      } else {
        const error = new Error(data.msg || 'Request failed') as CustomError
        error.response = { data: { message: data.msg } }
        throw error
      }
    }
    
    return data
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

export const authApi = {
  login: (data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    if (useMock) return mockApi.auth.login(data)
    return request.post('/auth/login', data)
  },
  
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    if (useMock) return mockApi.auth.register(data)
    return request.post('/auth/register', data)
  },
  
  getProfile: (): Promise<ApiResponse<User>> => {
    if (useMock) return mockApi.auth.getProfile()
    return request.get('/auth/me')
  },
  
  logout: (): Promise<ApiResponse> => {
    if (useMock) return mockApi.auth.logout()
    return request.post('/auth/logout')
  }
}

export const labsApi = {
  getList: (params?: { keyword?: string; tags?: string[]; status?: string }): Promise<ApiResponse<Lab[]>> => {
    if (useMock) return mockApi.labs.getList(params)
    return request.get('/labs', { params })
  },
  
  getById: (id: string): Promise<ApiResponse<Lab>> => {
    if (useMock) return mockApi.labs.getById(id)
    return request.get(`/labs/${id}`)
  },
  
  create: (data: Omit<Lab, 'id'>): Promise<ApiResponse<Lab>> => {
    if (useMock) return mockApi.labs.create(data)
    return request.post('/labs', data)
  },
  
  update: (id: string, data: Partial<Lab>): Promise<ApiResponse<Lab>> => {
    if (useMock) return mockApi.labs.update(id, data)
    return request.put(`/labs/${id}`, data)
  }
}

export const bookingsApi = {
  getList: (params?: { from?: string; to?: string; labId?: string }): Promise<ApiResponse<BookingEvent[]>> => {
    if (useMock) return mockApi.bookings.getList(params)
    return request.get('/bookings', { params })
  },
  
  create: (data: Omit<BookingEvent, 'id'>): Promise<ApiResponse<BookingEvent>> => {
    if (useMock) return mockApi.bookings.create(data)
    return request.post('/bookings', data)
  },
  
  approve: (id: string): Promise<ApiResponse<BookingEvent>> => {
    if (useMock) return mockApi.bookings.approve(id)
    return request.put(`/bookings/${id}/approve`)
  },
  
  reject: (id: string, reason?: string): Promise<ApiResponse<BookingEvent>> => {
    if (useMock) return mockApi.bookings.reject(id, reason)
    return request.put(`/bookings/${id}/reject`, { reason })
  },
  
  checkConflicts: (data: { labId: string; start: string; end: string; excludeId?: string }): Promise<ApiResponse<{ hasConflicts: boolean; conflicts: BookingEvent[] }>> => {
    if (useMock) return mockApi.bookings.checkConflicts(data)
    return request.post('/bookings/check-conflicts', data)
  }
}

export const equipmentApi = {
  getList: (params?: { labId?: string; status?: string }): Promise<ApiResponse<Equipment[]>> => {
    if (useMock) return mockApi.equipment.getList(params)
    return request.get('/equipment', { params })
  }
}

export const environmentApi = {
  getSeries: (labId: string, params?: { from?: string; to?: string }): Promise<ApiResponse<EnvPoint[]>> => {
    if (useMock) return mockApi.environment.getSeries(labId, params)
    return request.get(`/env/${labId}/series`, { params })
  },
  
  getThresholds: (): Promise<ApiResponse<any>> => {
    if (useMock) return mockApi.environment.getThresholds()
    return request.get('/env/thresholds')
  }
}

export const projectsApi = {
  getList: (params?: any): Promise<ApiResponse<any[]>> => {
    console.log('📡 ProjectsApi: getList called with params:', params)
    if (useMock) {
      console.log('📡 Using mock API for projects.getList')
      return mockApi.projects.getList(params)
    }
    return request.get('/projects', { params })
  },
  
  getById: (id: string): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: getById called with id:', id)
    if (useMock) return mockApi.projects.getById(id)
    return request.get(`/projects/${id}`)
  },
  
  create: (data: any): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: create called with data:', data)
    if (useMock) return mockApi.projects.create(data)
    return request.post('/projects', data)
  },
  
  update: (id: string, data: any): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: update called with id:', id, 'data:', data)
    if (useMock) return mockApi.projects.update(id, data)
    return request.put(`/projects/${id}`, data)
  },
  
  approve: (id: string, data: any): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: approve called with id:', id, 'data:', data)
    if (useMock) return mockApi.projects.approve(id, data)
    return request.put(`/projects/${id}/approve`, data)
  },
  
  reject: (id: string, data: any): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: reject called with id:', id, 'data:', data)
    if (useMock) return mockApi.projects.reject(id, data)
    return request.put(`/projects/${id}/reject`, data)
  },
  
  delete: (id: string): Promise<ApiResponse> => {
    console.log('📡 ProjectsApi: delete called with id:', id)
    if (useMock) return mockApi.projects.delete(id)
    return request.delete(`/projects/${id}`)
  },
  
  updateProgress: (id: string, progress: number, notes?: string): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: updateProgress called with id:', id, 'progress:', progress)
    if (useMock) return mockApi.projects.updateProgress(id, progress, notes)
    return request.put(`/projects/${id}/progress`, { progress, notes })
  },
  
  getStats: (): Promise<ApiResponse<any>> => {
    console.log('📡 ProjectsApi: getStats called')
    if (useMock) return mockApi.projects.getStats()
    return request.get('/projects/stats')
  }
}

export const uploadApi = {
  upload: (file: File): Promise<ApiResponse<{ url: string }>> => {
    if (useMock) return mockApi.upload.upload(file)
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export const api = {
  auth: authApi,
  labs: labsApi,
  bookings: bookingsApi,
  equipment: equipmentApi,
  environment: environmentApi,
  projects: projectsApi,
  upload: uploadApi
}

// 添加调试信息
console.log('🔧 API exports:', Object.keys(api))
console.log('🔧 Projects API methods:', Object.keys(api.projects))