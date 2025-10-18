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
          class="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          @click="openRoleModal"
        >
          <Shield class="w-4 h-4 inline mr-2" />
          Manage Roles
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              @input="loadUsers"
            >
          </div>

          <select
            v-model="selectedRole"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="loadUsers"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">System Admin</option>
            <option value="DEPARTMENT_ADMIN">Department Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="VISITOR">Visitor</option>
          </select>

          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            @change="loadUsers"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Loading users...
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-500">
        {{ error }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 font-medium text-gray-900">User</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Role</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Department</th>
              <th class="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="user in users"
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
                  :class="getRoleClass(user.roles[0])"
                >
                  {{ getRoleText(user.roles[0]) }}
                </span>
              </td>

              <td class="py-3 px-4 text-sm text-gray-900">{{ user.department || 'N/A' }}</td>

              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <button
                    class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    @click="openEditUser(user)"
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

      <div v-if="loadingPermissions" class="text-center py-8 text-gray-500">
        Loading permissions...
      </div>

      <div v-else class="max-h-[70vh] overflow-auto">
        <div class="min-w-full overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-medium text-gray-900">Permission</th>
                <th class="text-center py-3 px-4 font-medium text-gray-900">ADMIN</th>
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
                    v-model="permission.roles.ADMIN"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                    @change="markPermissionDirty"
                  >
                </td>
                <td class="py-3 px-4 text-center">
                  <input
                    v-model="permission.roles.DEPARTMENT_ADMIN"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                    @change="markPermissionDirty"
                  >
                </td>
                <td class="py-3 px-4 text-center">
                  <input
                    v-model="permission.roles.TEACHER"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                    @change="markPermissionDirty"
                  >
                </td>
                <td class="py-3 px-4 text-center">
                  <input
                    v-model="permission.roles.STUDENT"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                    @change="markPermissionDirty"
                  >
                </td>
                <td class="py-3 px-4 text-center">
                  <input
                    v-model="permission.roles.VISITOR"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600"
                    @change="markPermissionDirty"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 -mx-6 px-6 py-4">
          <div class="flex items-center justify-end gap-3">
            <span v-if="permSavedHint==='ok'" class="text-sm text-green-600 font-medium">✓ Saved successfully</span>
            <span v-else-if="permSavedHint==='err'" class="text-sm text-red-600 font-medium">✗ Save failed</span>

            <button
              class="bg-primary-600 text-white px-5 py-2 rounded-lg shadow hover:bg-primary-700
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            v-for="role in computedRoleDetails"
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
                class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full text-center"
              >
                {{ permission }}
              </span>
              <span
                v-if="role.permissions.length === 0"
                class="col-span-full text-xs text-gray-400 italic text-center py-2"
              >
                No permissions assigned
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

    <!-- Edit User Modal -->
    <div
      v-if="showEditUserModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="closeEditUser"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>

        <form @submit.prevent="saveEditUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              readonly
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="editForm.email"
              type="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              readonly
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              v-model="editForm.role"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="ADMIN">System Admin</option>
              <option value="DEPARTMENT_ADMIN">Department Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
              <option value="VISITOR">Visitor</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              v-model="editForm.department"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Engineering">Engineering</option>
              <option value="External">External</option>
            </select>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button
              type="button"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              @click="closeEditUser"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  Users, 
  Shield, 
  Search, 
  GraduationCap, 
  BookOpen
} from 'lucide-vue-next'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import type { User, UserStats } from '@/types'

const authStore = useAuthStore()
// Reactive data
const showRoleModal = ref(false)
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const loading = ref(false)
const loadingPermissions = ref(false)
const error = ref('')
const saving = ref(false)

const userStats = ref<UserStats>({
  total: 0,
  teachers: 0,
  students: 0
})

const users = ref<User[]>([])

// Initialize permissions as empty array - will be loaded from backend
const permissions = ref<Array<{
  id: string
  name: string
  description: string
  roles: Record<string, boolean>
}>>([])

const showEditUserModal = ref(false)
const editForm = ref({
  id: '',
  name: '',
  email: '',
  role: '',
  department: ''
})

const permDirty = ref(false)
const savingPerms = ref(false)
const permSavedHint = ref<'ok'|'err'|''>('')

const roleDetails = ref([
  {
    id: 'ADMIN',
    name: 'System Administrator',
    description: 'Full system access with all permissions. Can manage users, settings, and system configuration.',
    userCount: 0
  },
  {
    id: 'DEPARTMENT_ADMIN',
    name: 'Department Administrator',
    description: 'Department-level management with permissions to manage labs, equipment, and bookings within their department.',
    userCount: 0
  },
  {
    id: 'TEACHER',
    name: 'Teacher',
    description: 'Faculty members who can create bookings, approve student requests, and access teaching resources.',
    userCount: 0
  },
  {
    id: 'STUDENT',
    name: 'Student',
    description: 'Students who can view available labs and create booking requests for laboratory sessions.',
    userCount: 0
  },
  {
    id: 'VISITOR',
    name: 'Visitor',
    description: 'External users with limited read-only access to public laboratory information.',
    userCount: 0
  }
])

// Computed property to dynamically calculate role permissions from the matrix
const computedRoleDetails = computed(() => {
  return roleDetails.value.map(role => {
    const rolePermissions = permissions.value
      .filter(perm => perm.roles[role.id])
      .map(perm => perm.name)
    
    return {
      ...role,
      permissions: rolePermissions
    }
  })
})

