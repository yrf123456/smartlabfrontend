<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ $t('nav.users') }}</h1>
        <p class="text-gray-600 mt-1">Manage users and role permissions</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
          @click="showAddUserModal = true"
        >
          <UserPlus class="w-4 h-4 inline mr-2" />
          Add User
        </button>
        
        <button 
          class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          @click="showRoleModal = true"
        >
          <Shield class="w-4 h-4 inline mr-2" />
          Manage Roles
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ userStats.total }}</p>
          </div>
          <Users class="w-8 h-8 text-primary-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-2xl font-bold text-green-600">{{ userStats.active }}</p>
          </div>
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Teachers</p>
            <p class="text-2xl font-bold text-blue-600">{{ userStats.teachers }}</p>
          </div>
          <GraduationCap class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Students</p>
            <p class="text-2xl font-bold text-purple-600">{{ userStats.students }}</p>
          </div>
          <BookOpen class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-bold text-orange-600">{{ userStats.pending }}</p>
          </div>
          <Clock class="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>

    <!-- User Management -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-900">User Management</h2>
        
        <div class="flex items-center space-x-3">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search users..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
            >
          </div>
          
          <select 
            v-model="selectedRole" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            <option value="SYS_ADMIN">System Admin</option>
            <option value="DEPT_ADMIN">Department Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="VISITOR">Visitor</option>
          </select>
          
          <select 
            v-model="selectedStatus" 
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-900">User</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Role</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Department</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-gray-50"
            >
              <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                  <img 
                    :src="user.avatarUrl" 
                    :alt="user.name"
                    class="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleText(user.role) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ user.department }}</td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(user.status)"
                >
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900">{{ user.lastLogin }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <button 
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    @click="editUser(user.id)"
                  >
                    Edit
                  </button>
                  <button 
                    v-if="user.status === 'active'"
                    class="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    @click="deactivateUser(user.id)"
                  >
                    Deactivate
                  </button>
                  <button 
                    v-else-if="user.status === 'inactive'"
                    class="text-xs text-green-600 hover:text-green-700 font-medium"
                    @click="activateUser(user.id)"
                  >
                    Activate
                  </button>
                  <button 
                    v-if="user.status === 'pending'"
                    class="text-xs text-green-600 hover:text-green-700 font-medium"
                    @click="approveUser(user.id)"
                  >
                    Approve
                  </button>
                  <button 
                    class="text-xs text-red-600 hover:text-red-700 font-medium"
                    @click="deleteUser(user.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

<!-- Role Permissions Matrix -->
<div class="bg-white rounded-xl p-6 border border-gray-200">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-lg font-semibold text-gray-900">Role Permissions</h2>
    <p class="text-sm text-gray-500">Manage permissions for each role</p>
  </div>

  <!-- 关键：给内容一个可垂直滚动的容器，让 sticky 只吸在这个容器底部 -->
  <div class="max-h-[70vh] overflow-auto">
    <!-- 横向仍可滚动，避免表格挤压 -->
    <div class="min-w-full overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-3 px-4 font-medium text-gray-900">Permission</th>
            <th class="text-center py-3 px-4 font-medium text-gray-900">SYS_ADMIN</th>
            <th class="text-center py-3 px-4 font-medium text-gray-900">DEPT_ADMIN</th>
            <th class="text-center py-3 px-4 font-medium text-gray-900">TEACHER</th>
            <th class="text-center py-3 px-4 font-medium text-gray-900">STUDENT</th>
            <th class="text-center py-3 px-4 font-medium text-gray-900">VISITOR</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="permission in permissions"
            :key="permission.id"
            class="hover:bg-gray-50"
          >
            <td class="py-3 px-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ permission.name }}</p>
                <p class="text-xs text-gray-500">{{ permission.description }}</p>
              </div>
            </td>
            <td class="py-3 px-4 text-center">
              <input
                v-model="permission.roles.SYS_ADMIN"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600"
                @change="updatePermission(permission.id, 'SYS_ADMIN', $event.target.checked)"
              >
            </td>
            <td class="py-3 px-4 text-center">
              <input
                v-model="permission.roles.DEPT_ADMIN"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600"
                @change="updatePermission(permission.id, 'DEPT_ADMIN', $event.target.checked)"
              >
            </td>
            <td class="py-3 px-4 text-center">
              <input
                v-model="permission.roles.TEACHER"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600"
                @change="updatePermission(permission.id, 'TEACHER', $event.target.checked)"
              >
            </td>
            <td class="py-3 px-4 text-center">
              <input
                v-model="permission.roles.STUDENT"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600"
                @change="updatePermission(permission.id, 'STUDENT', $event.target.checked)"
              >
            </td>
            <td class="py-3 px-4 text-center">
              <input
                v-model="permission.roles.VISITOR"
                type="checkbox"
                class="rounded border-gray-300 text-primary-600"
                @change="updatePermission(permission.id, 'VISITOR', $event.target.checked)"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 吸附在“滚动容器”底部的操作栏（仅在卡片区域内可见） -->
    <div class="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 -mx-6 px-6 py-4">
      <div class="flex items-center justify-end gap-3">
        <span v-if="permSavedHint==='ok'" class="text-sm text-green-600">Saved</span>
        <span v-else-if="permSavedHint==='err'" class="text-sm text-red-600">Save failed</span>

        <button
          class="bg-primary-600 text-white px-5 py-2 rounded-lg shadow hover:bg-primary-700
                 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="savingPerms || !permDirty"
          @click="applyPermissions"
        >
          <span v-if="!savingPerms">APPLY</span>
          <span v-else>Saving...</span>
        </button>
      </div>
    </div>
  </div>
