<template>
  <div class="p-6 max-w-4xl">
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-ink text-xl font-semibold tracking-tight">Employees</h1>
        <p class="text-muted text-sm mt-1">Staff roster (no login required) for attendance. Add from list by Bio ID + Name, then import .dat. Optionally register users for login.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          type="button"
          class="px-4 py-2 bg-accent text-surface text-sm font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent"
          @click="openListModal"
        >
          Add from list
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-border text-ink text-sm font-medium rounded hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          @click="openRegisterModal"
        >
          Register user
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-border text-ink text-sm font-medium rounded hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          @click="openBulkModal"
        >
          Bulk create
        </button>
      </div>
    </header>

    <section class="bg-panel border border-border rounded-lg overflow-hidden">
      <div v-if="staff.loading" class="p-8 text-center text-muted text-sm">Loading…</div>
      <div v-else-if="staff.error" class="p-4 text-danger text-sm">{{ staff.error }}</div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-surface/50 border-b border-border">
            <tr>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Name</th>
              <th class="px-4 py-2 font-medium text-muted text-xs uppercase tracking-wider">Bio ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in staff.list"
              :key="s.id"
              class="border-b border-border hover:bg-surface/30"
            >
              <td class="px-4 py-2 text-ink">{{ s.full_name }}</td>
              <td class="px-4 py-2 text-muted">{{ s.bio_id || '—' }}</td>
            </tr>
            <tr v-if="!staff.list.length">
              <td colspan="2" class="px-4 py-6 text-center text-muted text-sm">No staff yet. Add from list (Bio ID + Name), then import attendance .dat.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Register user modal -->
    <div
      v-if="showRegisterModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-ink/50"
      @click.self="showRegisterModal = false"
    >
      <div class="bg-panel border border-border rounded-lg shadow-lg w-full max-w-md">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 class="font-display text-ink font-medium">Register user</h2>
          <button type="button" class="text-muted hover:text-ink" aria-label="Close" @click="showRegisterModal = false">✕</button>
        </div>
        <form class="p-4 space-y-3" @submit.prevent="submitRegister">
          <div>
            <label for="reg-name" class="block text-sm font-medium text-muted mb-1">Full name</label>
            <input
              id="reg-name"
              v-model="registerForm.fullName"
              type="text"
              required
              class="w-full px-3 py-2 bg-surface border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label for="reg-bio" class="block text-sm font-medium text-muted mb-1">Bio ID</label>
            <input
              id="reg-bio"
              v-model="registerForm.bioId"
              type="text"
              class="w-full px-3 py-2 bg-surface border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Device PIN (for attendance import)"
            />
          </div>
          <div>
            <label for="reg-email" class="block text-sm font-medium text-muted mb-1">Email (optional)</label>
            <input
              id="reg-email"
              v-model="registerForm.email"
              type="email"
              class="w-full px-3 py-2 bg-surface border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Defaults to bio_id@klinth.local"
            />
          </div>
          <div>
            <label for="reg-password" class="block text-sm font-medium text-muted mb-1">Password (optional)</label>
            <input
              id="reg-password"
              v-model="registerForm.password"
              type="password"
              minlength="6"
              class="w-full px-3 py-2 bg-surface border border-border rounded text-ink placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <p class="text-muted text-xs">Role is set to <strong>employee</strong> automatically. After creating, share the email and temporary password with the user. They must click the confirmation link sent to their email, then sign in with that password.</p>
          <p v-if="registerError" class="text-danger text-sm">{{ registerError }}</p>
          <p v-if="registerSuccess" class="text-ink text-sm">{{ registerSuccess }}</p>
          <div class="flex gap-2 pt-2">
            <button type="button" class="px-3 py-1.5 border border-border rounded text-muted hover:text-ink text-sm" @click="showRegisterModal = false">Cancel</button>
            <button type="submit" class="px-4 py-1.5 bg-accent text-surface text-sm font-medium rounded hover:opacity-90" :disabled="registerSaving">
              {{ registerSaving ? 'Creating…' : 'Create user' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add from list modal (Bio ID + Name → staff only, no account) -->
    <div
      v-if="showListModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-ink/50"
      @click.self="showListModal = false"
    >
      <div class="bg-panel border border-border rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 class="font-display text-ink font-medium">Add from list</h2>
          <button type="button" class="text-muted hover:text-ink" aria-label="Close" @click="showListModal = false">✕</button>
        </div>
        <div class="p-4 overflow-y-auto flex-1 space-y-3">
          <p class="text-muted text-sm">Paste lines: <strong>Bio ID</strong> and <strong>Name</strong> (tab or space separated). Adds to the staff roster only (no login). Then import attendance .dat; records will match by Bio ID.</p>
          <textarea
            v-model="listPaste"
            rows="14"
            class="w-full px-3 py-2 bg-surface border border-border rounded text-ink text-sm font-mono placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="17	Lesley\n18	Ian\n19	Earl\n..."
          />
          <p v-if="listError" class="text-danger text-sm">{{ listError }}</p>
          <p v-if="listSuccess" class="text-ink text-sm">{{ listSuccess }}</p>
          <div class="flex gap-2">
            <button type="button" class="px-3 py-1.5 border border-border rounded text-muted hover:text-ink text-sm" @click="showListModal = false">Cancel</button>
            <button type="button" class="px-4 py-1.5 bg-accent text-surface text-sm font-medium rounded hover:opacity-90" :disabled="listSaving || !listParsed.length" @click="submitList">
              Add {{ listParsed.length }} to roster
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk create modal -->
    <div
      v-if="showBulkModal"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-ink/50"
      @click.self="showBulkModal = false"
    >
      <div class="bg-panel border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 class="font-display text-ink font-medium">Bulk create</h2>
          <button type="button" class="text-muted hover:text-ink" aria-label="Close" @click="showBulkModal = false">✕</button>
        </div>
        <div class="p-4 overflow-y-auto flex-1">
          <div class="text-muted text-sm mb-3 space-y-1">
            <p><strong class="text-ink">Email required:</strong> Each row needs an <strong>email</strong> so Supabase can send the confirmation link. Add Name and Bio ID as needed. We create one user every few seconds to avoid rate limits.</p>
            <p><strong class="text-ink">After:</strong> Tell each user to check their email, click the confirmation link, then sign in with the temporary password you share.</p>
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
                class="min-w-[180px] flex-1 px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Email *"
              />
              <input
                v-model="row.fullName"
                type="text"
                class="flex-1 min-w-[100px] px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Name"
              />
              <input
                v-model="row.bioId"
                type="text"
                class="w-20 px-3 py-1.5 bg-surface border border-border rounded text-ink text-sm placeholder-muted focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Bio ID"
              />
              <button type="button" class="text-muted hover:text-danger text-sm" aria-label="Remove row" @click="bulkRows.splice(i, 1)">Remove</button>
            </div>
          </div>
          <button type="button" class="text-accent text-sm font-medium" @click="bulkRows.push({ email: '', fullName: '', bioId: '' })">+ Add row</button>
          <p v-if="bulkError" class="text-danger text-sm mt-2">{{ bulkError }}</p>
          <div v-if="bulkResults.length" class="mt-4 space-y-2 text-sm">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-medium text-ink">Results</p>
              <button
                v-if="bulkResults.some(r => r.result.ok && r.result.password)"
                type="button"
                class="text-accent text-xs font-medium hover:underline"
                @click="copyBulkCredentials"
              >
                Copy credentials (email + password)
              </button>
            </div>
            <p v-if="bulkCopyFeedback" class="text-muted text-xs">{{ bulkCopyFeedback }}</p>
            <p v-for="(r, i) in bulkResults" :key="i" :class="r.result.ok ? 'text-ink' : 'text-danger'">
              {{ r.fullName || r.bioId || 'Row ' + (i + 1) }}: {{ r.result.ok ? 'Created' : r.result.error }}
              <span v-if="r.result.ok" class="text-muted"> — {{ r.result.email }}</span>
              <span v-if="r.result.ok && r.result.password" class="text-muted"> · Password: {{ r.result.password }}</span>
            </p>
          </div>
          <p v-if="bulkSaving && bulkResults.length < bulkRows.filter(r => r.email.trim()).length" class="text-muted text-xs mt-2">
            Creating {{ bulkResults.length + 1 }} of {{ bulkRows.filter(r => r.email.trim()).length }} (spacing requests to avoid rate limits)…
          </p>
          <div class="flex gap-2 pt-4">
            <button type="button" class="px-3 py-1.5 border border-border rounded text-muted hover:text-ink text-sm" :disabled="bulkSaving" @click="closeBulkModal">Cancel</button>
            <button type="button" class="px-4 py-1.5 bg-accent text-surface text-sm font-medium rounded hover:opacity-90" :disabled="bulkSaving || !bulkRows.some(r => r.email.trim())" @click="submitBulk">
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

const registerForm = reactive({ fullName: '', bioId: '', email: '', password: '' })
const registerError = ref('')
const registerSuccess = ref('')
const registerSaving = ref(false)

const listPaste = ref(DEFAULT_LIST_PASTE)
const listError = ref('')
const listSuccess = ref('')
const listSaving = ref(false)

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

const bulkRows = ref([{ email: '', fullName: '', bioId: '' }])
const bulkError = ref('')
const bulkResults = ref([])
const bulkSaving = ref(false)
const bulkCopyFeedback = ref('')

onMounted(() => staff.fetchStaff())

function openRegisterModal() {
  registerForm.fullName = ''
  registerForm.bioId = ''
  registerForm.email = ''
  registerForm.password = ''
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
  bulkRows.value = [{ email: '', fullName: '', bioId: '' }]
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
    })
    bulkResults.value.push({ ...row, result })
  }
  bulkSaving.value = false
  await employees.fetchEmployees()
}
</script>
