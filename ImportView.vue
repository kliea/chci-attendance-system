<script setup>
// src/views/admin/ImportView.vue
// Full DAT import flow: upload → parse → preview → confirm → result

import { ref } from 'vue'
import { useZkParser } from '@/composables/useZkParser'
import { useImportStore } from '@/stores/import'

const { parseFile } = useZkParser()
const importStore   = useImportStore()

// ── State ─────────────────────────────────────────────────────────
const step        = ref('upload')   // upload | preview | importing | done
const fileType    = ref(null)       // 'user' | 'attendance'
const parsed      = ref([])
const parseErrors = ref([])
const parseTotal  = ref(0)
const dragOver    = ref(false)
const parseError  = ref(null)

// ── File Handling ─────────────────────────────────────────────────
async function handleFile(file) {
  parseError.value = null
  importStore.$reset()

  try {
    const result = await parseFile(file)
    fileType.value  = result.type
    parsed.value    = result.results
    parseErrors.value = result.errors
    parseTotal.value  = result.total
    step.value = 'preview'
  } catch (e) {
    parseError.value = e.message
  }
}

function onFileInput(e) {
  const file = e.target.files[0]
  if (file) handleFile(file)
}

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer.files[0]
  if (file) handleFile(file)
}

// ── Confirm Import ────────────────────────────────────────────────
async function confirmImport() {
  step.value = 'importing'
  if (fileType.value === 'user') {
    await importStore.importUsers(parsed.value)
  } else {
    await importStore.importAttendance(parsed.value)
  }
  step.value = 'done'
}

function reset() {
  step.value    = 'upload'
  fileType.value = null
  parsed.value  = []
  parseErrors.value = []
  parseError.value  = null
  importStore.$reset()
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <h1 class="text-2xl font-semibold text-gray-900 mb-1">Import from Device</h1>
    <p class="text-sm text-gray-500 mb-8">Upload a ZKTeco <code>.dat</code> export — user data or attendance logs.</p>

    <!-- ── STEP: UPLOAD ── -->
    <div v-if="step === 'upload'">
      <label
        class="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-xl cursor-pointer transition-colors"
        :class="dragOver ? 'border-gray-900 bg-gray-50' : 'border-gray-300 hover:border-gray-400'"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="onDrop"
      >
        <svg class="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
        </svg>
        <span class="text-sm text-gray-500">Drop your <strong>.dat</strong> file here or <span class="underline">browse</span></span>
        <input type="file" accept=".dat" class="hidden" @change="onFileInput" />
      </label>

      <p v-if="parseError" class="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
        {{ parseError }}
      </p>
    </div>

    <!-- ── STEP: PREVIEW ── -->
    <div v-else-if="step === 'preview'">
      <div class="flex items-center justify-between mb-5">
        <div>
          <span class="inline-block text-xs font-medium uppercase tracking-wide px-2 py-1 rounded"
            :class="fileType === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'">
            {{ fileType === 'user' ? 'User Data' : 'Attendance Logs' }}
          </span>
          <span class="ml-3 text-sm text-gray-500">
            {{ parsed.length }} valid records · {{ parseErrors.length }} skipped
          </span>
        </div>
        <button @click="reset" class="text-sm text-gray-400 hover:text-gray-600">← Upload different file</button>
      </div>

      <!-- Preview table -->
      <div class="overflow-x-auto rounded-xl border border-gray-200 mb-6">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr v-if="fileType === 'user'">
              <th class="px-4 py-3 text-left">Bio ID</th>
              <th class="px-4 py-3 text-left">First Name</th>
              <th class="px-4 py-3 text-left">M.I.</th>
              <th class="px-4 py-3 text-left">Last Name</th>
            </tr>
            <tr v-else>
              <th class="px-4 py-3 text-left">Bio ID</th>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-left">Timestamp</th>
              <th class="px-4 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <!-- Show max 100 rows in preview -->
            <template v-if="fileType === 'user'">
              <tr v-for="(row, i) in parsed.slice(0, 100)" :key="i" class="hover:bg-gray-50">
                <td class="px-4 py-2 font-mono text-gray-600">{{ row.bio_id }}</td>
                <td class="px-4 py-2">{{ row.fname }}</td>
                <td class="px-4 py-2">{{ row.minit ?? '—' }}</td>
                <td class="px-4 py-2">{{ row.lname }}</td>
              </tr>
            </template>
            <template v-else>
              <tr v-for="(row, i) in parsed.slice(0, 100)" :key="i" class="hover:bg-gray-50">
                <td class="px-4 py-2 font-mono text-gray-600">{{ row.bio_id }}</td>
                <td class="px-4 py-2">{{ row.date }}</td>
                <td class="px-4 py-2 font-mono text-xs">{{ row.timestamp }}</td>
                <td class="px-4 py-2">
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-green-100 text-green-700': row.in_out === 0,
                      'bg-red-100 text-red-700':     row.in_out === 1,
                      'bg-yellow-100 text-yellow-700': row.in_out === 4,
                      'bg-purple-100 text-purple-700': row.in_out === 5,
                    }">
                    {{ ['Check In','Check Out','','','OT In','OT Out'][row.in_out] ?? row.in_out }}
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <p v-if="parsed.length > 100" class="text-xs text-gray-400 px-4 py-2 border-t border-gray-100">
          Showing first 100 of {{ parsed.length }} records.
        </p>
      </div>

      <!-- Skipped rows -->
      <details v-if="parseErrors.length" class="mb-6">
        <summary class="text-sm text-red-500 cursor-pointer">{{ parseErrors.length }} line(s) skipped — click to view</summary>
        <ul class="mt-2 text-xs text-gray-500 space-y-1 pl-4">
          <li v-for="(e, i) in parseErrors" :key="i">Line {{ e.line }}: {{ e.reason }} — <code>{{ e.raw }}</code></li>
        </ul>
      </details>

      <button
        @click="confirmImport"
        class="w-full bg-gray-900 text-white text-sm font-medium py-3 rounded-xl hover:bg-gray-700 transition-colors"
      >
        Confirm & Import {{ parsed.length }} Records
      </button>
    </div>

    <!-- ── STEP: IMPORTING ── -->
    <div v-else-if="step === 'importing'" class="text-center py-16">
      <div class="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div class="bg-gray-900 h-2 rounded-full transition-all duration-300" :style="{ width: importStore.progress + '%' }"></div>
      </div>
      <p class="text-sm text-gray-500">Importing… {{ importStore.progress }}%</p>
    </div>

    <!-- ── STEP: DONE ── -->
    <div v-else-if="step === 'done'" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
        :class="importStore.errorCount === 0 ? 'bg-green-100' : 'bg-yellow-100'">
        <svg v-if="importStore.errorCount === 0" class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      </div>

      <h2 class="text-lg font-semibold text-gray-900 mb-1">Import Complete</h2>
      <p class="text-sm text-gray-500 mb-6">
        {{ importStore.successCount }} records saved · {{ importStore.errorCount }} failed
      </p>

      <details v-if="importStore.errorLog.length" class="text-left mb-6">
        <summary class="text-sm text-red-500 cursor-pointer">View errors</summary>
        <ul class="mt-2 text-xs text-gray-500 space-y-1 pl-4">
          <li v-for="(e, i) in importStore.errorLog" :key="i">Batch {{ e.batch }}: {{ e.error }}</li>
        </ul>
      </details>

      <button @click="reset" class="text-sm text-gray-900 underline">Import another file</button>
    </div>
  </div>
</template>
