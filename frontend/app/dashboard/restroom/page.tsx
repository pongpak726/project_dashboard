"use client"

import { useEffect, useState } from "react"
import { getRestroom } from "@/app/lib/services/external"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts"

const SITES = ["Sikhio-Outbound", "Sikhio-Inbound", "bangkok_01", "Rest Area KM 120"]
const PAGE_SIZE = 10

type Restroom = {
  siteName: string
  deviceId: string
  maleStalls: number
  maleAvailable: number
  femaleStalls: number
  femaleAvailable: number
  timestamp: string
}

export default function RestroomPage() {
  const [data, setData] = useState<Restroom[]>([])
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState("Sikhio-Outbound")
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")

  useEffect(() => {
  const load = async () => {
    setLoading(true)
    try {
      const start = startDate ? `${startDate}T${startTime || "00:00"}:00.000Z` : undefined
      const end = endDate ? `${endDate}T${endTime || "23:59"}:00.000Z` : undefined

      const res = await getRestroom(site, 100, start, end)
      setData(res.data)
      setPage(1)
    } catch (err) {
      console.error("LOAD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [site, startDate, startTime, endDate, endTime])

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const parseSiteName = (deviceId: string) => deviceId.split(":")[0]
  const parseDeviceId = (deviceId: string) => deviceId.split(":")[1]

  const exportCSV = () => {
    const csv = Papa.unparse(data.map(item => ({
      Site: item.deviceId.split(":")[0],
      Device: item.deviceId.split(":")[1],
      "Male Available": item.maleAvailable,
      "Male Total": item.maleStalls,
      "Female Available": item.femaleAvailable,
      "Female Total": item.femaleStalls,
      Status: item.maleAvailable === 0 && item.femaleAvailable === 0 ? "FULL" : "AVAILABLE",
      Timestamp: item.timestamp,
    })))
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `restroom_${site}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text(`Restroom Report - ${site}`, 14, 15)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString("th-TH")}`, 14, 22)
    autoTable(doc, {
      startY: 28,
      head: [["Site", "Device", "Male (Avail/Total)", "Female (Avail/Total)", "Status", "Timestamp"]],
      body: data.map(item => [
        item.deviceId.split(":")[0],
        item.deviceId.split(":")[1],
        `${item.maleAvailable} / ${item.maleStalls}`,
        `${item.femaleAvailable} / ${item.femaleStalls}`,
        item.maleAvailable === 0 && item.femaleAvailable === 0 ? "FULL" : "AVAILABLE",
        item.timestamp,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] },
    })
    doc.save(`restroom_${site}_${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

  const chartData = [...data]
  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  .slice(-10)
  .map((item, i) => ({
    index: i + 1,
    time: item.timestamp.slice(11, 16),
    male: item.maleStalls - item.maleAvailable,
    female: item.femaleStalls - item.femaleAvailable,
    maleTotal: item.maleStalls,
    femaleTotal: item.femaleStalls,
  }))

  return (
    <div className="p-6 min-w-0 w-full">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">📍 Site</label>
            <select value={site} onChange={(e) => setSite(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black">
              {SITES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">📅 Start</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black" />
            <select value={startTime} onChange={(e) => setStartTime(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">-- ชม. --</option>
              {hourOptions.map(h => <option key={h} value={`${h}:00`}>{h}:00</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">📅 End</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black" />
            <select value={endTime} onChange={(e) => setEndTime(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">-- ชม. --</option>
              {hourOptions.map(h => <option key={h} value={`${h}:00`}>{h}:00</option>)}
            </select>
          </div>

          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setStartTime(""); setEndDate(""); setEndTime("") }}
              className="px-3 py-1.5 rounded border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition">
              ✕ Clear
            </button>
          )}
        </div>

        {!loading && data.length > 0 && (
          <div className="flex gap-2">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-500 text-green-600 text-sm hover:bg-green-50 transition">
              📄 Export CSV
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 transition">
              📑 Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
{!loading && data.length > 0 && (
  <div className="bg-white rounded shadow p-4 mb-4">
  <h2 className="text-lg font-bold text-black mb-4">{site} — Restroom Usage (%)</h2>

  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="index" label={{ value: "ครั้งที่", position: "insideBottomRight", offset: -5 }} />
      <YAxis allowDecimals={false} />
<Tooltip
  content={({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const time = payload[0]?.payload?.time
    const maleTotal = payload[0]?.payload?.maleTotal
    const femaleTotal = payload[0]?.payload?.femaleTotal
    return (
      <div className="bg-white border rounded shadow p-2 text-xs text-black space-y-1">
        <p className="font-medium mb-1">ครั้งที่ {label} · {time}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.fill }}>
            {p.name}: {p.value} / {p.dataKey === "male" ? maleTotal : femaleTotal}
          </div>
        ))}
      </div>
    )
  }}
/>
      <Legend />
      <Bar dataKey="male" name="🚹 Male Used" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      <Bar dataKey="female" name="🚺 Female Used" fill="#ec4899" radius={[4, 4, 0, 0]} isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer>
</div>
)}

      {/* Table */}
      <div className="overflow-x-auto rounded shadow w-full">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-black text-white uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">📍 Site</th>
              <th className="px-4 py-3 text-left">🆔 Device</th>
              <th className="px-4 py-3 text-center">🚹 Male (Available/Total)</th>
              <th className="px-4 py-3 text-center">🚺 Female (Available/Total)</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">🕒 Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No restroom data</td>
              </tr>
            ) : (
              paginated.map((item, index) => {
                const isFull = item.maleAvailable === 0 && item.femaleAvailable === 0
                return (
                  <tr
                    key={`${item.deviceId}-${item.timestamp}-${index}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{parseSiteName(item.deviceId)}</td>
                    <td className="px-4 py-3 text-gray-500">{parseDeviceId(item.deviceId)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.maleAvailable} / {item.maleStalls}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.femaleAvailable} / {item.femaleStalls}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                      }`}>
                        {isFull ? "FULL" : "AVAILABLE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <p>
            แสดง {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} จาก {data.length} รายการ
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition">«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition">‹</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc: (number | string)[], p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2">...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`px-3 py-1 rounded border transition ${
                      page === p ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}>
                    {p}
                  </button>
                )
              )}

            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition">»</button>
          </div>
        </div>
      )}

    </div>
  )
}