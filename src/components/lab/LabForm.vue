<template>
  <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
    <!-- Basic Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Laboratory Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter laboratory name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Location <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.location"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Science Building 3F Room 301"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Capacity <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="form.capacity"
          type="number"
          min="1"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Maximum number of people"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Opening Hours <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.openHours"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Mon–Fri 08:30–18:00"
        />
      </div>
    </div>

    <!-- Cover Image -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Cover Image
      </label>
      <div class="flex items-start space-x-6">
        <!-- Image Preview -->
        <div class="flex-shrink-0">
          <div class="relative group">
            <img 
              :src="form.coverUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop'" 
              alt="Lab Cover"
              class="w-32 h-32 rounded-xl object-cover border-4 border-gray-100 cursor-pointer"
              @error="handleImageError"
              @click="triggerFileInput"
            />
            <div 
              class="absolute inset-0 rounded-xl bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              @click="triggerFileInput"
            >
              <Upload class="w-8 h-8 text-white" />
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
          <p class="text-xs text-gray-500 mt-2 text-center">
            {{ isUploading ? 'Uploading...' : 'Click to upload' }}
          </p>
        </div>
        
        <!-- Upload Instructions -->
        <div class="flex-1">
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
            <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600 mb-1">
              {{ isUploading ? 'Uploading image...' : 'Click the image or drag and drop' }}
            </p>
            <p class="text-xs text-gray-500">
              Supports JPG, PNG formats (Max 5MB)
            </p>
            <button
              type="button"
              class="mt-3 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isUploading"
              @click="triggerFileInput"
            >
              {{ isUploading ? 'Uploading...' : 'Choose Image' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="tag in form.tags"
          :key="tag"
          class="inline-flex items-center px-3 py-1 text-sm font-medium bg-primary-100 text-primary-800 rounded-full"
        >
          {{ tag }}
          <button
            type="button"
            class="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors"
            @click="removeTag(tag)"
          >
            <X class="w-3 h-3" />
          </button>
        </span>
      </div>
      <div class="flex space-x-2">
        <input
          v-model="newTag"
          type="text"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter tag name"
          @keyup.enter="addTag"
        />
        <button
          type="button"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          @click="addTag"
        >
          Add
        </button>
      </div>
    </div>

    <!-- Description -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Description
      </label>
      <textarea
        v-model="form.desc"
        rows="4"
        class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        placeholder="Laboratory introduction and usage instructions..."
      ></textarea>
    </div>

    <!-- Status -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Status
      </label>
      <select
        v-model="form.status"
        class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="available">Available</option>
        <option value="maintenance">Under Maintenance</option>
        <option value="full">Full</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
      <button
        type="button"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading || isUploading"
        class="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div v-if="loading || isUploading" class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {{ isUploading ? 'Uploading...' : 'Saving...' }}
        </div>
        <span v-else>Save</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Upload, X } from 'lucide-vue-next'
import { api } from '@/api'
import type { Lab } from '@/types'

interface Props {
  lab?: Lab
}

interface Emits {
  (e: 'submit', data: Omit<Lab, 'id'>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const loading = ref(false)
const isUploading = ref(false)
const newTag = ref('')

const form = reactive({
  name: props.lab?.name || '',
  location: props.lab?.location || '',
  capacity: props.lab?.capacity || 1,
  openHours: props.lab?.openHours || '',
  coverUrl: props.lab?.coverUrl || '',
  tags: props.lab?.tags || [],
  desc: props.lab?.desc || '',
  status: props.lab?.status || 'available' as Lab['status'],
  managers: props.lab?.managers || []
})

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
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
    console.log('📤 Uploading lab cover image...')
    const response = await api.upload.upload(file)
    
    if (response.data && response.data.url) {
      form.coverUrl = response.data.url
      console.log('✅ Lab cover uploaded:', form.coverUrl)
      alert('Image uploaded successfully!')
    }
  } catch (error: any) {
    console.error('❌ Upload failed:', error)
    alert('Failed to upload image: ' + (error.response?.data?.msg || error.message))
  } finally {
    isUploading.value = false
    // Clear file input
    if (target) {
      target.value = ''
    }
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop'
}

const handleSubmit = () => {
  // Validate form
  if (!form.name || !form.location || !form.capacity || !form.openHours) {
    alert('Please fill in all required fields')
    console.warn('Required fields missing')
    return
  }
  
  if (isUploading.value) {
    alert('Please wait for image upload to complete')
    return
  }
  
  loading.value = true
  
  const labData = {
    name: form.name,
    location: form.location,
    capacity: form.capacity,
    openHours: form.openHours,
    coverUrl: form.coverUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=240&fit=crop',
    tags: form.tags,
    desc: form.desc,
    status: form.status,
    managers: form.managers
  }
  
  console.log('📝 Submitting lab data:', labData)
  emit('submit', labData)
  
  // Reset loading after a delay (the parent component will handle navigation)
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>