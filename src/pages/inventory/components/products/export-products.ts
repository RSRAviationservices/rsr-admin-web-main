import { format } from "date-fns"

import type { Product } from "@/types/inventory"

// ─── Columns ──────────────────────────────────────────────────────────────────
// Keys match the bulk upload template so an export saved as CSV can be re-imported.

const list = (values?: string[]) => (values ?? []).join(";")

const EXPORT_COLUMNS: { key: string; width: number; value: (p: Product) => string | number | boolean }[] = [
  { key: "name", width: 40, value: (p) => p.name },
  { key: "partNumber", width: 20, value: (p) => p.partNumber },
  { key: "brand", width: 18, value: (p) => p.brand },
  { key: "description", width: 60, value: (p) => p.description },
  { key: "categorySlug", width: 24, value: (p) => p.categorySlug },
  { key: "subcategorySlug", width: 24, value: (p) => p.subcategorySlug },
  { key: "tags", width: 30, value: (p) => list(p.tags) },
  { key: "applications", width: 30, value: (p) => list(p.applications) },
  {
    key: "specifications",
    width: 40,
    value: (p) =>
      Object.entries(p.specifications ?? {})
        .map(([k, v]) => `${k}=${v}`)
        .join(";"),
  },
  { key: "availability_status", width: 18, value: (p) => p.availability?.status ?? "" },
  { key: "availability_leadTime", width: 18, value: (p) => p.availability?.leadTime ?? "" },
  { key: "availability_minimumQuantity", width: 14, value: (p) => p.availability?.minimumQuantity ?? "" },
  { key: "availability_allowAlternatives", width: 14, value: (p) => !!p.availability?.allowAlternatives },
  { key: "storage_temperatureControlled", width: 14, value: (p) => !!p.storage?.temperatureControlled },
  { key: "storage_hazmat", width: 12, value: (p) => !!p.storage?.hazmat },
  { key: "storage_shelfLife", width: 16, value: (p) => p.storage?.shelfLife ?? "" },
  { key: "storage_storageInstructions", width: 30, value: (p) => p.storage?.storageInstructions ?? "" },
  { key: "compliance_certifications", width: 24, value: (p) => list(p.compliance?.certifications) },
  { key: "compliance_hasCoC", width: 12, value: (p) => !!p.compliance?.hasCoC },
  { key: "compliance_hasSDS", width: 12, value: (p) => !!p.compliance?.hasSDS },
  { key: "compliance_hasTDS", width: 12, value: (p) => !!p.compliance?.hasTDS },
  { key: "compliance_militarySpec", width: 18, value: (p) => p.compliance?.militarySpec ?? "" },
  { key: "isActive", width: 10, value: (p) => p.isActive },
  { key: "slug", width: 40, value: (p) => p.slug },
  { key: "images", width: 40, value: (p) => list(p.images) },
  { key: "seoTitle", width: 30, value: (p) => p.seoTitle ?? "" },
  { key: "seoDescription", width: 40, value: (p) => p.seoDescription ?? "" },
  { key: "createdAt", width: 20, value: (p) => formatDate(p.createdAt) },
  { key: "updatedAt", width: 20, value: (p) => formatDate(p.updatedAt) },
]

function formatDate(value?: string) {
  return value ? format(new Date(value), "yyyy-MM-dd HH:mm") : ""
}

// ─── Download ─────────────────────────────────────────────────────────────────

export async function downloadProductsExcel(products: Product[]) {
  // exceljs is large, so only load it when someone actually exports
  const ExcelJS = (await import("exceljs")).default

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Products", {
    views: [{ state: "frozen", ySplit: 1 }],
  })

  sheet.columns = EXPORT_COLUMNS.map(({ key, width }) => ({ header: key, key, width }))
  sheet.getRow(1).font = { bold: true }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: EXPORT_COLUMNS.length } }

  for (const product of products) {
    sheet.addRow(Object.fromEntries(EXPORT_COLUMNS.map((c) => [c.key, c.value(product)])))
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `products_${format(new Date(), "yyyy-MM-dd")}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
