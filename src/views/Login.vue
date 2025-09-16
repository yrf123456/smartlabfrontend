<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Logo and title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
          <Beaker class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Smart Lab</h1>
        <p class="text-gray-600">Laboratory Management System</p>
      </div>

      <!-- Login form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
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

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                v-model="form.rememberMe"
                type="checkbox"
                class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-600">Remember Me</span>
            </label>
            <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <div v-if="loading" class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Logging in...
            </div>
            <span v-else>Login</span>
          </button>

          <p v-if="error" class="text-sm text-red-600 text-center">{{ error }}</p>
        </form>

        <!-- Register link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600 text-sm">
            Don't have an account?
            <router-link 
              to="/register" 
              class="text-primary-600 hover:text-primary-500 font-medium"
            >
              Sign up now
            </router-link>
          </p>
        </div>

        <!-- Demo credentials -->
        <div class="mt-6 p-4 bg-gray-50 rounded-xl">
          <p class="text-sm text-gray-600 mb-2 font-medium">Demo Accounts:</p>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Admin:</span>
              <button
                class="text-primary-600 hover:text-primary-700 font-mono"
                @click="fillDemoCredentials('admin')"
              >
                admin@example.com
              </button>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Teacher:</span>
              <button
                class="text-primary-600 hover:text-primary-700 font-mono"
                @click="fillDemoCredentials('teacher')"
              >
                teacher@example.com
              </button>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">Student:</span>
              <button
                class="text-primary-600 hover:text-primary-700 font-mono"
                @click="fillDemoCredentials('student')"
              >
                student@example.com
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-2">Password: 123456</p>
          </div>
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

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUiStore()

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Demo credentials
const demoCredentials = {
  admin: {
    email: 'admin@example.com',
    password: '123456'
  },
  teacher: {
    email: 'teacher@example.com', 
    password: '123456'
  },
  student: {
    email: 'student@example.com',
    password: '123456'
  }
}

const fillDemoCredentials = (type: keyof typeof demoCredentials) => {
  const credentials = demoCredentials[type]
  form.email = credentials.email
  form.password = credentials.password
  
  // Clear any existing errors
  emailError.value = ''
  passwordError.value = ''
  error.value = ''
}

const validateForm = () => {
  emailError.value = ''
  passwordError.value = ''
  
  if (!form.email) {
    emailError.value = 'Please enter your email address'
    return false
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  
  if (!form.password) {
    passwordError.value = 'Please enter your password'
    return false
  }
  
  if (form.password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    loading.value = true
    error.value = ''
    
    console.log('📡 Attempting login...')
    const result = await authStore.login(form.email, form.password)
    
    if (result.success) {
      console.log('✅ Login successful, user:', authStore.user?.name)
      
      // Show success notification
      uiStore.addNotification({
        type: 'success',
        title: 'Login Successful',
        message: `Welcome back, ${authStore.user?.name}!`
      })
      
      // Wait for state update
      await nextTick()
      
      // Force trigger reactive update
      await authStore.forceUpdate()
      
      // Determine redirect target, avoid redirecting to login page
      const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
      
      // Avoid redirecting to login or register page causing loops
      if (redirectTo === '/login' || redirectTo === '/register') {
        console.log('🚀 Redirecting to dashboard (avoiding login/register loop)')
        router.replace('/dashboard')
      } else {
        console.log('🚀 Redirecting to:', redirectTo)
        router.replace(redirectTo)
      }
      
    } else {
      error.value = result.message || 'Login failed'
      uiStore.addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.value
      })
    }
  } catch (err: any) {
    console.error('💥 Login error:', err)
    error.value = err.message || 'Login failed, please try again'
    
    uiStore.addNotification({
      type: 'error',
      title: 'Login Error',
      message: 'Network connection error, please check your connection and try again'
    })
  } finally {
    loading.value = false
  }
}

// Auto-fill demo credentials on component mount for development
// Remove this in production
if (import.meta.env.DEV) {
  fillDemoCredentials('admin')
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

/* Demo credentials hover effect */
.demo-credential {
  transition: all 0.2s ease;
}

.demo-credential:hover {
  transform: translateX(2px);
}
</style>