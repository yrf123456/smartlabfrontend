import type { User, Lab, BookingEvent, Equipment, EnvPoint, AccessLog, ApiResponse, RegisterRequest, RegisterResponse } from '@/types'
import { UserRole, Permission } from '@/types'
import dayjs from 'dayjs'

// Mock delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock users for different roles - using English roles
const mockUsers: Record<string, User> = {
  'admin@example.com': {
    id: '1',
    name: 'John Smith',
    email: 'admin@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    roles: [UserRole.SYSTEM_ADMIN],
    permissions: [
      Permission.SYSTEM_SETTINGS,
      Permission.USER_MANAGEMENT,
      Permission.ROLE_MANAGEMENT,
      Permission.LAB_CREATE,
      Permission.LAB_EDIT,
      Permission.LAB_DELETE,
      Permission.LAB_VIEW,
      Permission.BOOKING_CREATE,
      Permission.BOOKING_APPROVE,
      Permission.BOOKING_REJECT,
      Permission.BOOKING_VIEW,
      Permission.EQUIPMENT_MANAGE,
      Permission.EQUIPMENT_VIEW,
      Permission.ENVIRONMENT_CONFIG,
      Permission.ENVIRONMENT_VIEW,
      Permission.ACCESS_MANAGE,
      Permission.ACCESS_VIEW,
      Permission.REPORT_VIEW,
      Permission.REPORT_EXPORT
    ],
    status: 'active'
  },
  'dept@example.com': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'dept@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    roles: [UserRole.DEPARTMENT_ADMIN],
    permissions: [
      Permission.LAB_CREATE,
      Permission.LAB_EDIT,
      Permission.LAB_VIEW,
      Permission.BOOKING_APPROVE,
      Permission.BOOKING_VIEW,
      Permission.EQUIPMENT_MANAGE,
      Permission.EQUIPMENT_VIEW,
      Permission.ENVIRONMENT_VIEW,
      Permission.ACCESS_MANAGE,
      Permission.ACCESS_VIEW,
      Permission.REPORT_VIEW
    ],
    status: 'active'
  },
  'teacher@example.com': {
    id: '3',
    name: 'Michael Brown',
    email: 'teacher@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    roles: [UserRole.TEACHER],
    permissions: [
      Permission.LAB_VIEW,
      Permission.BOOKING_CREATE,
      Permission.BOOKING_APPROVE,
      Permission.BOOKING_VIEW,
      Permission.EQUIPMENT_VIEW,
      Permission.ENVIRONMENT_VIEW,
      Permission.ACCESS_VIEW
    ],
    status: 'active'
  },
  'student@example.com': {
    id: '4',
    name: 'Emily Davis',
    email: 'student@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=64&h=64&fit=crop&crop=face',
    roles: [UserRole.STUDENT],
    permissions: [
      Permission.LAB_VIEW,
      Permission.BOOKING_CREATE,
      Permission.BOOKING_VIEW,
      Permission.EQUIPMENT_VIEW,
      Permission.ENVIRONMENT_VIEW
    ],
    status: 'active'
  },
  'visitor@example.com': {
    id: '5',
    name: 'James Wilson',
    email: 'visitor@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    roles: [UserRole.VISITOR],
    permissions: [
      Permission.LAB_VIEW,
      Permission.EQUIPMENT_VIEW,
      Permission.ENVIRONMENT_VIEW
    ],
    status: 'active'
  }
}

// Function to generate default permissions by role
const getDefaultPermissionsByRole = (role: UserRole): Permission[] => {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return [
        Permission.SYSTEM_SETTINGS,
        Permission.USER_MANAGEMENT,
        Permission.ROLE_MANAGEMENT,
        Permission.LAB_CREATE,
        Permission.LAB_EDIT,
        Permission.LAB_DELETE,
        Permission.LAB_VIEW,
        Permission.BOOKING_CREATE,
        Permission.BOOKING_APPROVE,
        Permission.BOOKING_REJECT,
        Permission.BOOKING_VIEW,
        Permission.EQUIPMENT_MANAGE,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_CONFIG,
        Permission.ENVIRONMENT_VIEW,
        Permission.ACCESS_MANAGE,
        Permission.ACCESS_VIEW,
        Permission.REPORT_VIEW,
        Permission.REPORT_EXPORT
      ]
    case UserRole.DEPARTMENT_ADMIN:
      return [
        Permission.LAB_CREATE,
        Permission.LAB_EDIT,
        Permission.LAB_VIEW,
        Permission.BOOKING_APPROVE,
        Permission.BOOKING_VIEW,
        Permission.EQUIPMENT_MANAGE,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW,
        Permission.ACCESS_MANAGE,
        Permission.ACCESS_VIEW,
        Permission.REPORT_VIEW
      ]
    case UserRole.TEACHER:
      return [
        Permission.LAB_VIEW,
        Permission.BOOKING_CREATE,
        Permission.BOOKING_APPROVE,
        Permission.BOOKING_VIEW,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW,
        Permission.ACCESS_VIEW
      ]
    case UserRole.STUDENT:
      return [
        Permission.LAB_VIEW,
        Permission.BOOKING_CREATE,
        Permission.BOOKING_VIEW,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW
      ]
    case UserRole.VISITOR:
      return [
        Permission.LAB_VIEW,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW
      ]
    default:
      return []
  }
}

