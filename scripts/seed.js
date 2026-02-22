/**
 * Klinth seed script — creates test Auth users + profiles and optional holidays.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (never commit the key).
 *
 * Run: node scripts/seed.js
 * Or:  npm run seed
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

async function seed() {
  console.log('Seeding...')

  const managerEmail = process.env.SEED_MANAGER_EMAIL || 'manager@klinth.local'
  const managerPassword = process.env.SEED_MANAGER_PASSWORD || 'password123'
  const managerName = process.env.SEED_MANAGER_NAME || 'Test Manager'

  const employeeEmail = process.env.SEED_EMPLOYEE_EMAIL || 'employee@klinth.local'
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD || 'password123'
  const employeeName = process.env.SEED_EMPLOYEE_NAME || 'Test Employee'

  const { data: managerUser, error: managerError } = await supabase.auth.admin.createUser({
    email: managerEmail,
    password: managerPassword,
    email_confirm: true,
    user_metadata: { full_name: managerName },
  })

  if (managerError) {
    if (managerError.message?.includes('already been registered')) {
      console.log('Manager user already exists:', managerEmail)
    } else {
      console.error('Manager create error:', managerError.message)
    }
  } else if (managerUser?.user) {
    console.log('Created manager:', managerEmail)
    const { error: profileError } = await supabase.from('profiles').update({ role: 'manager', full_name: managerName }).eq('id', managerUser.user.id)
    if (profileError) console.error('Update manager profile:', profileError.message)
  }

  const { data: employeeUser, error: employeeError } = await supabase.auth.admin.createUser({
    email: employeeEmail,
    password: employeePassword,
    email_confirm: true,
    user_metadata: { full_name: employeeName },
  })

  if (employeeError) {
    if (employeeError.message?.includes('already been registered')) {
      console.log('Employee user already exists:', employeeEmail)
    } else {
      console.error('Employee create error:', employeeError.message)
    }
  } else if (employeeUser?.user) {
    console.log('Created employee:', employeeEmail)
  }

  const { error: holidaysError } = await supabase.from('holidays').upsert(
    [
      { date: '2025-01-01', name: "New Year's Day", type: 'regular' },
      { date: '2025-12-25', name: 'Christmas Day', type: 'regular' },
    ],
    { onConflict: 'date' }
  )
  if (holidaysError) console.error('Holidays:', holidaysError.message)
  else console.log('Holidays upserted.')

  console.log('Done.')
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
