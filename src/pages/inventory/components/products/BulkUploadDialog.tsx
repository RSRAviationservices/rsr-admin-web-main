import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Upload, Download, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createProduct } from "@/api/services/inventory.api"
import type { Product } from "@/types/inventory"

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes
    } else if (line[i] === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += line[i]
    }
  }
  result.push(current)
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .split("\n")
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map((h) =>
    h.trim().replace(/^"|"$/g, "")
  )
  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? "").trim().replace(/^"|"$/g, "")
      })
      return row
    })
    .filter((row) => Object.values(row).some((v) => v !== ""))
}

function rowToProduct(row: Record<string, string>): Partial<Product> {
  return {
    name: row.name,
    partNumber: row.partNumber,
    brand: row.brand,
    description: row.description,
    categorySlug: row.categorySlug,
    subcategorySlug: row.subcategorySlug || "none",
    tags: row.tags
      ? row.tags
          .split(";")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    applications: row.applications
      ? row.applications
          .split(";")
          .map((a) => a.trim())
          .filter(Boolean)
      : [],
    specifications: row.specifications
      ? Object.fromEntries(
          row.specifications
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => {
              const eq = s.indexOf("=")
              return eq === -1
                ? [s, ""]
                : [s.slice(0, eq).trim(), s.slice(eq + 1).trim()]
            })
        )
      : {},
    availability: {
      status:
        (row.availability_status as Product["availability"]["status"]) ||
        "quote-only",
      leadTime: row.availability_leadTime || undefined,
      minimumQuantity: row.availability_minimumQuantity
        ? Number(row.availability_minimumQuantity)
        : undefined,
      allowAlternatives: row.availability_allowAlternatives === "true",
    },
    storage: {
      temperatureControlled: row.storage_temperatureControlled === "true",
      hazmat: row.storage_hazmat === "true",
      shelfLife: row.storage_shelfLife || undefined,
      storageInstructions: row.storage_storageInstructions || undefined,
    },
    compliance: {
      certifications: row.compliance_certifications
        ? row.compliance_certifications
            .split(";")
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
      hasCoC: row.compliance_hasCoC === "true",
      hasSDS: row.compliance_hasSDS === "true",
      hasTDS: row.compliance_hasTDS === "true",
      militarySpec: row.compliance_militarySpec || undefined,
    },
    isActive: row.isActive !== "false",
  }
}

// ─── Template Download ────────────────────────────────────────────────────────

const TEMPLATE_HEADERS = [
  "name", "partNumber", "brand", "description", "categorySlug", "subcategorySlug",
  "tags", "applications", "specifications",
  "availability_status", "availability_leadTime", "availability_minimumQuantity", "availability_allowAlternatives",
  "storage_temperatureControlled", "storage_hazmat", "storage_shelfLife", "storage_storageInstructions",
  "compliance_certifications", "compliance_hasCoC", "compliance_hasSDS", "compliance_hasTDS", "compliance_militarySpec",
  "isActive",
]

const TEMPLATE_EXAMPLE = [
  "Example Product", "EX-001", "BrandName",
  "A detailed product description at least 10 chars",
  "category-slug", "",
  "tag1;tag2", "aerospace;defense", "Voltage=12V DC;Weight=500g",
  "in-stock", "", "10", "false",
  "false", "false", "", "",
  "ISO9001;AS9100", "true", "true", "false", "",
  "true",
]

function downloadTemplate() {
  const content = [TEMPLATE_HEADERS.join(","), TEMPLATE_EXAMPLE.join(",")].join("\n")
  const blob = new Blob([content], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "products_template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadStatus = "idle" | "preview" | "uploading" | "done"

interface RowResult {
  name: string
  status: "success" | "error"
  message?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkUploadDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [products, setProducts] = useState<Partial<Product>[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [results, setResults] = useState<RowResult[]>([])
  const [progress, setProgress] = useState(0)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStatus("idle")
    setProducts([])
    setRawRows([])
    setResults([])
    setProgress(0)
    setFileError(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    setOpen(next)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setFileError("CSV has no data rows or is malformed.")
        return
      }
      setRawRows(parsed)
      setProducts(parsed.map(rowToProduct))
      setStatus("preview")
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    setStatus("uploading")
    setProgress(0)
    const uploadResults: RowResult[] = []

    for (let i = 0; i < products.length; i++) {
      const name = rawRows[i].name || `Row ${i + 1}`
      try {
        await createProduct(products[i])
        uploadResults.push({ name, status: "success" })
      } catch (err: any) {
        uploadResults.push({
          name,
          status: "error",
          message:
            err?.response?.data?.message || err?.message || "Unknown error",
        })
      }
      setProgress(Math.round(((i + 1) / products.length) * 100))
    }

    setResults(uploadResults)
    setStatus("done")
    queryClient.invalidateQueries({ queryKey: ["products"] })
  }

  const successCount = results.filter((r) => r.status === "success").length
  const errorCount = results.filter((r) => r.status === "error").length

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
          <DialogDescription>
            Upload a CSV file to add multiple products at once.
          </DialogDescription>
        </DialogHeader>

        {/* ── Step 1: File picker ── */}
        {status === "idle" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Need the template?</p>
                  <p className="text-xs text-muted-foreground">
                    Download the CSV with all columns pre-filled.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="secondary" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Template
              </Button>
            </div>

            <div
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to select a CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated · UTF-8
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {fileError && (
              <p className="text-sm text-destructive text-center">{fileError}</p>
            )}
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {status === "preview" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <p className="text-sm">
                <span className="font-medium">{products.length} product{products.length !== 1 ? "s" : ""}</span>{" "}
                detected — review before uploading.
              </p>
            </div>
            <ScrollArea className="h-52 rounded-md border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Part No.</th>
                    <th className="px-3 py-2 text-left font-medium">Brand</th>
                    <th className="px-3 py-2 text-left font-medium">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {rawRows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-1.5 font-medium max-w-[120px] truncate">{row.name || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row.partNumber || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row.brand || "—"}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{row.categorySlug || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        )}

        {/* ── Step 3: Uploading ── */}
        {status === "uploading" && (
          <div className="space-y-4 py-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Uploading products…</p>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* ── Step 4: Results ── */}
        {status === "done" && (
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Succeeded</p>
              </div>
              <div className="flex-1 rounded-lg border bg-red-50 dark:bg-red-950/20 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Failed</p>
              </div>
            </div>
            <ScrollArea className="h-44 rounded-md border">
              <div className="p-2 space-y-1">
                {results.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 px-2 py-1 text-xs rounded">
                    {r.status === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <span className={r.status === "error" ? "text-red-600" : "text-muted-foreground"}>
                      {r.name}
                      {r.message ? ` — ${r.message}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          {status === "idle" && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          )}
          {status === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStatus("idle")
                  setProducts([])
                  setRawRows([])
                  if (fileRef.current) fileRef.current.value = ""
                }}
              >
                Back
              </Button>
              <Button onClick={handleUpload}>
                Upload {products.length} Product{products.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {status === "uploading" && (
            <Button variant="outline" disabled>
              Please wait…
            </Button>
          )}
          {status === "done" && (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