const mockLabs: Lab[] = [
  {
    id: '1',
    name: 'AI Laboratory',
    coverUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop',
    location: 'Tech Building 3F-301',
    capacity: 30,
    tags: ['AI', 'Machine Learning', 'Deep Learning'],
    status: 'available',
    managers: [{
      id: '1',
      name: 'Prof. Li',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
      email: 'li@example.com'
    }],
    openHours: 'Mon–Fri 08:30–18:00',
    desc: 'Equipped with high-performance GPU servers for deep learning model training and inference.'
  },
  {
    id: '2',
    name: 'IoT Laboratory',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=240&fit=crop',
    location: 'Tech Building 4F-402',
    capacity: 25,
    tags: ['IoT', 'Sensors', 'Embedded'],
    status: 'available',
    managers: [{
      id: '2',
      name: 'Dr. Wang',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b890?w=64&h=64&fit=crop&crop=face',
      email: 'wang@example.com'
    }],
    openHours: 'Mon–Fri 09:00–17:30',
    desc: 'Provides various sensor modules and development boards for IoT system development.'
  },
  {
    id: '3',
    name: 'Cloud Computing Laboratory',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=240&fit=crop',
    location: 'Tech Building 5F-501',
    capacity: 40,
    tags: ['Cloud Computing', 'Docker', 'Kubernetes'],
    status: 'maintenance',
    managers: [{
      id: '3',
      name: 'Prof. Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      email: 'chen@example.com'
    }],
    openHours: 'Mon–Fri 08:00–20:00',
    desc: 'Private cloud environment supporting containerized application deployment and management.'
  }
]

const mockBookings: BookingEvent[] = [
  {
    id: '1',
    labId: '1',
    title: 'Machine Learning Course Lab',
    start: dayjs().add(1, 'day').hour(9).minute(0).second(0).toISOString(),
    end: dayjs().add(1, 'day').hour(11).minute(0).second(0).toISOString(),
    requester: {
      id: '1',
      name: 'John Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    status: 'approved',
    participants: 25,
    note: 'GPU servers required for model training'
  },
  {
    id: '2',
    labId: '2',
    title: 'IoT System Development',
    start: dayjs().add(2, 'day').hour(14).minute(0).second(0).toISOString(),
    end: dayjs().add(2, 'day').hour(16).minute(0).second(0).toISOString(),
    requester: {
      id: '2',
      name: 'Sarah Johnson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
    },
    status: 'pending',
    participants: 20,
    note: 'Arduino development boards and sensor modules needed'
  }
]

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'NVIDIA RTX 4090',
    code: 'GPU-001',
    type: 'GPU',
    labId: '1',
    status: 'available',
    maintainDue: dayjs().add(3, 'month').toISOString()
  },
  {
    id: '2',
    name: 'Arduino Uno R3',
    code: 'ARD-001',
    type: 'Development Board',
    labId: '2',
    status: 'borrowed',
    holder: {
      id: '1',
      name: 'John Smith'
    },
    maintainDue: dayjs().add(6, 'month').toISOString()
  }
]

const generateEnvData = (hours: number = 24): EnvPoint[] => {
  const points: EnvPoint[] = []
  const now = dayjs()
  
  for (let i = hours * 6; i >= 0; i--) {
    points.push({
      ts: now.subtract(i * 10, 'minute').toISOString(),
      temp: 22 + Math.random() * 4,
      hum: 45 + Math.random() * 20,
      pm25: 10 + Math.random() * 15,
      noise: 35 + Math.random() * 10
    })
  }
  
  return points
}

