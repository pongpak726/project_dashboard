"use client"

import { useEffect, useState } from "react"
import { getWeather } from "@/app/lib/services/external"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import Papa from "papaparse"

const SITES = [
  "Sikhio-Outbound",
  "Sikhio-Inbound",
  "bangkok_01",
  "Rest Area KM 120",
]

const PAGE_SIZE = 10

function PM25Badge({ value }: { value: number }) {
  const color =
    value <= 25
      ? "bg-green-100 text-green-800"
      : value <= 50
      ? "bg-yellow-300 text-yellow-900"
      : "bg-red-400 text-red-900"
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value} μg/m³
    </span>
  )
}

export default function WeatherPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState("Sikhio-Outbound")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getWeather(site, 100) // ดึงมา 100 ตัว
        setData(res.data)
        setPage(1) // reset page เมื่อเปลี่ยน site
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [site])

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  // เพิ่ม helper แยก composite id
  const parseSiteName = (deviceId: string) => deviceId.split(":")[0]
  const parseDeviceId = (deviceId: string) => deviceId.split(":")[1]

  const exportCSV = () => {
  const csv = Papa.unparse(data.map(item => ({
    Location: item.location,
    Device: item.deviceId,
    "PM2.5 (ug/m3)": item.pm25,        
    "Temperature (C)": item.temperature, 
    "Humidity (%)": item.humidity,
    Timestamp: item.timestamp,
  })))
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `weather_${site}_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const exportPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(14)
  doc.text(`Weather Report - ${site}`, 14, 15)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString("th-TH")}`, 14, 22)

  autoTable(doc, {
    startY: 28,
    head: [["Location", "Device", "PM2.5", "Temp (°C)", "Humidity (%)", "Timestamp"]],
    body: data.map(item => [
      item.location,
      item.deviceId,
      `${item.pm25} ug/m3`,
      `${item.temperature} C`,
      `${item.humidity}%`,
      item.timestamp,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 0, 0] },
  })

  doc.save(`weather_${site}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

  return (
    <div className="p-6 min-w-0 w-full">

      {/* Controls */}
<div className="flex flex-wrap gap-3 mb-4 items-center justify-between">
  <div className="flex items-center gap-2">
    <label className="text-sm font-medium text-gray-700">📍 Site</label>
    <select
      value={site}
      onChange={(e) => setSite(e.target.value)}
      className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
    >
      {SITES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>

  {/* Export buttons */}
  {!loading && data.length > 0 && (
    <div className="flex gap-2">
      <button
        onClick={exportCSV}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-green-500 text-green-600 text-sm hover:bg-green-50 transition"
      >
        📄 Export CSV
      </button>
      <button
        onClick={exportPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-500 text-red-600 text-sm hover:bg-red-50 transition"
      >
        📑 Export PDF
      </button>
    </div>
  )}
</div>

      {/* Table */}
      <div className="overflow-x-auto rounded shadow w-full">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-black text-white uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">📍 Location</th>
              <th className="px-4 py-3 text-left">🆔 Device</th>
              <th className="px-4 py-3 text-center">🌫️ PM2.5</th>
              <th className="px-4 py-3 text-center">🌡️ Temperature</th>
              <th className="px-4 py-3 text-center">💧 Humidity</th>
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
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No weather data</td>
              </tr>
            ) : (
              paginated.map((item: any, index: number) => (
                <tr
                  key={`${item.deviceId}-${item.timestamp}-${index}`}
                  className="border-t hover:bg-gray-200 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{parseSiteName(item.deviceId)}</td>
                  <td className="px-4 py-3 text-gray-500">{parseDeviceId(item.deviceId)}</td>
                  <td className="px-4 py-3 text-center">
                    <PM25Badge value={item.pm25} />
                  </td>
                  <td className="px-4 py-3 text-center">{item.temperature} °C</td>
                  <td className="px-4 py-3 text-center">{item.humidity} %</td>
                  <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                </tr>
              ))
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
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition"
            >«</button>
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition"
            >‹</button>

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
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`px-3 py-1 rounded border transition ${
                      page === p ? "bg-black text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition"
            >›</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 transition"
            >»</button>
          </div>
        </div>
      )}

    </div>
  )
}