import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BookingEvent } from '@/types'
import { api } from '@/api'
import dayjs from 'dayjs'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<BookingEvent[]>([])
  const selectedBooking = ref<BookingEvent | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const viewMode = ref<'calendar' | 'list'>('list')
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
      
      console.log('📡 Fetching bookings with params:', params)
      
      const response = await api.bookings.getList(params)
      
      console.log('✅ Bookings fetched:', response.data?.length || 0, 'items')
      
      // Ensure data is always an array
      bookings.value = Array.isArray(response.data) ? response.data : []
      
    } catch (err: any) {
      console.error('❌ Failed to fetch bookings:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch booking list'
      bookings.value = [] // Clear bookings on error
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchBookingById = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📡 Fetching booking by id:', id)
      
      const response = await api.bookings.getById(id)
      
      console.log('✅ Booking fetched:', response.data.id)
      
      selectedBooking.value = response.data
      
      return response.data
    } catch (err: any) {
      console.error('❌ Failed to fetch booking:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createBooking = async (booking: {
    labId: number
    title: string
    start: string
    end: string
    requesterId: number
    participants: number
    note?: string
  }) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📡 Creating booking:', booking.title)
      
      const response = await api.bookings.create(booking)
      
      console.log('✅ Booking created:', response.data.id)
      
      // Add new booking to the beginning of the list
      bookings.value.unshift(response.data)
      
      return response.data
    } catch (err: any) {
      console.error('❌ Failed to create booking:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  const approveBooking = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('✅ Approving booking:', id)
      
      const response = await api.bookings.approve(id)
      
      console.log('✅ Booking approved:', response.data.id)
      
      // Update booking in the list
      const index = bookings.value.findIndex(b => b.id === id)
      if (index > -1) {
        bookings.value[index] = response.data
      }
      
      // Update selected booking if it's the same
      if (selectedBooking.value?.id === id) {
        selectedBooking.value = response.data
      }
      
      return response.data
    } catch (err: any) {
      console.error('❌ Failed to approve booking:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to approve booking'
      throw err
    } finally {
      loading.value = false
    }
  }

  const rejectBooking = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('❌ Rejecting booking:', id)
      
      const response = await api.bookings.reject(id)
      
      console.log('✅ Booking rejected:', response.data.id)
      
      // Update booking in the list
      const index = bookings.value.findIndex(b => b.id === id)
      if (index > -1) {
        bookings.value[index] = response.data
      }
      
      // Update selected booking if it's the same
      if (selectedBooking.value?.id === id) {
        selectedBooking.value = response.data
      }
      
      return response.data
    } catch (err: any) {
      console.error('❌ Failed to reject booking:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reject booking'
      throw err
    } finally {
      loading.value = false
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

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    bookings.value = []
    selectedBooking.value = null
    loading.value = false
    error.value = null
    selectedLabId.value = ''
  }

  return {
    bookings,
    selectedBooking,
    loading,
    error,
    viewMode,
    currentDate,
    selectedLabId,
    filteredBookings,
    pendingBookings,
    fetchBookings,
    fetchBookingById,
    createBooking,
    approveBooking,
    rejectBooking,
    setViewMode,
    setCurrentDate,
    setSelectedLabId,
    clearError,
    reset
  }
})