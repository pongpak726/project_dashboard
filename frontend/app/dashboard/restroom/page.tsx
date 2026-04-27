"use client"

import { useEffect, useState } from "react"
import { getRestroom } from "@/app/lib/services/external"

const SITES = [
  "Sikhio-Outbound",
  "Sikhio-Inbound",
  "bangkok_01",
  "Rest Area KM 120",
]

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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getRestroom(site, 100)
        setData(res.data)
        setPage(1)
      } catch (err) {
        console.error("LOAD ERROR:", err)
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

  return (
    <div className="p-6 min-w-0 w-full">

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
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
      </div>

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