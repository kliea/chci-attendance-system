<template>
  <div class="max-w-4xl">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display font-light text-xl tracking-wide text-anito-black">Employees</h1>
        <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Staff roster for attendance. Add staff by Full name and Bio ID, then import .dat. Staff who need login can register at /register.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
          @click="openListModal"
        >
          Add staff
        </button>
      </div>
    </header>

    <!-- Registered employees (profiles with bio id, email, name, program) -->
    <section class="rounded border border-anito-gray-light overflow-hidden mb-8">
      <h2 class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white">Registered employees</h2>
      <div v-if="employees.loading && !employees.list.length" class="p-8 space-y-2">
        <div class="h-0.5 w-full bg-anito-gray-light rounded-full overflow-hidden">
          <div class="h-full bg-anito-blue-mid animate-pulse rounded-full transition-all duration-300" style="width: 60%"></div>
        </div>
      </div>
      <div v-else-if="employees.error" class="p-4 text-red-600 text-sm">{{ employees.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Name</th>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Bio ID</th>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Email</th>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Program</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in employeeProfiles"
              :key="p.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ p.full_name }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ p.bio_id || '—' }}</td>
              <td class="px-4 py-3 text-sm font-sans text-anito-gray">{{ p.email || '—' }}</td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ p.program || '—' }}</td>
            </tr>
            <tr v-if="!employees.list.length">
              <td colspan="4" class="px-4 py-12 text-center text-anito-gray text-sm font-sans font-light">No registered employees. Staff can register at /register.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Staff roster (for attendance import) -->
    <section class="rounded border border-anito-gray-light overflow-hidden">
      <h2 class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white">Staff roster</h2>
      <div v-if="staff.loading" class="p-8 space-y-2">
        <div class="h-0.5 w-full bg-anito-gray-light rounded-full overflow-hidden">
          <div class="h-full bg-anito-blue-mid animate-pulse rounded-full transition-all duration-300" style="width: 60%"></div>
        </div>
      </div>
      <div v-else-if="staff.error" class="p-4 text-red-600 text-sm">{{ staff.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Name</th>
              <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left">Bio ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in staff.list"
              :key="s.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ s.full_name }}</td>
              <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ s.bio_id || '—' }}</td>
            </tr>
            <tr v-if="!staff.list.length">
              <td colspan="2" class="px-4 py-16 text-center">
                <div class="text-anito-gray-light w-10 h-10 mx-auto mb-4">📋</div>
                <p class="font-display font-light text-xl text-anito-black">No staff yet</p>
                <p class="text-sm text-anito-gray font-sans font-light mt-1">Add staff (Full name + Bio ID), then import attendance .dat.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Add staff modal (Full name + Bio ID → staff only, no account) -->
    <div
      v-if="showListModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="showListModal = false"
    >
      <div class="bg-anito-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col mx-auto mt-24 p-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Add staff</h2>
          <button type="button" class="text-anito-gray hover:text-anito-black transition-colors duration-150" aria-label="Close" @click="showListModal = false">✕</button>
        </div>
        <div class="overflow-y-auto flex-1 space-y-4">
          <p class="text-anito-gray text-sm font-sans font-light leading-relaxed">Add staff to the roster (no login). Then import attendance .dat; records will match by Bio ID.</p>
          <form class="flex gap-2 flex-wrap items-end" @submit.prevent="addRow">
            <div class="flex-1 min-w-[120px]">
              <label for="add-fullName" class="block text-[10px] tracking-[0.2em] uppercase text-anito-gray font-sans font-medium mb-1">Full name</label>
              <input
                id="add-fullName"
                v-model="formFullName"
                type="text"
                class="w-full px-4 py-2.5 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
                placeholder="Jane Doe"
              />
            </div>
            <div class="w-24">
              <label for="add-bioId" class="block text-[10px] tracking-[0.2em] uppercase text-anito-gray font-sans font-medium mb-1">Bio ID</label>
              <input
                id="add-bioId"
                v-model="formBioId"
                type="text"
                class="w-full px-4 py-2.5 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
                placeholder="1"
              />
            </div>
            <button type="submit" class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50" :disabled="!formBioId.trim()">
              Add
            </button>
          </form>
          <div v-if="pendingRows.length" class="border border-anito-gray-light rounded overflow-hidden">
            <table class="w-full text-sm text-left">
              <thead class="bg-anito-black">
                <tr>
                  <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-3 py-2 text-left">Full name</th>
                  <th class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-3 py-2 text-left">Bio ID</th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in pendingRows" :key="i" class="border-b border-anito-gray-light last:border-b-0">
                  <td class="px-3 py-2 text-anito-black">{{ row.fullName || '—' }}</td>
                  <td class="px-3 py-2 font-mono text-xs text-anito-gray">{{ row.bioId }}</td>
                  <td class="px-3 py-2">
                    <button type="button" class="text-anito-gray hover:text-red-600 text-sm transition-colors" aria-label="Remove" @click="removeRow(i)">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="listError" class="text-red-600 text-sm">{{ listError }}</p>
          <p v-if="listSuccess" class="text-anito-black text-sm">{{ listSuccess }}</p>
          <div class="flex gap-2">
            <button type="button" class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium" @click="showListModal = false">Cancel</button>
            <button type="button" class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50" :disabled="listSaving || !pendingRows.length" @click="submitList">
              Add {{ pendingRows.length }} to roster
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/staff.js'
import { useEmployeesStore } from '@/stores/employees.js'

const staff = useStaffStore()
const employees = useEmployeesStore()

const showListModal = ref(false)

const formFullName = ref('')
const formBioId = ref('')
const pendingRows = ref([])
const listError = ref('')
const listSuccess = ref('')
const listSaving = ref(false)

const employeeProfiles = computed(() =>
  employees.list.filter((p) => p.role === 'employee')
)

onMounted(async () => {
  await Promise.all([staff.fetchStaff(), employees.fetchEmployees()])
})

function openListModal() {
  formFullName.value = ''
  formBioId.value = ''
  pendingRows.value = []
  listError.value = ''
  listSuccess.value = ''
  showListModal.value = true
}

function addRow() {
  const bioId = formBioId.value.trim()
  if (!bioId) return
  pendingRows.value.push({
    bioId,
    fullName: formFullName.value.trim(),
  })
  formFullName.value = ''
  formBioId.value = ''
}

function removeRow(i) {
  pendingRows.value.splice(i, 1)
}

async function submitList() {
  if (!pendingRows.length) {
    listError.value = 'Add at least one staff with Bio ID.'
    return
  }
  listError.value = ''
  listSuccess.value = ''
  listSaving.value = true
  const result = await staff.addFromList(pendingRows.value)
  listSaving.value = false
  if (result.ok) {
    listSuccess.value = `Added ${pendingRows.value.length} to staff roster. You can now import attendance .dat; records will match by Bio ID.`
    pendingRows.value = []
  } else {
    listError.value = result.error || 'Failed to add.'
  }
}
</script>
