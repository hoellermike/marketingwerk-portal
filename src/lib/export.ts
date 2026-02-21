import * as XLSX from 'xlsx'

interface ExportOptions {
  filename: string
  sheetName: string
  format: 'xlsx' | 'csv'
}

export function exportData(rows: Record<string, unknown>[], headers: Record<string, string>, options: ExportOptions) {
  const { filename, sheetName, format } = options

  // Map rows to header labels
  const mapped = rows.map(row => {
    const out: Record<string, unknown> = {}
    for (const [key, label] of Object.entries(headers)) {
      out[label] = row[key] ?? ''
    }
    return out
  })

  const ws = XLSX.utils.json_to_sheet(mapped)

  // Bold headers + gray bg for xlsx
  if (format === 'xlsx') {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c })
      if (ws[addr]) {
        ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'F3F4F6' } } }
      }
    }
    // Set column widths
    ws['!cols'] = Object.values(headers).map(h => ({ wch: Math.max(h.length + 2, 14) }))
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  if (format === 'csv') {
    XLSX.writeFile(wb, filename.replace(/\.xlsx$/, '.csv'), { bookType: 'csv' })
  } else {
    XLSX.writeFile(wb, filename, { bookType: 'xlsx' })
  }
}

export function formatDateExport(value: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}
