/**
 * List all public tables in the remote Supabase database.
 * Uses PostgREST OpenAPI spec (no DB password required).
 *
 * Usage: node scripts/list-tables.js
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const restRoot = `${url.replace(/\/$/, '')}/rest/v1/`

async function listTables() {
  const res = await fetch(restRoot, {
    headers: {
      Accept: 'application/openapi+json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  })

  if (!res.ok) {
    console.error(`Failed to fetch OpenAPI spec: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const spec = await res.json()

  // OpenAPI 3: paths are like /table_name, /table_name?select=...
  // Swagger 2: paths are like /table_name
  const paths = spec.paths || {}
  const tableNames = new Set()

  for (const path of Object.keys(paths)) {
    // Strip query params and leading slash; first segment is usually the table
    const segment = path.replace(/\?.*$/, '').replace(/^\/+/, '').split('/')[0]
    if (segment && segment !== 'rpc' && segment !== '') {
      tableNames.add(segment)
    }
  }

  const tables = [...tableNames].sort()
  console.log('Public tables in Supabase:\n')
  tables.forEach((t) => console.log(`  - ${t}`))
  console.log(`\nTotal: ${tables.length} table(s)`)
}

listTables().catch((err) => {
  console.error(err)
  process.exit(1)
})
