import axios from 'axios'
import type { ApiResponse, User, Lab, BookingEvent, Equipment, EnvPoint, AccessLog } from '@/types'
import { mockApi } from './mock'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api'
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
    return response.data
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
export const authApi = {
  login: (data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    if (useMock) return mockApi.auth.login(data)
    return request.post('/auth/login', data)
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

// Labs API
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

// Bookings API
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

// Equipment API
export const equipmentApi = {
  getList: (params?: { labId?: string; status?: string }): Promise<ApiResponse<Equipment[]>> => {
    if (useMock) return mockApi.equipment.getList(params)
    return request.get('/equipment', { params })
  }
}

// Environment API
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

// Access API
export const accessApi = {
  getLogs: (params?: { labId?: string; from?: string; to?: string }): Promise<ApiResponse<AccessLog[]>> => {
    if (useMock) return mockApi.access.getLogs(params)
    return request.get('/access/logs', { params })
  }
}

// Upload API
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
  access: accessApi,
  upload: uploadApi
}