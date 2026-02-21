import { FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import type { JobCampaign } from '../pages/Campaigns'

function formatNum(n: number): string {
  return new Intl.NumberFormat('de-AT').format(n)
}
function formatEur(n: number): string {
  return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n)
}
function fmtDate(d: string | null): string {
  if (!d) return '–'
  return new Intl.DateTimeFormat('de-AT').format(new Date(d))
}

export function CampaignReportButton({ campaign }: { campaign: JobCampaign }) {
  const { client } = useAuth()

  function generate() {
    const c = campaign
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFontSize(16)
    doc.text('marketingwerk — Kampagnen-Report', w / 2, y, { align: 'center' })
    y += 12

    doc.setFontSize(10)
    doc.text(`Kunde: ${client?.name || '–'}`, 20, y); y += 6
    doc.text(`Kampagne: ${c.jobtitel}`, 20, y); y += 6
    doc.text(`Laufzeit: ${fmtDate(c.start_date)} – ${fmtDate(c.end_date)}`, 20, y); y += 10

    doc.setFontSize(11)
    doc.text('KPI-Übersicht', 20, y); y += 8

    const rows: [string, string][] = [
      ['Impressionen', formatNum(c.impressions)],
      ['Reichweite', formatNum(c.reach || 0)],
      ['Link-Klicks', formatNum(c.link_clicks || 0)],
      ['Bewerbungen', formatNum(c.total_leads)],
      ['Qualifizierte Leads', formatNum(c.qualified_leads)],
      ['CPL', formatEur(c.cpl)],
      ['CPQL', formatEur(c.cpql)],
      ['Gesamtausgaben', formatEur(c.total_spend)],
    ]

    doc.setFontSize(9)
    rows.forEach(([label, val]) => {
      doc.text(label, 25, y)
      doc.text(val, 120, y)
      y += 6
    })

    y += 6
    doc.setFontSize(8)
    doc.text(`Stand: ${new Intl.DateTimeFormat('de-AT').format(new Date())}`, 20, y)

    doc.setFontSize(7)
    doc.text('Erstellt von marketingwerk — Recruiting, das liefert.', w / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

    doc.save(`Report_${c.jobtitel.replace(/\s+/g, '_')}.pdf`)
  }

  return (
    <button
      onClick={generate}
      className="inline-flex items-center gap-1 text-xs font-medium border border-card-border text-gray-600 rounded-lg px-3 py-1.5 hover:bg-content-bg transition-colors"
    >
      <FileDown size={14} /> Report ↓
    </button>
  )
}

export function MonthlyReportButton({ campaigns }: { campaigns: JobCampaign[] }) {
  const { client } = useAuth()

  function generate() {
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFontSize(16)
    doc.text('marketingwerk — Monatsreport', w / 2, y, { align: 'center' })
    y += 12

    doc.setFontSize(10)
    doc.text(`Kunde: ${client?.name || '–'}`, 20, y); y += 6
    doc.text(`Datum: ${new Intl.DateTimeFormat('de-AT').format(new Date())}`, 20, y); y += 10

    const totals = campaigns.reduce((a, c) => ({
      impressions: a.impressions + c.impressions,
      reach: a.reach + (c.reach || 0),
      clicks: a.clicks + (c.link_clicks || 0),
      leads: a.leads + c.total_leads,
      qualified: a.qualified + c.qualified_leads,
      spend: a.spend + c.total_spend,
    }), { impressions: 0, reach: 0, clicks: 0, leads: 0, qualified: 0, spend: 0 })

    doc.setFontSize(11)
    doc.text('Gesamt-KPIs (alle Kampagnen)', 20, y); y += 8

    const rows: [string, string][] = [
      ['Kampagnen', String(campaigns.length)],
      ['Impressionen', formatNum(totals.impressions)],
      ['Reichweite', formatNum(totals.reach)],
      ['Link-Klicks', formatNum(totals.clicks)],
      ['Bewerbungen', formatNum(totals.leads)],
      ['Qualifizierte Leads', formatNum(totals.qualified)],
      ['Gesamtausgaben', formatEur(totals.spend)],
    ]

    doc.setFontSize(9)
    rows.forEach(([label, val]) => {
      doc.text(label, 25, y)
      doc.text(val, 120, y)
      y += 6
    })

    y += 8
    doc.setFontSize(11)
    doc.text('Kampagnen-Details', 20, y); y += 8

    campaigns.forEach(c => {
      if (y > 260) { doc.addPage(); y = 20 }
      doc.setFontSize(9)
      doc.text(`• ${c.jobtitel} — ${formatNum(c.total_leads)} Bewerb. / ${formatNum(c.qualified_leads)} qualif. / ${formatEur(c.total_spend)}`, 25, y)
      y += 6
    })

    doc.setFontSize(7)
    doc.text('Erstellt von marketingwerk — Recruiting, das liefert.', w / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })

    doc.save(`Monatsreport_${client?.name?.replace(/\s+/g, '_') || 'report'}.pdf`)
  }

  return (
    <button
      onClick={generate}
      className="inline-flex items-center gap-1 text-xs font-medium border border-accent text-accent rounded-lg px-3 py-1.5 hover:bg-accent/5 transition-colors"
    >
      <FileDown size={14} /> Monatsreport ↓
    </button>
  )
}