const mockAccessLogs: AccessLog[] = [
  {
    id: '1',
    userId: '1',
    labId: '1',
    ts: dayjs().subtract(1, 'hour').toISOString(),
    action: 'in',
    user: {
      name: 'John Smith',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    lab: {
      name: 'AI Laboratory'
    }
  }
]

export const mockApi = {
  auth: {
    async login(data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
      console.log('🔐 Mock Login - Input:', data)
      
      await delay(800) // 模拟网络延迟
      
      // 检查邮箱是否存在
      const user = mockUsers[data.email]
      if (!user) {
        console.error('❌ Mock Login - User not found:', data.email)
        const error = new Error('User not found')
        ;(error as any).response = {
          data: { message: 'User not found' }
        }
        throw error
      }
      
      // 检查密码
      if (data.password !== '123456') {
        console.error('❌ Mock Login - Wrong password')
        const error = new Error('Invalid password')
        ;(error as any).response = {
          data: { message: 'Invalid password' }
        }
        throw error
      }
      
      // 登录成功
      const token = 'mock-token-' + Date.now()
      console.log('✅ Mock Login - Success:', user.name)
      
      return {
        code: 200,
        data: {
          user,
          token
        },
        message: 'Login successful'
      }
    },
    
    async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
      console.log('📝 Mock Register - Input:', data)
      
      await delay(1000) // 模拟网络延迟
      
      // 检查邮箱是否已存在
      if (mockUsers[data.email]) {
        console.error('❌ Mock Register - Email already exists:', data.email)
        const error = new Error('Email already exists')
        ;(error as any).response = {
          data: { message: 'Email already exists' }
        }
        throw error
      }
      
      // 验证密码确认
      if (data.password !== data.confirmPassword) {
        console.error('❌ Mock Register - Password confirmation mismatch')
        const error = new Error('Password confirmation does not match')
        ;(error as any).response = {
          data: { message: 'Password confirmation does not match' }
        }
        throw error
      }
      
      // 创建新用户
      const newUserId = (Object.keys(mockUsers).length + 1).toString()
      const defaultRole = data.role || UserRole.STUDENT
      const permissions = getDefaultPermissionsByRole(defaultRole)
      
      const newUser: User = {
        id: newUserId,
        name: data.name,
        email: data.email,
        avatarUrl: `https://images.unsplash.com/photo-${Date.now()}?w=64&h=64&fit=crop&crop=face`,
        roles: [defaultRole],
        permissions,
        status: 'active'
      }
      
      // 添加到mock用户列表
      mockUsers[data.email] = newUser
      
      // 生成token
      const token = 'mock-token-' + Date.now()
      
      console.log('✅ Mock Register - Success:', newUser.name)
      
      return {
        code: 200,
        data: {
          user: newUser,
          token,
          requiresApproval: false // 在mock环境中不需要审批
        },
        message: 'Registration successful'
      }
    },
    
    async getProfile(): Promise<ApiResponse<User>> {
      await delay(300)
      
      // 从 localStorage 获取当前用户信息
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        return {
          code: 200,
          data: user,
          message: 'success'
        }
      }
      
      // 默认返回管理员信息
      return {
        code: 200,
        data: mockUsers['admin@example.com'],
        message: 'success'
      }
    },
    
    async logout(): Promise<ApiResponse> {
      await delay(200)
      console.log('👋 Mock Logout')
      return {
        code: 200,
        data: null,
        message: 'Logout successful'
      }
    }
  },
  
  labs: {
    async getList(params?: any): Promise<ApiResponse<Lab[]>> {
      await delay(600)
      let filteredLabs = [...mockLabs]
      
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredLabs = filteredLabs.filter(lab =>
          lab.name.toLowerCase().includes(keyword) ||
          lab.location.toLowerCase().includes(keyword)
        )
      }
      
      if (params?.status) {
        filteredLabs = filteredLabs.filter(lab => lab.status === params.status)
      }
      
      if (params?.tags && params.tags.length > 0) {
        filteredLabs = filteredLabs.filter(lab =>
          params.tags.some((tag: string) => lab.tags.includes(tag))
        )
      }
      
      return {
        code: 200,
        data: filteredLabs,
        message: 'success'
      }
    },
    
    async getById(id: string): Promise<ApiResponse<Lab>> {
      await delay(400)
      const lab = mockLabs.find(l => l.id === id)
      if (!lab) {
        const error = new Error('Lab not found')
        ;(error as any).response = {
          data: { message: 'Lab not found' }
        }
        throw error
      }
      return {
        code: 200,
        data: lab,
        message: 'success'
      }
    },
    
    async create(data: Omit<Lab, 'id'>): Promise<ApiResponse<Lab>> {
      await delay(1000)
      const newLab = {
        ...data,
        id: Date.now().toString()
      }
      mockLabs.push(newLab)
      return {
        code: 200,
        data: newLab,
        message: 'Created successfully'
      }
    },
    
    async update(id: string, data: Partial<Lab>): Promise<ApiResponse<Lab>> {
      await delay(800)
      const index = mockLabs.findIndex(l => l.id === id)
      if (index === -1) {
        const error = new Error('Lab not found')
        ;(error as any).response = {
          data: { message: 'Lab not found' }
        }
        throw error
      }
      const updatedLab = { ...mockLabs[index], ...data }
      mockLabs[index] = updatedLab
      return {
        code: 200,
        data: updatedLab,
        message: 'Updated successfully'
      }
    }
  },
  
  bookings: {
    async getList(params?: any): Promise<ApiResponse<BookingEvent[]>> {
      await delay(500)
      return {
        code: 200,
        data: mockBookings,
        message: 'success'
      }
    },
    
    async create(data: Omit<BookingEvent, 'id'>): Promise<ApiResponse<BookingEvent>> {
      await delay(800)
      const newBooking = {
        ...data,
        id: Date.now().toString()
      }
      mockBookings.push(newBooking)
      return {
        code: 200,
        data: newBooking,
        message: 'Created successfully'
      }
    },
    
    async approve(id: string): Promise<ApiResponse<BookingEvent>> {
      await delay(600)
      const index = mockBookings.findIndex(b => b.id === id)
      if (index === -1) {
        const error = new Error('Booking not found')
        ;(error as any).response = {
          data: { message: 'Booking not found' }
        }
        throw error
      }
      mockBookings[index].status = 'approved'
      return {
        code: 200,
        data: mockBookings[index],
        message: 'Approved successfully'
      }
    },
    
    async reject(id: string, reason?: string): Promise<ApiResponse<BookingEvent>> {
      await delay(600)
      const index = mockBookings.findIndex(b => b.id === id)
      if (index === -1) {
        const error = new Error('Booking not found')
        ;(error as any).response = {
          data: { message: 'Booking not found' }
        }
        throw error
      }
      mockBookings[index].status = 'rejected'
      return {
        code: 200,
        data: mockBookings[index],
        message: 'Rejected successfully'
      }
    },
    
    async checkConflicts(data: any): Promise<ApiResponse<{ hasConflicts: boolean; conflicts: BookingEvent[] }>> {
      await delay(300)
      return {
        code: 200,
        data: {
          hasConflicts: false,
          conflicts: []
        },
        message: 'success'
      }
    }
  },
  
  equipment: {
    async getList(params?: any): Promise<ApiResponse<Equipment[]>> {
      await delay(400)
      let filteredEquipment = [...mockEquipment]
      
      if (params?.labId) {
        filteredEquipment = filteredEquipment.filter(eq => eq.labId === params.labId)
      }
      
      if (params?.status) {
        filteredEquipment = filteredEquipment.filter(eq => eq.status === params.status)
      }
      
      return {
        code: 200,
        data: filteredEquipment,
        message: 'success'
      }
    }
  },
  
  environment: {
    async getSeries(labId: string, params?: any): Promise<ApiResponse<EnvPoint[]>> {
      await delay(600)
      return {
        code: 200,
        data: generateEnvData(24),
        message: 'success'
      }
    },
    
    async getThresholds(): Promise<ApiResponse<any>> {
      await delay(300)
      return {
        code: 200,
        data: {
          temp: { min: 18, max: 26 },
          hum: { min: 40, max: 70 },
          pm25: { max: 25 },
          noise: { max: 45 }
        },
        message: 'success'
      }
    }
  },
  
  access: {
    async getLogs(params?: any): Promise<ApiResponse<AccessLog[]>> {
      await delay(400)
      return {
        code: 200,
        data: mockAccessLogs,
        message: 'success'
      }
    }
  },
  
  upload: {
    async upload(file: File): Promise<ApiResponse<{ url: string }>> {
      await delay(1500) // 模拟上传时间
      // Simulate upload and return a mock URL
      const mockUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=240&fit=crop`
      console.log('📤 Mock Upload:', file.name, '→', mockUrl)
      return {
        code: 200,
        data: { url: mockUrl },
        message: 'Upload successful'
      }
    }
  }
}