<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <Beaker class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Smart Lab</h1>
        <p class="text-gray-600">Join our laboratory management system</p>
      </div>

      <!-- Register form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Register</h2>
          <p class="text-gray-600 text-sm">Create your account to get started</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'border-red-300': nameError }"
              placeholder="Enter your full name"
            />
            <p v-if="nameError" class="mt-1 text-sm text-red-600">{{ nameError }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'border-red-300': emailError }"
              placeholder="Enter your email address"
            />
            <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
          </div>

          <!-- Role Selection -->
          <div>
            <label for="role" class="block text-sm font-medium text-gray-700 mb-2">
              Role <span class="text-gray-400 text-xs">(Optional)</span>
            </label>
            <select
              id="role"
              v-model="form.role"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select your role</option>
              <option :value="UserRole.STUDENT">Student</option>
              <option :value="UserRole.TEACHER">Teacher</option>
              <option :value="UserRole.VISITOR">Visitor</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Default role is Student if not selected</p>
          </div>

          <!-- Department -->
          <div>
            <label for="department" class="block text-sm font-medium text-gray-700 mb-2">
              Department <span class="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              id="department"
              v-model="form.department"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your department"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                :class="{ 'border-red-300': passwordError }"
                placeholder="Enter your password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-4 flex items-center"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="w-5 h-5 text-gray-400" />
                <EyeOff v-else class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                :class="{ 'border-red-300': confirmPasswordError }"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 px-4 flex items-center"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye v-if="showConfirmPassword" class="w-5 h-5 text-gray-400" />
                <EyeOff v-else class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div v-if="loading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Registering...
            </div>
            <span v-else>Register</span>
          </button>

          <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>
        </form>

        <!-- Login link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            Already have an account?
            <router-link 
              to="/login" 
              class="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign in here
            </router-link>
          </p>
        </div>

        <!-- System features -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <h3 class="text-sm font-medium text-gray-700 mb-3">System Features</h3>
          <div class="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Responsive Design
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              Role-based Access
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
              Real-time Data
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              Data Export
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8 text-sm text-gray-500">
        <p>© 2024 Smart Lab. Laboratory Management System</p>
        <p class="mt-1">Built with Vue 3 + TypeScript + Tailwind CSS</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Beaker, Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { UserRole } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Form validation errors
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: UserRole.STUDENT, // Default role
  department: ''
})

const validateForm = () => {
  // Clear previous errors
  nameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
  error.value = ''

  let isValid = true

  // Validate name
  if (!form.name.trim()) {
    nameError.value = 'Name is required'
    isValid = false
  } else if (form.name.trim().length < 2) {
    nameError.value = 'Name must be at least 2 characters'
    isValid = false
  }

  // Validate email
  if (!form.email) {
    emailError.value = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    emailError.value = 'Please enter a valid email address'
    isValid = false
  }

  // Validate password
  if (!form.password) {
    passwordError.value = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    isValid = false
  }

  // Validate password confirmation
  if (!form.confirmPassword) {
    confirmPasswordError.value = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    confirmPasswordError.value = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    error.value = ''

    console.log('DEBUG: authStore object:', authStore)
    console.log('DEBUG: authStore.register exists?', typeof authStore.register)
    
    if (typeof authStore.register !== 'function') {
      console.error('authStore.register is not a function!')
      return
    }

    console.log('📝 Attempting registration...')
    const result = await authStore.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
      department: form.department.trim() || undefined
    })

    if (result.success) {
      console.log('✅ Registration successful, user:', authStore.user?.name)

      // Show success notification
      uiStore.addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to Smart Lab, ${authStore.user?.name}!`
      })

      // Wait for state update
      await nextTick()

      // Force trigger reactive update
      await authStore.forceUpdate()

      // Redirect to dashboard
      console.log('🚀 Redirecting to dashboard')
      router.replace('/dashboard')

    } else {
      error.value = result.message || 'Registration failed'
      uiStore.addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: error.value
      })
    }
  } catch (err: any) {
    console.error('💥 Registration error:', err)
    error.value = err.message || 'Registration failed, please try again'

    uiStore.addNotification({
      type: 'error',
      title: 'Registration Error',
      message: 'Network connection error, please check your connection and try again'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Custom animations for form elements */
.form-input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>