</div>


    <!-- Add User Modal -->
    <div 
      v-if="showAddUserModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showAddUserModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add New User</h3>
        
        <form @submit.prevent="addUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              v-model="userForm.name"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter full name"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              v-model="userForm.email"
              type="email" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter email address"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              v-model="userForm.role"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Role</option>
              <option value="SYS_ADMIN">System Admin</option>
              <option value="DEPT_ADMIN">Department Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="VISITOR">Visitor</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              v-model="userForm.department"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
          
          <div class="flex items-center space-x-3 pt-4">
            <button 
              type="submit"
              class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Add User
            </button>
            <button 
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="showAddUserModal = false"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Role Management Modal -->
    <div 
      v-if="showRoleModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showRoleModal = false"
    >
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
        
        <div class="space-y-6">
          <div
            v-for="role in roleDetails"
            :key="role.id"
            class="border border-gray-200 rounded-xl p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-base font-medium text-gray-900">{{ role.name }}</h4>
              <span class="text-sm text-gray-500">{{ role.userCount }} users</span>
            </div>
            
            <p class="text-sm text-gray-600 mb-3">{{ role.description }}</p>
            
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
              <span
                v-for="permission in role.permissions"
                :key="permission"
                class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mt-6">
          <button 
            class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            @click="showRoleModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  CheckCircle, 
  GraduationCap, 
  BookOpen, 
  Clock
} from 'lucide-vue-next'

// Reactive data
const showAddUserModal = ref(false)
const showRoleModal = ref(false)
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

const userForm = ref({
  name: '',
  email: '',
  role: '',
  department: ''
})

const userStats = ref({
  total: 156,
  active: 142,
  teachers: 28,
  students: 118,
  pending: 6
})

const users = ref([
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@university.edu',
    role: 'SYS_ADMIN',
    department: 'Computer Science',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b900?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 09:15'
  },
  {
    id: '2',
    name: 'Prof. Michael Johnson',
    email: 'michael.johnson@university.edu',
    role: 'DEPT_ADMIN',
    department: 'Information Technology',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 08:30'
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    email: 'emily.chen@university.edu',
    role: 'TEACHER',
    department: 'Data Science',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 10:45'
  },
  {
    id: '4',
    name: 'John Smith',
    email: 'john.smith@student.university.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 11:20'
  },
  {
    id: '5',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@student.university.edu',
    role: 'STUDENT',
    department: 'Information Technology',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 09:50'
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david.kim@student.university.edu',
    role: 'STUDENT',
    department: 'Cybersecurity',
    status: 'pending',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
    lastLogin: 'Never'
  },
  {
    id: '7',
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@university.edu',
    role: 'TEACHER',
    department: 'Engineering',
    status: 'inactive',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-15 16:30'
  },
  {
    id: '8',
    name: 'Guest User',
    email: 'guest@visitor.com',
    role: 'VISITOR',
    department: 'External',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face',
    lastLogin: '2025-09-21 14:15'
  }
])

