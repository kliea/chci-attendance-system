<template>
  <div class="p-4 space-y-4">
    <div v-if="isLoading" class="space-y-2">
      <p class="text-anito-black text-sm font-sans font-medium">Importing…</p>
      <div class="h-1 bg-anito-gray-light rounded-full overflow-hidden">
        <div
          class="h-full bg-anito-blue-mid rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>

    <div v-else class="space-y-3">
      <p class="text-anito-black text-sm font-sans font-medium">Import complete</p>
      <div class="flex gap-4 text-sm font-sans font-light">
        <span class="text-anito-gray">Saved: <strong class="text-anito-black">{{ successCount }}</strong></span>
        <span v-if="errorCount > 0" class="text-red-600">Failed: <strong>{{ errorCount }}</strong></span>
      </div>
      <p v-if="successCount === 0 && errorLog.some(e => e.error && e.error.includes('not found'))" class="text-anito-gray text-xs font-sans font-light">
        No records were imported because no file PINs match an employee’s <strong>Bio ID</strong>. Add employees in <strong>Employees</strong> with the same Bio IDs as the device PINs, then re-import.
      </p>
      <p v-else-if="successCount > 0 && errorLog.some(e => e.error && e.error.includes('not found'))" class="text-anito-gray text-xs font-sans font-light">
        Some PINs had no matching employee and were skipped. Add them in <strong>Employees</strong> and re-import to include those records.
      </p>

      <div v-if="errorLog.length > 0" class="mt-2">
        <button
          type="button"
          class="text-anito-gray hover:text-anito-black text-xs underline transition-colors duration-150"
          @click="showErrors = !showErrors"
        >
          {{ showErrors ? 'Hide' : 'Show' }} error log
        </button>
        <ul v-if="showErrors" class="mt-2 list-disc list-inside text-red-600 text-xs space-y-1 max-h-32 overflow-y-auto">
          <li v-for="(e, i) in errorLog" :key="i">Batch {{ e.batch }}: {{ e.error }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useImportStore } from '@/stores/import.js'

const importStore = useImportStore()
const showErrors = ref(false)

const isLoading = importStore.isLoading
const progress = importStore.progress
const successCount = importStore.successCount
const errorCount = importStore.errorCount
const errorLog = importStore.errorLog

watch(() => importStore.errorLog.length, () => { showErrors.value = true })
</script>
