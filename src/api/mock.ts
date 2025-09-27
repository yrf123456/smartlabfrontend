import type { User, Lab, BookingEvent, Equipment, EnvPoint, ApiResponse, RegisterRequest, RegisterResponse, Project, ProjectFilters, CreateProjectRequest, UpdateProjectRequest, ProjectApprovalRequest } from '@/types'
import { UserRole, Permission } from '@/types'
import dayjs from 'dayjs'

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

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
      Permission.PROJECT_CREATE,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_DELETE,
      Permission.PROJECT_APPROVE,
      Permission.PROJECT_VIEW,
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
      Permission.PROJECT_CREATE,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_APPROVE,
      Permission.PROJECT_VIEW,
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
      Permission.PROJECT_CREATE,
      Permission.PROJECT_EDIT,
      Permission.PROJECT_VIEW
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
      Permission.ENVIRONMENT_VIEW,
      Permission.PROJECT_CREATE,
      Permission.PROJECT_VIEW
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
      Permission.ENVIRONMENT_VIEW,
      Permission.PROJECT_VIEW
    ],
    status: 'active'
  }
}

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
        Permission.PROJECT_CREATE,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_DELETE,
        Permission.PROJECT_APPROVE,
        Permission.PROJECT_VIEW,
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
        Permission.PROJECT_CREATE,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_APPROVE,
        Permission.PROJECT_VIEW,
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
        Permission.PROJECT_CREATE,
        Permission.PROJECT_EDIT,
        Permission.PROJECT_VIEW
      ]
    case UserRole.STUDENT:
      return [
        Permission.LAB_VIEW,
        Permission.BOOKING_CREATE,
        Permission.BOOKING_VIEW,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_VIEW
      ]
    case UserRole.VISITOR:
      return [
        Permission.LAB_VIEW,
        Permission.EQUIPMENT_VIEW,
        Permission.ENVIRONMENT_VIEW,
        Permission.PROJECT_VIEW
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

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Machine Learning in Medical Diagnosis',
    description: 'Developing an AI system for automated medical image analysis and diagnosis using deep learning techniques.',
    status: 'in_progress',
    priority: 'high',
    principalInvestigator: {
      id: '1',
      name: 'Dr. Sarah Wilson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
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
    resources: {
      equipment: ['GPU Servers', 'Medical Image Database'],
      materials: ['Medical Images', 'Labeling Tools'],
      budget: 50000
    },
    deliverables: ['AI Model', 'Technical Report', 'Research Paper'],
    tags: ['AI', 'Medical', 'Deep Learning'],
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
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
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
    resources: {
      equipment: ['Sensor Modules', 'Gateway Devices'],
      materials: ['IoT Components', 'Development Boards'],
      budget: 25000
    },
    deliverables: ['IoT System', 'Mobile App', 'Installation Guide'],
    tags: ['IoT', 'Environment', 'Smart Building'],
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
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
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
    resources: {
      equipment: ['Security Testing Tools', 'Blockchain Nodes'],
      materials: ['Crypto Libraries', 'Testing Framework'],
      budget: 75000
    },
    deliverables: ['Security Framework', 'Implementation Code', 'Security Analysis Report'],
    tags: ['Blockchain', 'Security', 'Cryptography'],
    createdAt: '2024-07-20',
    updatedAt: '2025-02-01',
    approvedAt: '2024-08-01',
    approvedBy: {
      id: '1',
      name: 'John Smith'
    }
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

export const mockApi = {
  auth: {
    async login(data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
      console.log('🔐 Mock Login - Input:', data)
      
      await delay(800)
      
      const user = mockUsers[data.email]
      if (!user) {
        console.error('⛔ Mock Login - User not found:', data.email)
        const error = new Error('User not found')
        ;(error as any).response = {
          data: { message: 'User not found' }
        }
        throw error
      }
      
      if (data.password !== '123456') {
        console.error('⛔ Mock Login - Wrong password')
        const error = new Error('Invalid password')
        ;(error as any).response = {
          data: { message: 'Invalid password' }
        }
        throw error
      }
      
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
      
      await delay(1000)
      
      if (mockUsers[data.email]) {
        console.error('⛔ Mock Register - Email already exists:', data.email)
        const error = new Error('Email already exists')
        ;(error as any).response = {
          data: { message: 'Email already exists' }
        }
        throw error
      }
      
      if (data.password !== data.confirmPassword) {
        console.error('⛔ Mock Register - Password confirmation mismatch')
        const error = new Error('Password confirmation does not match')
        ;(error as any).response = {
          data: { message: 'Password confirmation does not match' }
        }
        throw error
      }
      
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
      
      mockUsers[data.email] = newUser
      
      const token = 'mock-token-' + Date.now()
      
      console.log('✅ Mock Register - Success:', newUser.name)
      
      return {
        code: 200,
        data: {
          user: newUser,
          token,
          requiresApproval: false
        },
        message: 'Registration successful'
      }
    },
    
    async getProfile(): Promise<ApiResponse<User>> {
      await delay(300)
      
      const userInfo = localStorage.getItem('user_info')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        return {
          code: 200,
          data: user,
          message: 'success'
        }
      }
      
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
  
  projects: {
    async getList(params?: ProjectFilters): Promise<ApiResponse<Project[]>> {
      await delay(600)
      let filteredProjects = [...mockProjects]
      
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase()
        filteredProjects = filteredProjects.filter(project =>
          project.title.toLowerCase().includes(keyword) ||
          project.description.toLowerCase().includes(keyword) ||
          project.principalInvestigator.name.toLowerCase().includes(keyword)
        )
      }
      
      if (params?.status) {
        filteredProjects = filteredProjects.filter(project => project.status === params.status)
      }
      
      if (params?.priority) {
        filteredProjects = filteredProjects.filter(project => project.priority === params.priority)
      }
      
      if (params?.laboratory) {
        filteredProjects = filteredProjects.filter(project =>
          project.laboratory?.toLowerCase().includes(params.laboratory.toLowerCase())
        )
      }
      
      if (params?.principalInvestigator) {
        filteredProjects = filteredProjects.filter(project =>
          project.principalInvestigator.name.toLowerCase().includes(params.principalInvestigator.toLowerCase())
        )
      }
      
      return {
        code: 200,
        data: filteredProjects,
        message: 'success'
      }
    },
    
    async getById(id: string): Promise<ApiResponse<Project>> {
      await delay(400)
      const project = mockProjects.find(p => p.id === id)
      if (!project) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      return {
        code: 200,
        data: project,
        message: 'success'
      }
    },
    
    async create(data: CreateProjectRequest): Promise<ApiResponse<Project>> {
      await delay(1000)
      const newProject: Project = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        status: 'pending',
        priority: data.priority,
        principalInvestigator: mockUsers['teacher@example.com'] as any,
        teamMembers: data.teamMembers,
        laboratory: data.laboratory,
        startDate: data.startDate,
        endDate: data.endDate,
        progress: 0,
        phases: {
          application: true,
          design: false,
          execution: false,
          archive: false
        },
        objectives: data.objectives,
        resources: data.resources,
        deliverables: data.deliverables,
        tags: data.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockProjects.unshift(newProject)
      return {
        code: 200,
        data: newProject,
        message: 'Project created successfully'
      }
    },
    
    async update(id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> {
      await delay(800)
      const index = mockProjects.findIndex(p => p.id === id)
      if (index === -1) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      const updatedProject = { 
        ...mockProjects[index], 
        ...data,
        updatedAt: new Date().toISOString()
      }
      mockProjects[index] = updatedProject
      return {
        code: 200,
        data: updatedProject,
        message: 'Project updated successfully'
      }
    },
    
    async approve(id: string, data: ProjectApprovalRequest): Promise<ApiResponse<Project>> {
      await delay(600)
      const index = mockProjects.findIndex(p => p.id === id)
      if (index === -1) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      
      const updatedProject = { 
        ...mockProjects[index],
        status: 'approved' as const,
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        approvedBy: {
          id: '1',
          name: 'John Smith'
        }
      }
      mockProjects[index] = updatedProject
      return {
        code: 200,
        data: updatedProject,
        message: 'Project approved successfully'
      }
    },
    
    async reject(id: string, data: ProjectApprovalRequest): Promise<ApiResponse<Project>> {
      await delay(600)
      const index = mockProjects.findIndex(p => p.id === id)
      if (index === -1) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      
      const updatedProject = { 
        ...mockProjects[index],
        status: 'rejected' as const,
        updatedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
        rejectedBy: {
          id: '1',
          name: 'John Smith'
        },
        rejectionReason: data.comments
      }
      mockProjects[index] = updatedProject
      return {
        code: 200,
        data: updatedProject,
        message: 'Project rejected successfully'
      }
    },
    
    async delete(id: string): Promise<ApiResponse> {
      await delay(500)
      const index = mockProjects.findIndex(p => p.id === id)
      if (index === -1) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      
      mockProjects.splice(index, 1)
      return {
        code: 200,
        data: null,
        message: 'Project deleted successfully'
      }
    },
    
    async updateProgress(id: string, progress: number, notes?: string): Promise<ApiResponse<Project>> {
      await delay(500)
      const index = mockProjects.findIndex(p => p.id === id)
      if (index === -1) {
        const error = new Error('Project not found')
        ;(error as any).response = {
          data: { message: 'Project not found' }
        }
        throw error
      }
      
      const updatedProject = { 
        ...mockProjects[index],
        progress,
        updatedAt: new Date().toISOString()
      }
      
      // Auto-update phases based on progress
      if (progress >= 25 && !updatedProject.phases.design) {
        updatedProject.phases.design = true
      }
      if (progress >= 50 && !updatedProject.phases.execution) {
        updatedProject.phases.execution = true
      }
      if (progress >= 100 && !updatedProject.phases.archive) {
        updatedProject.phases.archive = true
        updatedProject.status = 'completed'
      }
      
      mockProjects[index] = updatedProject
      return {
        code: 200,
        data: updatedProject,
        message: 'Project progress updated successfully'
      }
    },
    
    async getStats(): Promise<ApiResponse<{
      total: number
      pending: number
      approved: number
      inProgress: number
      completed: number
      archived: number
      rejected: number
    }>> {
      await delay(300)
      return {
        code: 200,
        data: {
          total: mockProjects.length,
          pending: mockProjects.filter(p => p.status === 'pending').length,
          approved: mockProjects.filter(p => p.status === 'approved').length,
          inProgress: mockProjects.filter(p => p.status === 'in_progress').length,
          completed: mockProjects.filter(p => p.status === 'completed').length,
          archived: mockProjects.filter(p => p.status === 'archived').length,
          rejected: mockProjects.filter(p => p.status === 'rejected').length
        },
        message: 'success'
      }
    }
  },
  
  upload: {
    async upload(file: File): Promise<ApiResponse<{ url: string }>> {
      await delay(1500)
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