const permissions = ref([
  {
    id: 'lab_view',
    name: 'View Laboratories',
    description: 'Access to view laboratory information',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: true,
      STUDENT: true,
      VISITOR: true
    }
  },
  {
    id: 'lab_manage',
    name: 'Manage Laboratories',
    description: 'Create, edit, and delete laboratories',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: false,
      STUDENT: false,
      VISITOR: false
    }
  },
  {
    id: 'booking_create',
    name: 'Create Bookings',
    description: 'Create laboratory booking requests',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: true,
      STUDENT: true,
      VISITOR: false
    }
  },
  {
    id: 'booking_approve',
    name: 'Approve Bookings',
    description: 'Approve or reject booking requests',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: true,
      STUDENT: false,
      VISITOR: false
    }
  },
  {
    id: 'equipment_manage',
    name: 'Manage Equipment',
    description: 'Add, edit, and assign laboratory equipment',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: false,
      STUDENT: false,
      VISITOR: false
    }
  },
  {
    id: 'access_control',
    name: 'Access Control',
    description: 'Manage door access and permissions',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: true,
      TEACHER: false,
      STUDENT: false,
      VISITOR: false
    }
  },
  {
    id: 'user_manage',
    name: 'User Management',
    description: 'Add, edit, and manage user accounts',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: false,
      TEACHER: false,
      STUDENT: false,
      VISITOR: false
    }
  },
  {
    id: 'system_settings',
    name: 'System Settings',
    description: 'Configure system-wide settings',
    roles: {
      SYS_ADMIN: true,
      DEPT_ADMIN: false,
      TEACHER: false,
      STUDENT: false,
      VISITOR: false
    }
  }
])

const roleDetails = ref([
  {
    id: 'SYS_ADMIN',
    name: 'System Administrator',
    description: 'Full system access with all permissions. Can manage users, settings, and system configuration.',
    userCount: 3,
    permissions: ['View Labs', 'Manage Labs', 'Create Bookings', 'Approve Bookings', 'Manage Equipment', 'Access Control', 'User Management', 'System Settings']
  },
  {
    id: 'DEPT_ADMIN',
    name: 'Department Administrator',
    description: 'Department-level management with permissions to manage labs, equipment, and bookings within their department.',
    userCount: 8,
    permissions: ['View Labs', 'Manage Labs', 'Create Bookings', 'Approve Bookings', 'Manage Equipment', 'Access Control']
  },
  {
    id: 'TEACHER',
    name: 'Teacher',
    description: 'Faculty members who can create bookings, approve student requests, and access teaching resources.',
    userCount: 28,
    permissions: ['View Labs', 'Create Bookings', 'Approve Bookings']
  },
  {
    id: 'STUDENT',
    name: 'Student',
    description: 'Students who can view available labs and create booking requests for laboratory sessions.',
    userCount: 118,
    permissions: ['View Labs', 'Create Bookings']
  },
  {
    id: 'VISITOR',
    name: 'Visitor',
    description: 'External users with limited read-only access to public laboratory information.',
    userCount: 2,
    permissions: ['View Labs']
  }
])

// Computed properties
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = !searchQuery.value || 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesRole = !selectedRole.value || user.role === selectedRole.value
    const matchesStatus = !selectedStatus.value || user.status === selectedStatus.value
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

// Methods
const getRoleClass = (role: string) => {
  switch (role) {
    case 'SYS_ADMIN':
      return 'bg-red-100 text-red-800'
    case 'DEPT_ADMIN':
      return 'bg-orange-100 text-orange-800'
    case 'TEACHER':
      return 'bg-blue-100 text-blue-800'
    case 'STUDENT':
      return 'bg-green-100 text-green-800'
    case 'VISITOR':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'SYS_ADMIN':
      return 'System Admin'
    case 'DEPT_ADMIN':
      return 'Dept Admin'
    case 'TEACHER':
      return 'Teacher'
    case 'STUDENT':
      return 'Student'
    case 'VISITOR':
      return 'Visitor'
    default:
      return role
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'inactive':
      return 'bg-gray-100 text-gray-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'inactive':
      return 'Inactive'
    case 'pending':
      return 'Pending'
    default:
      return status
  }
}

