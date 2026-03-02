<template>
  <div
    class="border-2 border-dashed rounded-lg h-52 flex flex-col items-center justify-center cursor-pointer transition-colors duration-150"
    :class="isDragging ? 'border-anito-black bg-anito-blue-light' : 'border-anito-gray-light hover:border-anito-blue-mid'"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      :id="inputId"
      ref="fileInput"
      type="file"
      accept=".dat"
      class="hidden"
      aria-label="Upload .dat file"
      @change="handleSelect"
    />
    <svg class="text-anito-gray w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
    <p class="text-sm text-anito-gray font-sans font-light">Drop a .dat file here or click to browse</p>
    <p class="text-anito-gray text-xs mt-1 font-sans font-light">Attendance .dat only. Max 10MB. From ZKTeco devices.</p>
    <label :for="inputId" class="mt-4 inline-block cursor-pointer">
      <Button variant="secondary" tag="span" role="button" tabindex="0">
        Choose file
      </Button>
    </label>
    <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@/components/ui'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

const inputId = computed(() => `file-dropzone-${Math.random().toString(36).slice(2)}`)

const emit = defineEmits(['file'])
const fileInput = ref(null)
const isDragging = ref(false)
const error = ref('')

function validate(file) {
  error.value = ''
  if (!file.name.toLowerCase().endsWith('.dat')) {
    error.value = 'Please select a .dat file.'
    return false
  }
  if (file.size > MAX_SIZE) {
    error.value = 'File is too large. Maximum size is 10MB.'
    return false
  }
  return true
}

function handleSelect(ev) {
  const file = ev.target.files?.[0]
  if (file && validate(file)) emit('file', file)
  ev.target.value = ''
}

function handleDrop(ev) {
  isDragging.value = false
  const file = ev.dataTransfer?.files?.[0]
  if (file && validate(file)) emit('file', file)
}
</script>
