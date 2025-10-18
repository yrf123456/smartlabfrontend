<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 mt-1">Manage your personal information and security</p>
    </div>

    <!-- Profile Settings -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>
      
      <div class="flex items-start space-x-6">
        <div class="flex-shrink-0">
          <div class="relative group">
            <img 
              :src="profileSettings.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileSettings.name)" 
              alt="Profile"
              class="w-20 h-20 rounded-full object-cover border-4 border-gray-100 cursor-pointer"
              @error="handleImageError"
              @click="triggerFileInput"
            />
            <div 
              class="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="triggerFileInput"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
              :disabled="isUploading"
            />
          </div>
          <p class="text-xs text-gray-500 mt-2 text-center">Click to upload</p>
        </div>
        
        <div class="flex-1 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                v-model="profileSettings.name"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :disabled="isSaving"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                v-model="profileSettings.email"
                type="email" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                :disabled="isSaving"
              />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input 
                v-model="profileSettings.department"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Computer Science"
                :disabled="isSaving"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end mt-6">
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isSaving || isUploading"
          @click="saveProfile"
        >
          {{ isSaving ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Change Password -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
      
      <div class="space-y-4 max-w-md">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input 
            v-model="passwordForm.currentPassword"
            type="password" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="isChangingPassword"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input 
            v-model="passwordForm.newPassword"
            type="password" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="isChangingPassword"
          />
          <p class="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input 
            v-model="passwordForm.confirmPassword"
            type="password" 
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :disabled="isChangingPassword"
          />
        </div>
        
        <button 
          class="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isChangingPassword"
          @click="changePassword"
        >
          {{ isChangingPassword ? 'Updating...' : 'Update Password' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

// Reactive data
const isSaving = ref(false)
const isChangingPassword = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const profileSettings = ref({
  id: '',
  name: '',
  email: '',
  department: '',
  avatarUrl: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Methods
const loadProfile = async () => {
  try {
    const response = await api.settings.getProfile()
    if (response.code === 0 && response.data) {
      profileSettings.value = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        department: response.data.department || '',
        avatarUrl: response.data.avatarUrl || ''
      }
    }
  } catch (error: any) {
    console.error('Failed to load profile:', error)
    alert('Failed to load profile: ' + (error.response?.data?.msg || error.message))
  }
}

const triggerFileInput = () => {
  if (!isUploading.value && fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    return
  }
  
  isUploading.value = true
  
  try {
    const response = await api.settings.uploadAvatar(file)
    
    if (response.code === 0 && response.data) {
      // Update avatar URL
      profileSettings.value.avatarUrl = response.data.avatarUrl
      alert('Avatar uploaded successfully!')
    }
  } catch (error: any) {
    console.error('Failed to upload avatar:', error)
    alert('Failed to upload avatar: ' + (error.response?.data?.msg || error.message))
  } finally {
    isUploading.value = false
    // Clear file input
    if (target) {
      target.value = ''
    }
  }
}

const saveProfile = async () => {
  if (!profileSettings.value.name || !profileSettings.value.email) {
    alert('Name and email are required')
    return
  }

  isSaving.value = true
  try {
    const response = await api.settings.updateProfile({
      name: profileSettings.value.name,
      email: profileSettings.value.email,
      department: profileSettings.value.department,
      avatarUrl: profileSettings.value.avatarUrl
    })

    if (response.code === 0) {
      alert('Profile updated successfully!')
      if (response.data) {
        profileSettings.value = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          department: response.data.department || '',
          avatarUrl: response.data.avatarUrl || ''
        }
      }
    }
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    alert('Failed to update profile: ' + (error.response?.data?.msg || error.message))
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.currentPassword) {
    alert('Please enter your current password')
    return
  }

  if (!passwordForm.value.newPassword) {
    alert('Please enter a new password')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    alert('Password must be at least 6 characters long')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  isChangingPassword.value = true
  try {
    const response = await api.settings.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword
    })

    if (response.code === 0) {
      alert('Password changed successfully!')
      // Clear form
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  } catch (error: any) {
    console.error('Failed to change password:', error)
    alert('Failed to change password: ' + (error.response?.data?.msg || error.message))
  } finally {
    isChangingPassword.value = false
  }
}

// Handle image load error
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileSettings.value.name || 'User')
}

onMounted(() => {
  loadProfile()
})
</script>