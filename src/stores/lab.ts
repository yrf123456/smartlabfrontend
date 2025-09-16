import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import type { Lab } from '@/types'
import { api } from '@/api'

export const useLabStore = defineStore('lab', () => {
  const labs = ref<Lab[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  const filters = ref({
    keyword: '',
    tags: [] as string[],
    status: '' as Lab['status'] | ''
  })
  const viewMode = ref<'grid' | 'list'>('grid')

  const filteredLabs = computed(() => {
    console.log('🔄 Computing filtered labs, total:', labs.value.length)
    
    return labs.value.filter(lab => {
      const matchesKeyword = !filters.value.keyword || 
        lab.name.toLowerCase().includes(filters.value.keyword.toLowerCase()) ||
        lab.location.toLowerCase().includes(filters.value.keyword.toLowerCase())
      
      const matchesTags = filters.value.tags.length === 0 ||
        filters.value.tags.some(tag => lab.tags.includes(tag))
      
      const matchesStatus = !filters.value.status || lab.status === filters.value.status
      
      return matchesKeyword && matchesTags && matchesStatus
    })
  })

  const availableTags = computed(() => {
    const tagSet = new Set<string>()
    labs.value.forEach(lab => {
      lab.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  })

  const fetchLabs = async (force = false) => {
    // 如果已经初始化且不强制刷新，则不重复请求
    if (initialized.value && !force && labs.value.length > 0) {
      console.log('✅ Labs already loaded, skipping fetch')
      return labs.value
    }

    try {
      console.log('📡 Fetching labs...')
      loading.value = true
      error.value = null
      
      const response = await api.labs.getList(filters.value)
      
      // 确保数据是响应式的
      labs.value = response.data || []
      initialized.value = true
      
      console.log('✅ Labs fetched successfully:', labs.value.length, 'items')
      
      // 强制触发响应式更新
      await nextTick()
      
      return labs.value
    } catch (err: any) {
      console.error('❌ Failed to fetch labs:', err)
      error.value = err.response?.data?.message || err.message || '获取实验室列表失败'
      labs.value = [] // 确保清空之前的数据
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchLabById = async (id: string) => {
    try {
      console.log('📡 Fetching lab by ID:', id)
      
      // 先从现有数据中查找
      const existingLab = labs.value.find(lab => lab.id === id)
      if (existingLab) {
        console.log('✅ Lab found in store:', existingLab.name)
        return existingLab
      }
      
      // 如果没有找到，从API获取
      const response = await api.labs.getById(id)
      const lab = response.data
      
      console.log('✅ Lab fetched from API:', lab.name)
      
      // 更新store中的数据
      const index = labs.value.findIndex(l => l.id === id)
      if (index > -1) {
        labs.value[index] = lab
      } else {
        labs.value.push(lab)
      }
      
      await nextTick()
      return lab
    } catch (err: any) {
      console.error('❌ Failed to fetch lab:', err)
      error.value = err.response?.data?.message || err.message || '获取实验室详情失败'
      throw err
    }
  }

  const createLab = async (lab: Omit<Lab, 'id'>) => {
    try {
      console.log('📡 Creating lab:', lab.name)
      const response = await api.labs.create(lab)
      const newLab = response.data
      
      // 添加到列表
      labs.value.unshift(newLab)
      
      console.log('✅ Lab created successfully:', newLab.name)
      await nextTick()
      
      return newLab
    } catch (err: any) {
      console.error('❌ Failed to create lab:', err)
      error.value = err.response?.data?.message || err.message || '创建实验室失败'
      throw err
    }
  }

  const updateLab = async (id: string, lab: Partial<Lab>) => {
    try {
      console.log('📡 Updating lab:', id)
      const response = await api.labs.update(id, lab)
      const updatedLab = response.data
      
      // 更新列表中的数据
      const index = labs.value.findIndex(l => l.id === id)
      if (index > -1) {
        labs.value[index] = updatedLab
      }
      
      console.log('✅ Lab updated successfully:', updatedLab.name)
      await nextTick()
      
      return updatedLab
    } catch (err: any) {
      console.error('❌ Failed to update lab:', err)
      error.value = err.response?.data?.message || err.message || '更新实验室失败'
      throw err
    }
  }

  const setFilters = async (newFilters: Partial<typeof filters.value>) => {
    console.log('🔄 Setting filters:', newFilters)
    filters.value = { ...filters.value, ...newFilters }
    await nextTick()
  }

  const clearFilters = async () => {
    console.log('🧹 Clearing filters')
    filters.value = {
      keyword: '',
      tags: [],
      status: ''
    }
    await nextTick()
  }

  const setViewMode = (mode: 'grid' | 'list') => {
    console.log('👁️ Setting view mode:', mode)
    viewMode.value = mode
  }

  const refreshData = async () => {
    console.log('🔄 Refreshing lab data')
    initialized.value = false
    await fetchLabs(true)
  }

  // 清除错误状态
  const clearError = () => {
    error.value = null
  }

  // 重置store状态
  const reset = () => {
    console.log('🔄 Resetting lab store')
    labs.value = []
    loading.value = false
    error.value = null
    initialized.value = false
    filters.value = {
      keyword: '',
      tags: [],
      status: ''
    }
    viewMode.value = 'grid'
  }

  return {
    labs,
    loading,
    error,
    initialized,
    filters,
    viewMode,
    filteredLabs,
    availableTags,
    fetchLabs,
    fetchLabById,
    createLab,
    updateLab,
    setFilters,
    clearFilters,
    setViewMode,
    refreshData,
    clearError,
    reset
  }
})