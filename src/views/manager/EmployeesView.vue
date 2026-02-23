<template>
  <div class="max-w-4xl">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display font-light text-xl tracking-wide text-anito-black">Employees</h1>
        <p class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed">Staff roster (no login required) for attendance. Add from list by Bio ID + Name, then import .dat. Optionally register users for login.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium"
          @click="openListModal"
        >
          Add from list
        </button>
        <button
          type="button"
          class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150 font-sans font-medium"
          @click="openRegisterModal"
        >
          Register user
        </button>
        <button
          type="button"
          class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded hover:border-anito-blue-mid hover:text-anito-blue-mid transition-colors duration-150 font-sans font-medium"
          @click="openBulkModal"
        >
          Bulk create
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
              <td colspan="4" class="px-4 py-12 text-center text-anito-gray text-sm font-sans font-light">No registered employees. Use Register user or Bulk create.</td>
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
                <p class="text-sm text-anito-gray font-sans font-light mt-1">Add from list (Bio ID + Name), then import attendance .dat.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Register user modal -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="showRegisterModal = false"
    >
      <div class="bg-anito-white rounded-lg shadow-xl max-w-md w-full mx-auto mt-24 p-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Register user</h2>
          <button type="button" class="text-anito-gray hover:text-anito-black transition-colors duration-150" aria-label="Close" @click="showRegisterModal = false">✕</button>
        </div>
        <form class="space-y-4" @submit.prevent="submitRegister">
          <div>
            <label for="reg-name" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2">Full name</label>
            <input
              id="reg-name"
              v-model="registerForm.fullName"
              type="text"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label for="reg-bio" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2">Bio ID</label>
            <input
              id="reg-bio"
              v-model="registerForm.bioId"
              type="text"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              placeholder="Device PIN (for attendance import)"
            />
          </div>
          <div>
            <label for="reg-email" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2">Email (optional)</label>
            <input
              id="reg-email"
              v-model="registerForm.email"
              type="email"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              placeholder="Defaults to bio_id@klinth.local"
            />
          </div>
          <div>
            <label for="reg-program" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2">Program</label>
            <select
              id="reg-program"
              v-model="registerForm.program"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
            >
              <option value="">—</option>
              <option value="CS">CS</option>
              <option value="IS">IS</option>
              <option value="IT">IT</option>
            </select>
          </div>
          <div>
            <label for="reg-password" class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2">Password (optional)</label>
            <input
              id="reg-password"
              v-model="registerForm.password"
              type="password"
              minlength="6"
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <p class="text-anito-gray text-xs font-sans font-light">Role is set to <strong class="text-anito-black">employee</strong> automatically. After creating, share the email and temporary password with the user. They must click the confirmation link sent to their email, then sign in with that password.</p>
          <p v-if="registerError" class="text-red-600 text-sm">{{ registerError }}</p>
          <p v-if="registerSuccess" class="text-anito-black text-sm">{{ registerSuccess }}</p>
          <div class="flex gap-2 pt-2">
            <button type="button" class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium" @click="showRegisterModal = false">Cancel</button>
            <button type="submit" class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50" :disabled="registerSaving">
              {{ registerSaving ? 'Creating…' : 'Create user' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add from list modal (Bio ID + Name → staff only, no account) -->
    <div
      v-if="showListModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="showListModal = false"
    >
      <div class="bg-anito-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col mx-auto mt-24 p-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Add from list</h2>
          <button type="button" class="text-anito-gray hover:text-anito-black transition-colors duration-150" aria-label="Close" @click="showListModal = false">✕</button>
        </div>
        <div class="overflow-y-auto flex-1 space-y-4">
          <p class="text-anito-gray text-sm font-sans font-light leading-relaxed">Paste lines: <strong class="text-anito-black">Bio ID</strong> and <strong class="text-anito-black">Name</strong> (tab or space separated). Adds to the staff roster only (no login). Then import attendance .dat; records will match by Bio ID.</p>
          <textarea
            v-model="listPaste"
            rows="14"
            class="w-full px-4 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-mono text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
            placeholder="17	Lesley\n18	Ian\n19	Earl\n..."
          />
          <p v-if="listError" class="text-red-600 text-sm">{{ listError }}</p>
          <p v-if="listSuccess" class="text-anito-black text-sm">{{ listSuccess }}</p>
          <div class="flex gap-2">
            <button type="button" class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium" @click="showListModal = false">Cancel</button>
            <button type="button" class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50" :disabled="listSaving || !listParsed.length" @click="submitList">
              Add {{ listParsed.length }} to roster
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk create modal -->
    <div
      v-if="showBulkModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="showBulkModal = false"
    >
      <div class="bg-anito-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col mx-auto mt-24 p-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="font-display font-light text-2xl tracking-wide text-anito-black mb-1">Bulk create</h2>
          <button type="button" class="text-anito-gray hover:text-anito-black transition-colors duration-150" aria-label="Close" @click="showBulkModal = false">✕</button>
        </div>
        <div class="overflow-y-auto flex-1">
          <div class="text-anito-gray text-sm font-sans font-light mb-3 space-y-1 leading-relaxed">
            <p><strong class="text-anito-black">Email required:</strong> Each row needs an <strong>email</strong> so Supabase can send the confirmation link. Add Name and Bio ID as needed. We create one user every few seconds to avoid rate limits.</p>
            <p><strong class="text-anito-black">After:</strong> Tell each user to check their email, click the confirmation link, then sign in with the temporary password you share.</p>
          </div>
          <div class="space-y-2 mb-4">
            <div
              v-for="(row, i) in bulkRows"
              :key="i"
              class="flex gap-2 items-center flex-wrap"
            >
              <input
                v-model="row.email"
                type="email"
                required
                class="min-w-[180px] flex-1 px-4 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
                placeholder="Email *"
              />
              <input
                v-model="row.fullName"
                type="text"
                class="flex-1 min-w-[100px] px-4 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
                placeholder="Name"
              />
              <input
                v-model="row.bioId"
                type="text"
                class="w-20 px-4 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none transition-colors"
                placeholder="Bio ID"
              />
              <select
                v-model="row.program"
                class="w-16 px-2 py-3 border border-anito-gray-light rounded bg-transparent text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none transition-colors"
              >
                <option value="">—</option>
                <option value="CS">CS</option>
                <option value="IS">IS</option>
                <option value="IT">IT</option>
              </select>
              <button type="button" class="text-anito-gray hover:text-red-600 text-sm transition-colors duration-150 font-sans font-light" aria-label="Remove row" @click="bulkRows.splice(i, 1)">Remove</button>
            </div>
          </div>
          <button type="button" class="text-anito-blue-mid text-sm font-sans font-medium hover:text-anito-blue-deep transition-colors duration-150" @click="bulkRows.push({ email: '', fullName: '', bioId: '', program: '' })">+ Add row</button>
          <p v-if="bulkError" class="text-red-600 text-sm mt-2">{{ bulkError }}</p>
          <div v-if="bulkResults.length" class="mt-4 space-y-2 text-sm">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-sans font-medium text-anito-black">Results</p>
              <button
                v-if="bulkResults.some(r => r.result.ok && r.result.password)"
                type="button"
                class="text-anito-blue-mid text-xs font-sans font-medium hover:underline transition-colors"
                @click="copyBulkCredentials"
              >
                Copy credentials (email + password)
              </button>
            </div>
            <p v-if="bulkCopyFeedback" class="text-anito-gray text-xs font-sans font-light">{{ bulkCopyFeedback }}</p>
            <p v-for="(r, i) in bulkResults" :key="i" :class="r.result.ok ? 'text-anito-black font-sans font-light' : 'text-red-600 font-sans font-light'">
              {{ r.fullName || r.bioId || 'Row ' + (i + 1) }}: {{ r.result.ok ? 'Created' : r.result.error }}
              <span v-if="r.result.ok" class="text-anito-gray"> — {{ r.result.email }}</span>
              <span v-if="r.result.ok && r.result.password" class="text-anito-gray"> · Password: {{ r.result.password }}</span>
            </p>
          </div>
          <p v-if="bulkSaving && bulkResults.length < bulkRows.filter(r => r.email.trim()).length" class="text-anito-gray text-xs font-sans font-light mt-2">
            Creating {{ bulkResults.length + 1 }} of {{ bulkRows.filter(r => r.email.trim()).length }} (spacing requests to avoid rate limits)…
          </p>
          <div class="flex gap-2 pt-4">
            <button type="button" class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium disabled:opacity-50" :disabled="bulkSaving" @click="closeBulkModal">Cancel</button>
            <button type="button" class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50 disabled:cursor-not-allowed" :disabled="bulkSaving || !bulkRows.some(r => r.email.trim())" @click="submitBulk">
              {{ bulkSaving ? 'Creating…' : 'Create all' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStaffStore } from '@/stores/staff.js'
import { useEmployeesStore } from '@/stores/employees.js'

const staff = useStaffStore()
const employees = useEmployeesStore()

const DEFAULT_LIST_PASTE = `17	Lesley
18	Ian
19	Earl
20	Dave
21	Maria
22	Kristine
23	Leo
24	Law
25	Edrian
26	Vicryl
27	Pablo
28	Abonales
29	Corpin
30	Isiderio
31	Pacana
32	Guilbert
33	Roberto
34	Hanz
37	Mark`

const showRegisterModal = ref(false)
const showListModal = ref(false)
const showBulkModal = ref(false)

const registerForm = reactive({ fullName: '', bioId: '', email: '', password: '', program: '' })
const registerError = ref('')
const registerSuccess = ref('')
const registerSaving = ref(false)

const listPaste = ref(DEFAULT_LIST_PASTE)
const listError = ref('')
const listSuccess = ref('')
const listSaving = ref(false)

const employeeProfiles = computed(() =>
  employees.list.filter((p) => p.role === 'employee')
)

const listParsed = computed(() => {
  const lines = (listPaste.value || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const out = []
  for (const line of lines) {
    const parts = line.split(/[\t\s]+/)
    if (parts.length >= 2) {
      out.push({ bioId: parts[0].trim(), fullName: parts.slice(1).join(' ').trim() })
    } else if (parts.length === 1 && parts[0]) {
      out.push({ bioId: parts[0].trim(), fullName: '' })
    }
  }
  return out
})

const bulkRows = ref([{ email: '', fullName: '', bioId: '', program: '' }])
const bulkError = ref('')
const bulkResults = ref([])
const bulkSaving = ref(false)
const bulkCopyFeedback = ref('')

onMounted(async () => {
  await Promise.all([staff.fetchStaff(), employees.fetchEmployees()])
})

function openRegisterModal() {
  registerForm.fullName = ''
  registerForm.bioId = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.program = ''
  registerError.value = ''
  registerSuccess.value = ''
  showRegisterModal.value = true
}

function openListModal() {
  listPaste.value = DEFAULT_LIST_PASTE
  listError.value = ''
  listSuccess.value = ''
  showListModal.value = true
}

function openBulkModal() {
  bulkRows.value = [{ email: '', fullName: '', bioId: '', program: '' }]
  bulkError.value = ''
  bulkResults.value = []
  bulkCopyFeedback.value = ''
  showBulkModal.value = true
}

function closeBulkModal() {
  showBulkModal.value = false
  staff.fetchStaff()
}

async function copyBulkCredentials() {
  const lines = bulkResults.value
    .filter((r) => r.result.ok && r.result.email)
    .map((r) => {
      const name = (r.fullName || r.bioId || 'User').trim()
      const email = r.result.email
      const password = r.result.password ? r.result.password : '(set by user)'
      return `${name}\t${email}\t${password}`
    })
  if (!lines.length) return
  const header = 'Name\tEmail\tTemporary password'
  const text = [header, ...lines].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    bulkError.value = ''
    bulkCopyFeedback.value = 'Copied. Paste into a spreadsheet or secure message.'
    setTimeout(() => { bulkCopyFeedback.value = '' }, 3000)
  } catch (e) {
    bulkCopyFeedback.value = 'Copy failed. Manually copy from the list above.'
  }
}

async function submitRegister() {
  registerError.value = ''
  registerSuccess.value = ''
  registerSaving.value = true
  const result = await employees.createEmployee({
    fullName: registerForm.fullName.trim(),
    bioId: registerForm.bioId.trim() || null,
    email: registerForm.email.trim() || null,
    password: registerForm.password || null,
    program: registerForm.program || null,
  })
  registerSaving.value = false
  if (result.ok) {
    let msg = `User created. Share with them: email ${result.email}`
    if (result.password) {
      msg += ` and temporary password: ${result.password}`
    }
    msg += `. They must click the confirmation link in their email, then sign in with these.`
    registerSuccess.value = msg
    await employees.fetchEmployees()
  } else {
    registerError.value = result.error || 'Failed to create user.'
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const BULK_DELAY_MS = 2500

async function submitList() {
  const rows = listParsed.value
  if (!rows.length) {
    listError.value = 'Paste at least one line with Bio ID and Name (tab or space separated).'
    return
  }
  listError.value = ''
  listSuccess.value = ''
  listSaving.value = true
  const result = await staff.addFromList(rows)
  listSaving.value = false
  if (result.ok) {
    listSuccess.value = `Added ${rows.length} to staff roster. You can now import attendance .dat; records will match by Bio ID.`
  } else {
    listError.value = result.error || 'Failed to add.'
  }
}

async function submitBulk() {
  const rows = bulkRows.value.filter((r) => (r.email || '').trim()).map((r) => ({
    email: (r.email || '').trim(),
    fullName: (r.fullName || '').trim(),
    bioId: (r.bioId || '').trim() || null,
    program: (r.program || '').trim() || null,
  }))
  if (!rows.length) {
    bulkError.value = 'Add at least one row with an email.'
    return
  }
  bulkError.value = ''
  bulkResults.value = []
  bulkSaving.value = true
  for (let i = 0; i < rows.length; i++) {
    if (i > 0) await delay(BULK_DELAY_MS)
    const row = rows[i]
    const result = await employees.createEmployee({
      fullName: row.fullName || row.email.split('@')[0],
      bioId: row.bioId,
      email: row.email,
      password: null,
      program: row.program || null,
    })
    bulkResults.value.push({ ...row, result })
  }
  bulkSaving.value = false
  await employees.fetchEmployees()
}
</script>
