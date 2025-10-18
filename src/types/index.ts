// Role enums - English only, compatible with backend
export enum UserRole {
  SYSTEM_ADMIN = 'ADMIN',
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN', 
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  VISITOR = 'VISITOR'
}

// Permission type - now flexible to accept any string from backend
export type Permission = string

// Common permission constants for reference (not exhaustive)
export const CommonPermissions = {
  // User Management (ADMIN only)
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  
  // Lab
  LAB_CREATE: 'LAB_CREATE',
  LAB_EDIT: 'LAB_EDIT',
  LAB_DELETE: 'LAB_DELETE',
  LAB_VIEW: 'LAB_VIEW',
  
  // Booking
  BOOKING_CREATE: 'BOOKING_CREATE',
  BOOKING_APPROVE: 'BOOKING_APPROVE',
  BOOKING_VIEW: 'BOOKING_VIEW',
  
  // Equipment
  EQUIPMENT_MANAGE: 'EQUIPMENT_MANAGE',
  EQUIPMENT_VIEW: 'EQUIPMENT_VIEW',
  
  // Environment
  ENVIRONMENT_CONFIG: 'ENVIRONMENT_CONFIG',
  ENVIRONMENT_VIEW: 'ENVIRONMENT_VIEW',
  
  // Project
  PROJECT_VIEW: 'PROJECT_VIEW',
  PROJECT_CREATE: 'PROJECT_CREATE',
  PROJECT_EDIT: 'PROJECT_EDIT',
  PROJECT_APPROVE: 'PROJECT_APPROVE',
  PROJECT_DELETE: 'PROJECT_DELETE',
  
  // Reports
  REPORTS_VIEW: 'REPORTS_VIEW',
  REPORTS_EXPORT: 'REPORTS_EXPORT'
} as const

export interface User {
  id: string
  username: string
  name: string
  email: string
  avatarUrl: string
  roles: string[]
  permissions?: Permission[]
  token?: string
  status: 'active' | 'inactive' | 'pending'
  department?: string
  lastLogin?: string
}

export interface UserStats {
  total: number
  teachers: number
  students: number
}

export interface RegisterRequest {
  username: string
  name: string
  email: string
  password: string
  confirmPassword: string
  role?: UserRole
  department?: string
}

export interface RegisterResponse {
  user: User
  token: string
  requiresApproval?: boolean
}

export interface Lab {
  id: string
  name: string
  coverUrl: string
  location: string
  capacity: number
  tags: string[]
  status: 'available' | 'maintenance' | 'full'
  managers: Array<{
    id: string
    name: string
    avatarUrl: string
    email: string
  }>
  openHours: string
  desc?: string
}

export interface BookingEvent {
  id: string
  labId: string
  title: string
  start: string
  end: string
  requester: {
    id: string
    name: string
    avatarUrl: string
  }
  status: 'pending' | 'approved' | 'rejected'
  participants: number
  note?: string
  bookingType?: 'lab' | 'equipment'
  equipmentId?: string
  equipment?: {
    id: string
    name: string
    code: string
    type: string
  }
}

export interface Equipment {
  id: string
  name: string
  code: string
  type: string
  labId: string
  status: 'available' | 'borrowed' | 'repair'
  holder?: {
    id: string
    name: string
  }
  maintainDue: string
}

export interface EnvPoint {
  ts: string
  temp: number
  hum: number
  pm25: number
  noise: number
}

export interface AccessLog {
  id: string
  userId: string
  labId: string
  ts: string
  action: 'in' | 'out'
  user?: {
    name: string
    avatarUrl: string
  }
  lab?: {
    name: string
  }
}

export interface StatCard {
  title: string
  value: string | number
  trend?: number
  hint?: string
  icon?: string
}

export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export type LocaleType = 'en'

export interface LocaleOption {
  value: LocaleType
  label: string
  flag: string
}

export interface UiState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  locale: LocaleType
  globalLoading: boolean
}

export interface LatestEnvData {
  labId: string
  labName: string
  temperature: number | null
  humidity: number | null
  pm25: number | null
  noise: number | null
  timestamp: string
}

export interface LabEnvData {
  id: string
  name: string
  location: string
  status: 'available' | 'maintenance' | 'full'
  environment: {
    temperature: number | null
    humidity: number | null
    pm25: number | null
    noise: number | null
    power: number | null
    pressure: number | null
  }
  lastUpdated: string
}

export interface EnvAlert {
  id: string
  location: string
  message: string
  metric: string
  value: number
  threshold: number
}

export interface EnvStats {
  totalSensors: number
  activeAlerts: number
  avgTemperature: number
  uptime: number
}

export interface EnvThreshold {
  labId: string | null
  metric: string
  minValue: number | null
  maxValue: number | null
}

export interface Project {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'archived' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  principalInvestigator: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  laboratory?: string
  startDate: string
  endDate: string
  progress: number
  teamMembers: string[]
  objectives?: string
  resources?: {
    equipment?: string[]
    materials?: string[]
    budget?: number
  }
  deliverables?: string[]
  tags?: string[]
  phases: {
    application: boolean
    design: boolean
    execution: boolean
    archive: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface CreateProjectRequest {
  title: string
  description: string
  laboratory?: string
  priority: 'low' | 'medium' | 'high'
  startDate: string
  endDate: string
  teamMembers?: string[]
  objectives?: string
  resources?: {
    equipment?: string[]
    materials?: string[]
    budget?: number
  }
  deliverables?: string[]
  tags?: string[]
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  laboratory?: string
  priority?: 'low' | 'medium' | 'high'
  startDate?: string
  endDate?: string
  progress?: number
  teamMembers?: string[]
  objectives?: string
  resources?: {
    equipment?: string[]
    materials?: string[]
    budget?: number
  }
  deliverables?: string[]
  tags?: string[]
  status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'archived' | 'rejected'
}