<template>
  <div class="max-w-6xl mx-auto bg-[#ffffff] font-sans antialiased rounded-lg min-h-screen p-8">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <p class="text-gray-500 text-sm font-sans font-semibold mt-1 leading-relaxed">Staff roster for attendance. Add staff by Full name and Bio ID, then import .dat. Staff who need login can register at /register.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <Button variant="secondary" class="bg-[#003777] text-white hover:bg-[#002555] px-4 py-2 font-sans font-semibold border-0" @click="openListModal">
          Add staff
        </Button>
      </div>
    </header>

    <Card class="mb-8 bg-[#ffffff] font-sans font-semibold">
      <CardHeader class="font-sans font-semibold text-gray-900">Registered employees</CardHeader>
      <div v-if="employees.loading && !employees.list.length">
        <LoadingBar />
      </div>
      <div v-else-if="employees.error" class="p-4 text-[#550000] bg-red-50 text-sm font-sans font-semibold">{{ employees.error }}</div>
      <DataTable
        v-else
        :columns="registeredColumns"
        :data="employeeProfiles"
        :empty="!employees.list.length"
        empty-text="No registered employees. Staff can register at /register."
        :row-class="() => 'font-sans font-semibold hover:bg-gray-50'"
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-gray-900 font-semibold">{{ row.full_name }}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-500 font-semibold">{{ row.bio_id || '—' }}</td>
          <td class="px-4 py-3 text-sm font-sans text-gray-500 font-semibold">{{ row.email || '—' }}</td>
          <td class="px-4 py-3 text-sm font-sans text-gray-900 font-semibold">{{ row.program || '—' }}</td>
          <td class="px-4 py-3 text-sm">
            <button type="button" class="text-[#003777] font-semibold hover:underline mr-3" @click="openProfileEditModal(row)">Edit</button>
            <button type="button" class="text-[#550000] font-semibold hover:underline" @click="confirmProfileDelete(row)">Delete</button>
          </td>
        </template>
      </DataTable>
    </Card>

    <Card class="bg-[#ffffff] font-sans font-semibold">
      <CardHeader class="font-sans font-semibold text-gray-900">Staff roster</CardHeader>
      <div v-if="staff.loading">
        <LoadingBar />
      </div>
      <div v-else-if="staff.error" class="p-4 text-[#550000] bg-red-50 text-sm font-sans font-semibold">{{ staff.error }}</div>
      <DataTable
        v-else
        :columns="rosterColumns"
        :data="staff.list"
        :empty="!staff.list.length"
        :row-class="() => 'font-sans font-semibold hover:bg-gray-50'"
      >
        <template #row="{ row }">
          <td class="px-4 py-3 text-sm font-sans text-gray-900 font-semibold">{{ row.full_name }}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-500 font-semibold">{{ row.bio_id || '—' }}</td>
          <td class="px-4 py-3 text-sm">
            <button type="button" class="text-[#003777] font-semibold hover:underline mr-3" @click="openEditModal(row)">Edit</button>
            <button type="button" class="text-[#550000] font-semibold hover:underline" @click="confirmDelete(row)">Delete</button>
          </td>
        </template>
        <template #empty>
          <EmptyState icon="📋" title="No staff yet" subtitle="Add staff (Full name + Bio ID), then import attendance .dat." class="font-sans font-semibold" />
        </template>
      </DataTable>
    </Card>

    <Dialog v-model="showEditModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-sans font-semibold text-2xl tracking-wide text-gray-900 mb-1">Edit staff</h2>
      </template>
      <form class="space-y-4 font-sans font-semibold" @submit.prevent="saveEdit">
        <div>
          <Label for-id="edit-fullName" class="text-gray-700 font-sans font-semibold">Full name</Label>
          <Input id="edit-fullName" v-model="editFullName" placeholder="Jane Doe" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
        </div>
        <div>
          <Label for-id="edit-bioId" class="text-gray-700 font-sans font-semibold">Bio ID</Label>
          <Input id="edit-bioId" v-model="editBioId" placeholder="1" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
        </div>
        <p v-if="editError" class="text-[#550000] text-sm font-sans font-semibold">{{ editError }}</p>
        <div class="flex gap-2">
          <Button type="button" variant="outline" class="font-sans font-semibold border-gray-300 text-gray-700 hover:bg-gray-50" @click="showEditModal = false">Cancel</Button>
          <Button type="submit" variant="primary" class="bg-[#003777] text-white hover:bg-[#003777]/90 font-sans font-semibold" :disabled="editSaving || !editBioId.trim()">Save</Button>
        </div>
      </form>
    </Dialog>

    <Dialog v-model="showDeleteConfirm" max-width="max-w-sm">
      <template #header>
        <h2 class="font-sans font-semibold text-2xl tracking-wide text-gray-900 mb-1">Remove from roster</h2>
      </template>
      <div class="space-y-4 font-sans font-semibold">
        <p class="text-gray-500 text-sm font-sans font-semibold leading-relaxed">
          Remove <strong class="font-semibold text-gray-900">{{ deleteTarget?.full_name }}</strong> (Bio ID {{ deleteTarget?.bio_id }}) from the staff roster? Attendance records for this staff will be deleted.
        </p>
        <p v-if="deleteError" class="text-[#550000] text-sm font-sans font-semibold">{{ deleteError }}</p>
        <div class="flex gap-2">
          <Button variant="outline" class="font-sans font-semibold border-gray-300 text-gray-700 hover:bg-gray-50" @click="showDeleteConfirm = false">Cancel</Button>
          <Button variant="primary" class="bg-[#550000] text-white hover:bg-[#550000]/90 font-sans font-semibold" :disabled="deleteSaving" @click="doDelete">Remove</Button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model="showProfileEditModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-sans font-semibold text-2xl tracking-wide text-gray-900 mb-1">Edit employee</h2>
      </template>
      <form class="space-y-4 font-sans font-semibold" @submit.prevent="saveProfileEdit">
        <div>
          <Label for-id="profile-edit-fullName" class="text-gray-700 font-sans font-semibold">Full name</Label>
          <Input id="profile-edit-fullName" v-model="profileEditFullName" placeholder="Jane Doe" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
        </div>
        <div>
          <Label for-id="profile-edit-bioId" class="text-gray-700 font-sans font-semibold">Bio ID</Label>
          <Input id="profile-edit-bioId" v-model="profileEditBioId" placeholder="1" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
        </div>
        <div>
          <Label for-id="profile-edit-email" class="text-gray-700 font-sans font-semibold">Email</Label>
          <Input id="profile-edit-email" v-model="profileEditEmail" type="email" placeholder="jane@example.com" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
        </div>
        <div>
          <Label for-id="profile-edit-program" class="text-gray-700 font-sans font-semibold">Program</Label>
          <select id="profile-edit-program" v-model="profileEditProgram" class="w-full rounded border border-gray-200 px-3 py-2 text-sm font-sans font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003777] bg-white">
            <option value="">—</option>
            <option value="CS">CS</option>
            <option value="IS">IS</option>
            <option value="IT">IT</option>
          </select>
        </div>
        <p v-if="profileEditError" class="text-[#550000] text-sm font-sans font-semibold">{{ profileEditError }}</p>
        <div class="flex gap-2">
          <Button type="button" variant="outline" class="font-sans font-semibold border-gray-300 text-gray-700 hover:bg-gray-50" @click="showProfileEditModal = false">Cancel</Button>
          <Button type="submit" variant="primary" class="bg-[#003777] text-white hover:bg-[#003777]/90 font-sans font-semibold" :disabled="profileEditSaving || !profileEditFullName.trim()">Save</Button>
        </div>
      </form>
    </Dialog>

    <Dialog v-model="showProfileDeleteConfirm" max-width="max-w-sm">
      <template #header>
        <h2 class="font-sans font-semibold text-2xl tracking-wide text-gray-900 mb-1">Remove employee account</h2>
      </template>
      <div class="space-y-4 font-sans font-semibold">
        <p class="text-gray-500 text-sm font-sans font-semibold leading-relaxed">
          Permanently remove <strong class="font-semibold text-gray-900">{{ profileDeleteTarget?.full_name }}</strong> ({{ profileDeleteTarget?.email || profileDeleteTarget?.bio_id }})? Their login will be deleted and they will no longer have access.
        </p>
        <p v-if="profileDeleteError" class="text-[#550000] text-sm font-sans font-semibold">{{ profileDeleteError }}</p>
        <div class="flex gap-2">
          <Button variant="outline" class="font-sans font-semibold border-gray-300 text-gray-700 hover:bg-gray-50" @click="showProfileDeleteConfirm = false">Cancel</Button>
          <Button variant="primary" class="bg-[#550000] text-white hover:bg-[#550000]/90 font-sans font-semibold" :disabled="profileDeleteSaving" @click="doProfileDelete">Remove account</Button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model="showListModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-sans font-semibold text-2xl tracking-wide text-gray-900 mb-1">Add staff</h2>
      </template>
      <div class="space-y-4 font-sans font-semibold">
        <p class="text-gray-500 text-sm font-sans font-semibold leading-relaxed">Add staff to the roster (no login). Then import attendance .dat; records will match by Bio ID.</p>
        <form class="flex gap-2 flex-wrap items-end" @submit.prevent="addRow">
          <div class="flex-1 min-w-[120px]">
            <Label for-id="add-fullName" class="text-gray-700 font-sans font-semibold">Full name</Label>
            <Input id="add-fullName" v-model="formFullName" placeholder="Jane Doe" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
          </div>
          <div class="w-24">
            <Label for-id="add-bioId" class="text-gray-700 font-sans font-semibold">Bio ID</Label>
            <Input id="add-bioId" v-model="formBioId" placeholder="1" class="font-sans font-semibold focus:border-[#003777] focus:ring-[#003777]" />
          </div>
          <Button type="submit" variant="primary" class="bg-[#003777] text-white hover:bg-[#003777]/90 font-sans font-semibold" :disabled="!formBioId.trim()">
            Add
          </Button>
        </form>
        <div v-if="pendingRows.length" class="border border-gray-200 rounded overflow-hidden bg-white">
          <table class="w-full text-sm text-left">
            <thead class="bg-[#003777]">
              <tr>
                <th class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-semibold px-3 py-2 text-left">Full name</th>
                <th class="text-white text-[9px] tracking-[0.25em] uppercase font-sans font-semibold px-3 py-2 text-left">Bio ID</th>
                <th class="w-10 bg-[#003777]"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in pendingRows" :key="i" class="border-b border-gray-100 last:border-b-0">
                <td class="px-3 py-2 text-gray-900 font-semibold">{{ row.fullName || '—' }}</td>
                <td class="px-3 py-2 font-mono text-xs text-gray-500 font-semibold">{{ row.bioId }}</td>
                <td class="px-3 py-2">
                  <button type="button" class="text-gray-400 hover:text-[#550000] text-sm transition-colors" aria-label="Remove" @click="removeRow(i)">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="listError" class="text-[#550000] text-sm font-sans font-semibold">{{ listError }}</p>
        <p v-if="listSuccess" class="text-gray-900 text-sm font-sans font-semibold">{{ listSuccess }}</p>
        <div class="flex gap-2">
          <Button variant="outline" class="font-sans font-semibold border-gray-300 text-gray-700 hover:bg-gray-50" @click="showListModal = false">Cancel</Button>
          <Button variant="primary" class="bg-[#003777] text-white hover:bg-[#003777]/90 font-sans font-semibold" :disabled="listSaving || !pendingRows.length" @click="submitList">
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
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)

