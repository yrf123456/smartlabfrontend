// Role enums - English only
export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN', 
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  VISITOR = 'VISITOR'
}

// Permission enums - English only  
export enum Permission {
  // System management permissions
  SYSTEM_SETTINGS = 'SYSTEM_SETTINGS',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ROLE_MANAGEMENT = 'ROLE_MANAGEMENT',
  
  // Lab management permissions
  LAB_CREATE = 'LAB_CREATE',
  LAB_EDIT = 'LAB_EDIT',
  LAB_DELETE = 'LAB_DELETE',
  LAB_VIEW = 'LAB_VIEW',
  
  // Booking management permissions
  BOOKING_CREATE = 'BOOKING_CREATE',
  BOOKING_APPROVE = 'BOOKING_APPROVE',
  BOOKING_REJECT = 'BOOKING_REJECT',
  BOOKING_VIEW = 'BOOKING_VIEW',
  
  // Equipment management permissions
  EQUIPMENT_MANAGE = 'EQUIPMENT_MANAGE',
  EQUIPMENT_VIEW = 'EQUIPMENT_VIEW',
  
  // Environment monitoring permissions
  ENVIRONMENT_CONFIG = 'ENVIRONMENT_CONFIG',
  ENVIRONMENT_VIEW = 'ENVIRONMENT_VIEW',
  
  // Access control permissions
  ACCESS_MANAGE = 'ACCESS_MANAGE',
  ACCESS_VIEW = 'ACCESS_VIEW',
  
  // Report permissions
  REPORT_VIEW = 'REPORT_VIEW',
  REPORT_EXPORT = 'REPORT_EXPORT'
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  roles: UserRole[]
  permissions: Permission[]
  token?: string
  status: 'active' | 'disabled'
}

// Registration related types
export interface RegisterRequest {
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

// Language related types
export type LocaleType = 'en'

export interface LocaleOption {
  value: LocaleType
  label: string
  flag: string
}

// UI state types
export interface UiState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  locale: LocaleType
  globalLoading: boolean
}