const editUser = (userId: string) => {
  console.log('Edit user:', userId)
}

const deactivateUser = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.status = 'inactive'
    userStats.value.active--
  }
}

const activateUser = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.status = 'active'
    userStats.value.active++
  }
}

const approveUser = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    user.status = 'active'
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ')
    userStats.value.active++
    userStats.value.pending--
  }
}

const deleteUser = (userId: string) => {
  const index = users.value.findIndex(u => u.id === userId)
  if (index !== -1) {
    const user = users.value[index]
    users.value.splice(index, 1)
    userStats.value.total--
    
    if (user.status === 'active') {
      userStats.value.active--
    } else if (user.status === 'pending') {
      userStats.value.pending--
    }
    
    if (user.role === 'TEACHER') {
      userStats.value.teachers--
    } else if (user.role === 'STUDENT') {
      userStats.value.students--
    }
  }
}

const addUser = () => {
  const newUser = {
    id: Date.now().toString(),
    name: userForm.value.name,
    email: userForm.value.email,
    role: userForm.value.role,
    department: userForm.value.department,
    status: 'pending',
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop&crop=face`,
    lastLogin: 'Never'
  }
  
  users.value.unshift(newUser)
  userStats.value.total++
  userStats.value.pending++
  
  if (newUser.role === 'TEACHER') {
    userStats.value.teachers++
  } else if (newUser.role === 'STUDENT') {
    userStats.value.students++
  }
  
  // Reset form
  userForm.value = {
    name: '',
    email: '',
    role: '',
    department: ''
  }
  
  showAddUserModal.value = false
}

const updatePermission = (permissionId: string, role: string, hasPermission: boolean) => {
  const permission = permissions.value.find(p => p.id === permissionId)
  if (permission) {
    permission.roles[role] = hasPermission
    permDirty.value = true 
    console.log(`Updated ${permissionId} for ${role}: ${hasPermission}`)
  }
}

// === Apply 按钮相关状态 ===
const permDirty = ref(false)         // 是否有未保存更改
const savingPerms = ref(false)       // 是否在保存
const permSavedHint = ref<'ok'|'err'|''>('')  // 右下角小提示

// 构造要提交的 payload（两种后端风格，二选一即可）
const buildPermissionsPayload = () => {
  // 方案A：数组，每项一个权限 + 各角色布尔
  const listA = permissions.value.map(p => ({
    permissionId: p.id,
    roles: { ...p.roles } // { SYS_ADMIN: true, ... }
  }))

  // 方案B：把勾选过的角色拍扁成数组（如果你后端喜欢这样）
  const listB = permissions.value.map(p => ({
    permissionId: p.id,
    roles: Object.entries(p.roles)
      .filter(([_, v]) => v)
      .map(([k]) => k) // ['SYS_ADMIN','DEPT_ADMIN',...]
  }))

  // 返回你们后端喜欢的那种结构
  return listA
}

const applyPermissions = async () => {
  if (savingPerms.value || !permDirty.value) return
  savingPerms.value = true
  permSavedHint.value = ''

  try {
    // 1) 如果后端暂时没有，先本地“假保存”
    // await new Promise(r => setTimeout(r, 600))

    // 2) 有后端的话，用 fetch 直发（避免额外依赖）
    const apiBase = import.meta.env.VITE_API_BASE || '/api'
    const res = await fetch(`${apiBase}/admin/permissions/bulk`, {
      method: 'PUT', // 或 POST，看你后端定义
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPermissionsPayload())
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // const data = await res.json() // 需要的话解析

    permDirty.value = false
    permSavedHint.value = 'ok'
  } catch (e) {
  //  console.error('Save permissions failed:', e)
    permSavedHint.value = 'err'
  } finally {
    savingPerms.value = false
    setTimeout(() => (permSavedHint.value = ''), 2000)
  }
}


onMounted(() => {
  // Load user data
})
</script>