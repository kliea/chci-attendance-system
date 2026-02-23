<template>
  <div class="p-6 max-w-4xl">
    <header class="mb-6">
      <h1 class="font-display text-ink text-xl font-semibold tracking-tight">
        ZKTeco attendance import
      </h1>
      <p class="text-muted text-sm mt-1">
        Upload attendance .dat files from ZKTeco devices. Preview and confirm before saving. No accounts required; attendance is keyed by staff roster (Employees → Add from list).
      </p>
    </header>

    <section
      class="bg-panel border border-border rounded-lg overflow-hidden"
      aria-label="Import area"
    >
      <div class="min-h-[320px] flex flex-col">
        <!-- Step 1: Upload -->
        <template v-if="step === 'upload'">
          <FileDropzone
            class="m-4"
            @file="onFileSelected"
          />
          <p v-if="parseError" class="px-4 pb-4 text-danger text-sm">{{ parseError }}</p>
        </template>

        <!-- Step 2: Preview + Confirm -->
        <template v-else-if="step === 'preview'">
          <ParsePreviewTable
            :type="parsed.type"
            :records="parsed.records"
            :skipped="parsed.skipped"
            :skipped-reasons="parsed.skippedReasons"
          />
          <div class="px-4 py-3 border-t border-border bg-surface/30 flex flex-col gap-2">
            <p class="text-muted text-sm">
              {{ parsed.fileName }} — Attendance log
            </p>
            <p class="text-muted text-xs">Only PINs that exist in the staff roster are imported. Seed staff first (e.g. <strong>Employees → Add from list</strong> or run the employee seed SQL); unknown PINs are skipped.</p>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-3 py-1.5 text-muted hover:text-ink text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                @click="resetToUpload"
              >
                Cancel
              </button>
              <button
                type="button"
                class="px-4 py-1.5 bg-accent text-surface text-sm font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                :disabled="parsed.records.length === 0"
                @click="confirmImport"
              >
                Confirm & import
              </button>
            </div>
          </div>
        </template>

        <!-- Step 3: Importing / Result -->
        <template v-else-if="step === 'importing' || step === 'result'">
          <ImportSummary />
          <div v-if="step === 'result'" class="px-4 pb-4">
            <button
              type="button"
              class="px-4 py-2 bg-accent text-surface text-sm font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
              @click="resetToUpload"
            >
              Import another file
            </button>
          </div>
        </template>
      </div>
    </section>

    <p class="text-muted text-xs mt-4">
      Attendance .dat format: PIN, Date (YYYY-MM-DD), Time (HH:MM:SS), Verify, In/Out. Max 10MB per file.
      Seed staff first (<strong>Employees → Add from list</strong> or run supabase-seed-employees.sql). Only records for existing staff Bio IDs are imported; unknown PINs are skipped.
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { parseDatFile } from '@/composables/useZkParser.js'
import { useImportStore } from '@/stores/import.js'
import FileDropzone from '@/components/import/FileDropzone.vue'
import ParsePreviewTable from '@/components/import/ParsePreviewTable.vue'
import ImportSummary from '@/components/import/ImportSummary.vue'

const importStore = useImportStore()

const step = ref('upload') // 'upload' | 'preview' | 'importing' | 'result'
const parseError = ref('')
const parsed = reactive({
  type: 'attendance',
  records: [],
  skipped: 0,
  skippedReasons: [],
  fileName: '',
})

async function onFileSelected(file) {
  parseError.value = ''
  try {
    const result = await parseDatFile(file)
    if (result.type === 'user') {
      parseError.value = 'This file looks like a user roster, not an attendance log. Import only attendance .dat files. Add users via Employees → Register or bulk create.'
      return
    }
    parsed.type = 'attendance'
    parsed.records = result.records
    parsed.skipped = result.skipped
    parsed.skippedReasons = result.skippedReasons ?? []
    parsed.fileName = result.fileName ?? file.name
    step.value = 'preview'
  } catch (err) {
    parseError.value = err.message || 'Failed to parse file.'
  }
}

function resetToUpload() {
  step.value = 'upload'
  parseError.value = ''
  parsed.records = []
  parsed.skipped = 0
  parsed.skippedReasons = []
  parsed.fileName = ''
  importStore.$reset()
}

async function confirmImport() {
  if (parsed.records.length === 0) return
  step.value = 'importing'
  await importStore.importAttendance(parsed.records)
  step.value = 'result'
}
</script>
