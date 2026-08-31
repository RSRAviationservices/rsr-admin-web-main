#!/usr/bin/env node
/**
 * Bulk Product Uploader
 * Requires Node.js 18+ (uses native fetch)
 *
 * Usage:
 *   node bulk-upload-products.mjs \
 *     --url https://your-api.aws.com/api/v1 \
 *     --email admin@example.com \
 *     --password yourpassword \
 *     --file products.csv
 *
 * CSV columns (comma-separated, use ; for multi-value fields):
 *   name, partNumber, brand, description, categorySlug, subcategorySlug,
 *   tags                      — semicolon-separated: tag1;tag2
 *   applications              — semicolon-separated: app1;app2
 *   specifications            — semicolon-separated key=value pairs: Voltage=12V;Weight=500g
 *   availability_status       — in-stock | limited | lead-time | quote-only
 *   availability_leadTime, availability_minimumQuantity, availability_allowAlternatives,
 *   storage_temperatureControlled, storage_hazmat, storage_shelfLife, storage_storageInstructions,
 *   compliance_certifications, compliance_hasCoC, compliance_hasSDS, compliance_hasTDS, compliance_militarySpec,
 *   isActive
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { argv, exit } from 'node:process'

// ─── Arg Parsing ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1] ?? true
      i++
    }
  }
  return args
}

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += line[i]
    }
  }
  result.push(current)
  return result
}

function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ''))
  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line)
      const row = {}
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? '').trim().replace(/^"|"$/g, '')
      })
      return row
    })
    .filter((row) => Object.values(row).some((v) => v !== ''))
}

// ─── CSV → Product ────────────────────────────────────────────────────────────

function rowToProduct(row) {
  return {
    name: row.name,
    partNumber: row.partNumber,
    brand: row.brand,
    description: row.description,
    categorySlug: row.categorySlug,
    subcategorySlug: row.subcategorySlug || 'none',
    tags: row.tags ? row.tags.split(';').map((t) => t.trim()).filter(Boolean) : [],
    applications: row.applications
      ? row.applications.split(';').map((a) => a.trim()).filter(Boolean)
      : [],
    specifications: row.specifications
      ? Object.fromEntries(
          row.specifications
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => {
              const eq = s.indexOf('=')
              return eq === -1 ? [s, ''] : [s.slice(0, eq).trim(), s.slice(eq + 1).trim()]
            })
        )
      : {},
    availability: {
      status: row.availability_status || 'quote-only',
      leadTime: row.availability_leadTime || undefined,
      minimumQuantity: row.availability_minimumQuantity
        ? Number(row.availability_minimumQuantity)
        : undefined,
      allowAlternatives: row.availability_allowAlternatives === 'true',
    },
    storage: {
      temperatureControlled: row.storage_temperatureControlled === 'true',
      hazmat: row.storage_hazmat === 'true',
      shelfLife: row.storage_shelfLife || undefined,
      storageInstructions: row.storage_storageInstructions || undefined,
    },
    compliance: {
      certifications: row.compliance_certifications
        ? row.compliance_certifications.split(';').map((c) => c.trim()).filter(Boolean)
        : [],
      hasCoC: row.compliance_hasCoC === 'true',
      hasSDS: row.compliance_hasSDS === 'true',
      hasTDS: row.compliance_hasTDS === 'true',
      militarySpec: row.compliance_militarySpec || undefined,
    },
    isActive: row.isActive !== 'false',
  }
}

// ─── Template Generator ───────────────────────────────────────────────────────

function generateTemplate() {
  const headers = [
    'name', 'partNumber', 'brand', 'description', 'categorySlug', 'subcategorySlug',
    'tags', 'applications', 'specifications',
    'availability_status', 'availability_leadTime', 'availability_minimumQuantity', 'availability_allowAlternatives',
    'storage_temperatureControlled', 'storage_hazmat', 'storage_shelfLife', 'storage_storageInstructions',
    'compliance_certifications', 'compliance_hasCoC', 'compliance_hasSDS', 'compliance_hasTDS', 'compliance_militarySpec',
    'isActive',
  ]
  const example = [
    'Example Product', 'EX-001', 'BrandName',
    'A detailed product description at least 10 chars',
    'category-slug', 'subcategory-slug',
    'tag1;tag2', 'aerospace;defense', 'Voltage=12V DC;Weight=500g;Dimensions=10x5x3cm',
    'in-stock', '', '10', 'false',
    'false', 'false', '', '',
    'ISO9001;AS9100', 'true', 'true', 'false', '',
    'true',
  ]
  writeFileSync('products_template.csv', [headers.join(','), example.join(',')].join('\n'))
  console.log('Template written to products_template.csv')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs()

  if (args.template) {
    generateTemplate()
    exit(0)
  }

  const { url, email, password, file } = args

  if (!url || !email || !password || !file) {
    console.error(
      'Usage:\n' +
        '  node bulk-upload-products.mjs --url <api_base_url> --email <email> --password <pass> --file <csv>\n\n' +
        'Generate CSV template:\n' +
        '  node bulk-upload-products.mjs --template'
    )
    exit(1)
  }

  // Step 1: Login
  console.log(`\nLogging in as ${email}...`)
  let loginRes
  try {
    loginRes = await fetch(`${url}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch (err) {
    console.error('Network error during login:', err.message)
    exit(1)
  }

  if (!loginRes.ok) {
    const body = await loginRes.json().catch(() => ({}))
    console.error('Login failed:', body?.error?.message || loginRes.statusText)
    exit(1)
  }

  // Extract session cookie + CSRF token
  const setCookieHeaders = loginRes.headers.getSetCookie?.() ?? []
  const cookieHeader = setCookieHeaders.map((c) => c.split(';')[0]).join('; ')
  const csrfEntry = setCookieHeaders.find((c) => c.startsWith('csrf_token='))
  const csrfToken = csrfEntry?.split(';')[0]?.split('=')[1] ?? ''

  console.log('Login successful\n')

  // Step 2: Parse CSV
  let csvText
  try {
    csvText = readFileSync(file, 'utf-8')
  } catch {
    console.error(`Cannot read file: ${file}`)
    exit(1)
  }

  const rows = parseCSV(csvText)
  if (rows.length === 0) {
    console.error('CSV has no data rows.')
    exit(1)
  }

  console.log(`Found ${rows.length} product(s) in ${file}\n`)

  // Step 3: Upload each product
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const product = rowToProduct(row)
    const label = `[${i + 1}/${rows.length}] "${row.name || '(no name)'}"`

    try {
      const res = await fetch(`${url}/inventory/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(product),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message || `HTTP ${res.status}`)
      }

      console.log(`  OK  ${label}`)
      successCount++
    } catch (err) {
      console.log(`  ERR ${label} — ${err.message}`)
      errorCount++
    }
  }

  console.log(`\nDone. ${successCount} succeeded, ${errorCount} failed.`)
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  exit(1)
})
