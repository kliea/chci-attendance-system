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
          <td class="px-4 py-3 text-sm">
            <button type="button" class="text-anito-black hover:underline mr-3" @click="openProfileEditModal(row)">Edit</button>
            <button type="button" class="text-red-600 hover:underline" @click="confirmProfileDelete(row)">Delete</button>
          </td>
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
          <td class="px-4 py-3 text-sm">
            <button type="button" class="text-anito-black hover:underline mr-3" @click="openEditModal(row)">Edit</button>
            <button type="button" class="text-red-600 hover:underline" @click="confirmDelete(row)">Delete</button>
          </td>
        </template>
        <template #empty>
          <EmptyState icon="📋" title="No staff yet" subtitle="Add staff (Full name + Bio ID), then import attendance .dat." />
        </template>
      </DataTable>
    </Card>

    <Dialog v-model="showEditModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Edit staff</h2>
      </template>
      <form class="space-y-4" @submit.prevent="saveEdit">
        <div>
          <Label for-id="edit-fullName">Full name</Label>
          <Input id="edit-fullName" v-model="editFullName" placeholder="Jane Doe" />
        </div>
        <div>
          <Label for-id="edit-bioId">Bio ID</Label>
          <Input id="edit-bioId" v-model="editBioId" placeholder="1" />
        </div>
        <p v-if="editError" class="text-red-600 text-sm">{{ editError }}</p>
        <div class="flex gap-2">
          <Button type="button" variant="outline" @click="showEditModal = false">Cancel</Button>
          <Button type="submit" variant="primary" :disabled="editSaving || !editBioId.trim()">Save</Button>
        </div>
      </form>
    </Dialog>

    <Dialog v-model="showDeleteConfirm" max-width="max-w-sm">
      <template #header>
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Remove from roster</h2>
      </template>
      <div class="space-y-4">
        <p class="text-anito-gray text-sm font-sans font-light leading-relaxed">
          Remove <strong>{{ deleteTarget?.full_name }}</strong> (Bio ID {{ deleteTarget?.bio_id }}) from the staff roster? Attendance records for this staff will be deleted.
        </p>
        <p v-if="deleteError" class="text-red-600 text-sm">{{ deleteError }}</p>
        <div class="flex gap-2">
          <Button variant="outline" @click="showDeleteConfirm = false">Cancel</Button>
          <Button variant="primary" class="bg-red-600 hover:bg-red-700" :disabled="deleteSaving" @click="doDelete">Remove</Button>
        </div>
      </div>
    </Dialog>

    <Dialog v-model="showProfileEditModal" max-width="max-w-lg">
      <template #header>
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Edit employee</h2>
      </template>
      <form class="space-y-4" @submit.prevent="saveProfileEdit">
        <div>
          <Label for-id="profile-edit-fullName">Full name</Label>
          <Input id="profile-edit-fullName" v-model="profileEditFullName" placeholder="Jane Doe" />
        </div>
        <div>
          <Label for-id="profile-edit-bioId">Bio ID</Label>
          <Input id="profile-edit-bioId" v-model="profileEditBioId" placeholder="1" />
        </div>
        <div>
          <Label for-id="profile-edit-email">Email</Label>
          <Input id="profile-edit-email" v-model="profileEditEmail" type="email" placeholder="jane@example.com" />
        </div>
        <div>
          <Label for-id="profile-edit-program">Program</Label>
          <select id="profile-edit-program" v-model="profileEditProgram" class="w-full rounded border border-anito-gray-light px-3 py-2 text-sm font-sans text-anito-black focus:outline-none focus:ring-2 focus:ring-anito-black">
            <option value="">—</option>
            <option value="CS">CS</option>
            <option value="IS">IS</option>
            <option value="IT">IT</option>
          </select>
        </div>
        <div>
          <Label for-id="profile-edit-role">Role</Label>
          <select id="profile-edit-role" v-model="profileEditRole" class="w-full rounded border border-anito-gray-light px-3 py-2 text-sm font-sans text-anito-black focus:outline-none focus:ring-2 focus:ring-anito-black">
            <option value="employee">Employee</option>
            <option value="supervisor">Supervisor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p v-if="profileEditError" class="text-red-600 text-sm">{{ profileEditError }}</p>
        <div class="flex gap-2">
          <Button type="button" variant="outline" @click="showProfileEditModal = false">Cancel</Button>
          <Button type="submit" variant="primary" :disabled="profileEditSaving || !profileEditFullName.trim()">Save</Button>
        </div>
      </form>
    </Dialog>

    <Dialog v-model="showProfileDeleteConfirm" max-width="max-w-sm">
      <template #header>
        <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Remove employee account</h2>
      </template>
      <div class="space-y-4">
        <p class="text-anito-gray text-sm font-sans font-light leading-relaxed">
          Permanently remove <strong>{{ profileDeleteTarget?.full_name }}</strong> ({{ profileDeleteTarget?.email || profileDeleteTarget?.bio_id }})? Their login will be deleted and they will no longer have access.
        </p>
        <p v-if="profileDeleteError" class="text-red-600 text-sm">{{ profileDeleteError }}</p>
        <div class="flex gap-2">
          <Button variant="outline" @click="showProfileDeleteConfirm = false">Cancel</Button>
          <Button variant="primary" class="bg-red-600 hover:bg-red-700" :disabled="profileDeleteSaving" @click="doProfileDelete">Remove account</Button>
        </div>
      </div>
    </Dialog>

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
const profileEditRole = ref('employee')
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
  profileEditRole.value = row.role ?? 'employee'
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
    role: profileEditRole.value,
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
