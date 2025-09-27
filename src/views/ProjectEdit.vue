<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEdit ? 'Edit Project' : 'Create New Project' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ isEdit ? 'Update project information and settings' : 'Fill in the details to create a new research project' }}
        </p>
      </div>
      
      <button 
        class="text-gray-600 hover:text-gray-800"
        @click="$router.back()"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <form @submit.prevent="saveProject" class="space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
              <input 
                v-model="form.title"
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter project title"
                required
              >
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea 
                v-model="form.description"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="4"
                placeholder="Describe your project objectives and methodology"
                required
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Laboratory</label>
              <select 
                v-model="form.laboratory"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Laboratory</option>
                <option 
                  v-for="lab in laboratories" 
                  :key="lab.id" 
                  :value="lab.name"
                >
                  {{ lab.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select 
                v-model="form.priority"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input 
                v-model="form.startDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input 
                v-model="form.endDate"
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
            </div>
          </div>
        </div>

        <!-- Project Details -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Project Details</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Research Objectives</label>
            <textarea 
              v-model="form.objectives"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="List the main research objectives and expected outcomes"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Required Equipment</label>
              <textarea 
                v-model="equipmentText"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="List required equipment (one per line)"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Materials</label>
              <textarea 
                v-model="materialsText"
                class="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                placeholder="List required materials (one per line)"
              ></textarea>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expected Deliverables</label>
            <textarea 
              v-model="deliverablesText"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows="3"
              placeholder="List expected deliverables (one per line)"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Budget (Optional)</label>
            <input 
              v-model.number="form.budget"
              type="number" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter estimated budget"
              min="0"
            >
          </div>
        </div>

        <!-- Team Members -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Team Members</h3>
          
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <label 
              v-for="user in availableUsers" 
              :key="user.id"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input 
                v-model="form.teamMembers"
                type="checkbox" 
                :value="user.id"
                class="rounded border-gray-300"
              >
              <div class="flex-1">
                <span class="text-sm font-medium">{{ user.name }}</span>
                <span class="text-xs text-gray-500 ml-2">({{ user.role }})</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Tags -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Tags</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Tags</label>
            <input 
              v-model="tagsText"
              type="text" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter tags separated by commas (e.g., AI, Machine Learning, Research)"
            >
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-3 pt-6 border-t">
          <button 
            type="button"
            class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            @click="$router.back()"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            class="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/project'
import { useLabStore } from '@/stores/lab'
import { useUiStore } from '@/stores/ui'
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const labStore = useLabStore()
const uiStore = useUiStore()

// Route params
const projectId = computed(() => route.params.projectId as string)
const isEdit = computed(() => !!projectId.value)

// Form state
const saving = ref(false)
const form = ref<CreateProjectRequest & { budget?: number }>({
  title: '',
  description: '',
  laboratory: '',
  priority: 'medium',
  startDate: '',
  endDate: '',
  teamMembers: [],
  objectives: '',
  resources: {},
  deliverables: [],
  tags: []
})

// Text fields for arrays (easier editing)
const equipmentText = ref('')
const materialsText = ref('')
const deliverablesText = ref('')
const tagsText = ref('')

// Mock data - in real app would come from stores
const laboratories = computed(() => labStore.labs)
const availableUsers = ref([
  { id: '1', name: 'Dr. Sarah Wilson', role: 'TEACHER' },
  { id: '2', name: 'John Smith', role: 'STUDENT' },
  { id: '3', name: 'Emily Davis', role: 'STUDENT' },
  { id: '4', name: 'Prof. Mike Johnson', role: 'TEACHER' }
])

// Convert text to arrays
const updateArraysFromText = () => {
  form.value.resources = {
    equipment: equipmentText.value ? equipmentText.value.split('\n').filter(item => item.trim()) : [],
    materials: materialsText.value ? materialsText.value.split('\n').filter(item => item.trim()) : [],
    budget: form.value.budget
  }
  form.value.deliverables = deliverablesText.value ? deliverablesText.value.split('\n').filter(item => item.trim()) : []
  form.value.tags = tagsText.value ? tagsText.value.split(',').map(tag => tag.trim()).filter(tag => tag) : []
}

// Convert arrays to text
const updateTextFromArrays = () => {
  equipmentText.value = form.value.resources?.equipment?.join('\n') || ''
  materialsText.value = form.value.resources?.materials?.join('\n') || ''
  deliverablesText.value = form.value.deliverables?.join('\n') || ''
  tagsText.value = form.value.tags?.join(', ') || ''
}

// Watch text changes
watch([equipmentText, materialsText, deliverablesText, tagsText], updateArraysFromText)

const loadProject = async () => {
  if (!isEdit.value) return
  
  try {
    const project = await projectStore.fetchProjectById(projectId.value)
    
    // Populate form with project data
    form.value = {
      title: project.title,
      description: project.description,
      laboratory: project.laboratory || '',
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate,
      teamMembers: project.teamMembers,
      objectives: project.objectives,
      resources: project.resources || {},
      deliverables: project.deliverables || [],
      tags: project.tags || []
    }
    
    // Update text fields
    updateTextFromArrays()
    
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to load project details'
    })
    router.push('/projects')
  }
}

const saveProject = async () => {
  try {
    saving.value = true
    updateArraysFromText()
    
    if (isEdit.value) {
      // Update existing project
      const updateData: UpdateProjectRequest = { ...form.value }
      await projectStore.updateProject(projectId.value, updateData)
      
      uiStore.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project updated successfully'
      })
    } else {
      // Create new project
      await projectStore.createProject(form.value)
      
      uiStore.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Project created successfully'
      })
    }
    
    router.push('/projects')
    
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      title: 'Error',
      message: isEdit.value ? 'Failed to update project' : 'Failed to create project'
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      labStore.fetchLabs(),
      loadProject()
    ])
  } catch (error) {
    console.error('Failed to load initial data:', error)
  }
})
</script>