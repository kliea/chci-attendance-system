<template>
  <div class="max-w-4xl">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display font-light text-xl tracking-wide text-anito-black">Employees</h1>
        <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Staff roster for attendance. Add staff by Full name and Bio ID, then import .dat. Staff who need login can register at /register.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <Button variant="primary" @click="openListModal">
          Add staff
        </Button>
      </div>
    </header>

    <Card class="mb-8">
      <CardHeader>Registered employees</CardHeader>
      <div v-if="employees.loading && !employees.list.length">
        <LoadingBar />
      </div>
      <div v-else-if="employees.error" class="p-4 text-red-600 text-sm">{{ employees.error }}</div>
      <DataTable
        v-else
        :columns="registeredColumns"
        :data="employeeProfiles"
        :empty="!employees.list.length"
        empty-text="No registered employees. Staff can register at /register."
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ row.bio_id || '—' }}</td>
          <td class="px-4 py-3 text-sm font-sans text-anito-gray">{{ row.email || '—' }}</td>
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.program || '—' }}</td>
        </template>
      </DataTable>
    </Card>

    <Card>
      <CardHeader>Staff roster</CardHeader>
      <div v-if="staff.loading">
        <LoadingBar />
      </div>
      <div v-else-if="staff.error" class="p-4 text-red-600 text-sm">{{ staff.error }}</div>
      <DataTable
        v-else
        :columns="rosterColumns"
        :data="staff.list"
        :empty="!staff.list.length"
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-anito-black">{{ row.full_name }}</td>
          <td class="px-4 py-3 font-mono text-xs text-anito-gray">{{ row.bio_id || '—' }}</td>
        </template>
        <template #empty>
          <EmptyState icon="📋" title="No staff yet" subtitle="Add staff (Full name + Bio ID), then import attendance .dat." />
        </template>
      </DataTable>
    </Card>

    <Dialog v-model="showListModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Add staff</h2>
      </template>
      <div class="space-y-4">
        <p class="text-anito-gray text-sm font-sans font-light leading-relaxed">Add staff to the roster (no login). Then import attendance .dat; records will match by Bio ID.</p>
        <form class="flex gap-2 flex-wrap items-end" @submit.prevent="addRow">
          <div class="flex-1 min-w-[120px]">
            <Label for-id="add-fullName">Full name</Label>
            <Input id="add-fullName" v-model="formFullName" placeholder="Jane Doe" />
          </div>
          <div class="w-24">
            <Label for-id="add-bioId">Bio ID</Label>
            <Input id="add-bioId" v-model="formBioId" placeholder="1" />
          </div>
          <Button type="submit" variant="primary" :disabled="!formBioId.trim()">
            Add
          </Button>
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
          <Button variant="outline" @click="showListModal = false">Cancel</Button>
          <Button variant="primary" :disabled="listSaving || !pendingRows.length" @click="submitList">
            Add {{ pendingRows.length }} to roster
          </Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/staff.js'
import { useEmployeesStore } from '@/stores/employees.js'
import {
  Button,
  Card,
  CardHeader,
  DataTable,
  Dialog,
  EmptyState,
  Input,
  Label,
  LoadingBar,
} from '@/components/ui'

const staff = useStaffStore()
const employees = useEmployeesStore()

const showListModal = ref(false)

const formFullName = ref('')
const formBioId = ref('')
const pendingRows = ref([])
const listError = ref('')
const listSuccess = ref('')
const listSaving = ref(false)

const registeredColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'bio_id', label: 'Bio ID' },
  { key: 'email', label: 'Email' },
  { key: 'program', label: 'Program' },
]

const rosterColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'bio_id', label: 'Bio ID' },
]

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