const editId = ref(null)
const editFullName = ref('')
const editBioId = ref('')
const editError = ref('')
const editSaving = ref(false)

const deleteTarget = ref(null)
const deleteError = ref('')
const deleteSaving = ref(false)

const showProfileEditModal = ref(false)
const showProfileDeleteConfirm = ref(false)
const profileEditId = ref(null)
const profileEditFullName = ref('')
const profileEditBioId = ref('')
const profileEditEmail = ref('')
const profileEditProgram = ref('')
const profileEditError = ref('')
const profileEditSaving = ref(false)
const profileDeleteTarget = ref(null)
const profileDeleteError = ref('')
const profileDeleteSaving = ref(false)

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
  { key: 'actions', label: '' },
]

const rosterColumns = [
  { key: 'full_name', label: 'Name' },
  { key: 'bio_id', label: 'Bio ID' },
  { key: 'actions', label: '' },
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
  if (!pendingRows.value.length) {
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

function openEditModal(row) {
  editId.value = row.id
  editFullName.value = row.full_name ?? ''
  editBioId.value = row.bio_id ?? ''
  editError.value = ''
  showEditModal.value = true
}

async function saveEdit() {
  if (!editId.value || !editBioId.value.trim()) return
  editError.value = ''
  editSaving.value = true
  const result = await staff.updateStaff(editId.value, { full_name: editFullName.value.trim(), bio_id: editBioId.value.trim() })
  editSaving.value = false
  if (result.ok) {
    showEditModal.value = false
  } else {
    editError.value = result.error || 'Failed to update.'
  }
}

function confirmDelete(row) {
  deleteTarget.value = row
  deleteError.value = ''
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deleteTarget.value?.id) return
  deleteError.value = ''
  deleteSaving.value = true
  const result = await staff.deleteStaff(deleteTarget.value.id)
  deleteSaving.value = false
  if (result.ok) {
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } else {
    deleteError.value = result.error || 'Failed to delete.'
  }
}

function openProfileEditModal(row) {
  profileEditId.value = row.id
  profileEditFullName.value = row.full_name ?? ''
  profileEditBioId.value = row.bio_id ?? ''
  profileEditEmail.value = row.email ?? ''
  profileEditProgram.value = row.program ?? ''
  profileEditError.value = ''
  showProfileEditModal.value = true
}

async function saveProfileEdit() {
  if (!profileEditId.value || !profileEditFullName.value.trim()) return
  profileEditError.value = ''
  profileEditSaving.value = true
  const result = await employees.updateProfile(profileEditId.value, {
    full_name: profileEditFullName.value.trim(),
    bio_id: profileEditBioId.value.trim() || null,
    email: profileEditEmail.value.trim() || null,
    program: profileEditProgram.value || null,
  })
  profileEditSaving.value = false
  if (result.ok) {
    showProfileEditModal.value = false
  } else {
    profileEditError.value = result.error || 'Failed to update.'
  }
}

function confirmProfileDelete(row) {
  profileDeleteTarget.value = row
  profileDeleteError.value = ''
  showProfileDeleteConfirm.value = true
}

async function doProfileDelete() {
  if (!profileDeleteTarget.value?.id) return
  profileDeleteError.value = ''
  profileDeleteSaving.value = true
  const result = await employees.deleteProfile(profileDeleteTarget.value.id)
  profileDeleteSaving.value = false
  if (result.ok) {
    showProfileDeleteConfirm.value = false
    profileDeleteTarget.value = null
  } else {
    profileDeleteError.value = result.error || 'Failed to delete account.'
  }
}
</script>

<style scoped>
:deep(th) {
  background-color: #003777 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
}

:deep(td) {
  font-weight: 600 !important;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
}
</style>