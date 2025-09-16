<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleClose"
      >
        <div class="flex items-center justify-center min-h-screen p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50"></div>
          
          <!-- Modal -->
          <Transition name="scale">
            <div
              v-if="modelValue"
              class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
                <button
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  @click="handleClose"
                >
                  <X class="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <!-- Content -->
              <div class="flex-1 overflow-y-auto">
                <slot></slot>
              </div>
              
              <!-- Footer -->
              <div v-if="$slots.footer" class="p-6 border-t border-gray-200">
                <slot name="footer"></slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  modelValue?: boolean
  title: string
  closable?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  closable: true
})

const emit = defineEmits<Emits>()

const handleClose = () => {
  if (props.closable) {
    emit('update:modelValue', false)
    emit('close')
  }
}

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

// Prevent body scroll when modal is open
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>