<template>
  <div
    class="border-2 border-dashed rounded-lg transition-colors min-h-[200px] flex flex-col items-center justify-center p-8"
    :class="isDragging ? 'border-accent bg-accent/5' : 'border-border bg-surface/50 hover:border-muted'"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".dat"
      class="hidden"
      @change="handleSelect"
    />
    <span class="text-muted text-4xl mb-3" aria-hidden="true">📁</span>
    <p class="text-ink font-medium text-sm">Drop a .dat file here or click to browse</p>
    <p class="text-muted text-xs mt-1">Attendance .dat only. Max 10MB. From ZKTeco devices.</p>
    <button
      type="button"
      class="mt-4 px-4 py-2 bg-accent text-surface text-sm font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
      @click="fileInput?.click()"
    >
      Choose file
    </button>
    <p v-if="error" class="text-danger text-sm mt-3">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

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