// Load permissions from backend
const loadPermissions = async () => {
  loadingPermissions.value = true
  try {
    console.log('Loading permissions from backend...')
    const response = await api.users.getPermissions()
    
    if (response.data && response.data.length > 0) {
      permissions.value = response.data.filter(
        (perm: any) => perm.id !== 'USER_MANAGEMENT'
      )
      console.log('Loaded permissions:', permissions.value)
      permDirty.value = false
    } else {
      console.warn('No permissions returned from backend')
    }
  } catch (err) {
    console.error('Failed to load permissions:', err)
  } finally {
    loadingPermissions.value = false
  }
}

// Methods
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.users.getList({
      keyword: searchQuery.value || undefined,
      role: selectedRole.value || undefined,
      status: selectedStatus.value || undefined
    })
    
    users.value = response.data
  } catch (err: any) {
    error.value = err.message || 'Failed to load users'
    console.error('Load users error:', err)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await api.users.getStats()
    userStats.value = response.data
    
    // Update role details user counts
    roleDetails.value.forEach(role => {
      if (role.id === 'TEACHER') {
        role.userCount = response.data.teachers
      } else if (role.id === 'STUDENT') {
        role.userCount = response.data.students
      }
    })
  } catch (err) {
    console.error('Load stats error:', err)
  }
}

const getRoleClass = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800'
    case 'DEPARTMENT_ADMIN':
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
    case 'ADMIN':
      return 'System Admin'
    case 'DEPARTMENT_ADMIN':
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

const openEditUser = (u: User) => {
  editForm.value = {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.roles[0] || '',
    department: u.department || ''
  }
  showEditUserModal.value = true
}

const closeEditUser = () => {
  showEditUserModal.value = false
}

const saveEditUser = async () => {
  if (saving.value) return
  
  saving.value = true
  try {
    await api.users.update(editForm.value.id, {
      role: editForm.value.role,
      department: editForm.value.department
    })
    
    closeEditUser()
    await loadUsers()
    await loadStats()
  } catch (err: any) {
    alert(err.message || 'Failed to update user')
  } finally {
    saving.value = false
  }
}

const deactivateUser = async (userId: string) => {
  if (!confirm('Are you sure you want to deactivate this user?')) return
  
  try {
    await api.users.updateStatus(userId, 0)
    await loadUsers()
    await loadStats()
  } catch (err: any) {
    alert(err.message || 'Failed to deactivate user')
  }
}

const activateUser = async (userId: string) => {
  try {
    await api.users.updateStatus(userId, 1)
    await loadUsers()
    await loadStats()
  } catch (err: any) {
    alert(err.message || 'Failed to activate user')
  }
}

const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
  
  try {
    await api.users.delete(userId)
    await loadUsers()
    await loadStats()
  } catch (err: any) {
    alert(err.message || 'Failed to delete user')
  }
}

const markPermissionDirty = () => {
  permDirty.value = true
}

const buildPermissionsPayload = () => {
  return permissions.value.map(p => ({
    permissionId: p.id,
    roles: { ...p.roles }
  }))
}

const applyPermissions = async () => {
  if (savingPerms.value || !permDirty.value) return
  
  savingPerms.value = true
  permSavedHint.value = ''

  try {
    const payload = buildPermissionsPayload()
    console.log('💾 Saving permissions to backend...')
    console.log('📦 Payload:', JSON.stringify(payload, null, 2))
    
    // Save permissions to backend
    const saveResponse = await api.users.bulkUpdatePermissions(payload)
    console.log('✅ Backend save response:', saveResponse)
    
    // Wait a moment for backend to process
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Reload permissions from backend to confirm
    console.log('🔄 Reloading permissions from backend...')
    await loadPermissions()
    console.log('✅ Permissions reloaded')
    
    permDirty.value = false
    permSavedHint.value = 'ok'
    
    // CRITICAL: Refresh current user's profile
    console.log('🔄 Refreshing user profile...')
    try {
      await authStore.fetchProfile()
      console.log('✅ User profile refreshed')
      console.log('👤 Current user:', authStore.user?.name)
      console.log('🔐 Current permissions:', authStore.user?.permissions)
      
      // Force UI update
      await authStore.forceUpdate()
      
      // Show success notification
      console.log('🎉 Permissions applied successfully!')
      alert('Permissions updated successfully! Changes are now in effect.')
      
    } catch (profileErr: any) {
      console.error('❌ Failed to refresh profile:', profileErr)
      console.error('Error details:', profileErr.response?.data || profileErr.message)
      alert('Permissions saved, but failed to refresh your session. Please refresh the page or log out and log in again.')
    }
    
  } catch (e: any) {
    console.error('❌ Failed to save permissions:', e)
    console.error('Error response:', e.response?.data)
    console.error('Error message:', e.message)
    
    permSavedHint.value = 'err'
    
    const errorMessage = e.response?.data?.msg || 
                        e.response?.data?.message || 
                        e.message || 
                        'Failed to save permissions'
    
    alert(`Failed to save permissions: ${errorMessage}\n\nPlease check:\n1. You have USER_MANAGEMENT permission\n2. Backend server is running\n3. Database connection is working`)
  } finally {
    savingPerms.value = false
    setTimeout(() => (permSavedHint.value = ''), 5000)
  }
}

const openRoleModal = () => {
  showRoleModal.value = true
}

onMounted(async () => {
  await loadPermissions() // Load permissions first
  await loadStats()
  await loadUsers()
})
</script>