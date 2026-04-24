// Tiny CSV serialiser — just enough for Master Sheet + Activity Log exports.

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv<T>(
  rows: T[],
  columns: { header: string; format: (row: T) => string | number | null | undefined }[],
): string {
  const header = columns.map((c) => escapeCell(c.header)).join(",")
  const lines = rows.map((row) =>
    columns.map((c) => escapeCell(c.format(row))).join(","),
  )
  return [header, ...lines].join("\n")
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
