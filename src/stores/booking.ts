import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookingEvent } from '@/types'
import { api } from '@/api'
import dayjs from 'dayjs'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<BookingEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const viewMode = ref<'calendar' | 'list'>('calendar')
  const currentDate = ref(dayjs())
  const selectedLabId = ref<string>('')

  const filteredBookings = computed(() => {
    return bookings.value.filter(booking => {
      if (selectedLabId.value && booking.labId !== selectedLabId.value) {
        return false
      }
      return true
    })
  })

  const pendingBookings = computed(() => {
    return bookings.value.filter(booking => booking.status === 'pending')
  })

  const fetchBookings = async (params?: {
    from?: string
    to?: string
    labId?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      const response = await api.bookings.getList(params)
      bookings.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取预约列表失败'
      console.error('Failed to fetch bookings:', err)
    } finally {
      loading.value = false
    }
  }

  const createBooking = async (booking: Omit<BookingEvent, 'id'>) => {
    try {
      const response = await api.bookings.create(booking)
      bookings.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '创建预约失败'
      throw err
    }
  }

  const approveBooking = async (id: string) => {
    try {
      const response = await api.bookings.approve(id)
      const index = bookings.value.findIndex(b => b.id === id)
      if (index > -1) {
        bookings.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '审批预约失败'
      throw err
    }
  }

  const rejectBooking = async (id: string, reason?: string) => {
    try {
      const response = await api.bookings.reject(id, reason)
      const index = bookings.value.findIndex(b => b.id === id)
      if (index > -1) {
        bookings.value[index] = response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || '拒绝预约失败'
      throw err
    }
  }

  const checkConflicts = async (booking: {
    labId: string
    start: string
    end: string
    excludeId?: string
  }) => {
    try {
      const response = await api.bookings.checkConflicts(booking)
      return response.data
    } catch (err: any) {
      console.error('Failed to check conflicts:', err)
      return { hasConflicts: false, conflicts: [] }
    }
  }

  const setViewMode = (mode: 'calendar' | 'list') => {
    viewMode.value = mode
  }

  const setCurrentDate = (date: dayjs.Dayjs) => {
    currentDate.value = date
  }

  const setSelectedLabId = (labId: string) => {
    selectedLabId.value = labId
  }

  return {
    bookings,
    loading,
    error,
    viewMode,
    currentDate,
    selectedLabId,
    filteredBookings,
    pendingBookings,
    fetchBookings,
    createBooking,
    approveBooking,
    rejectBooking,
    checkConflicts,
    setViewMode,
    setCurrentDate,
    setSelectedLabId
  }
})