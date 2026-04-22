"use client"

import { useEffect, useState } from "react"
import { getParking } from "@/app/lib/services/external"

const SITES = [
  "Sikhio-Outbound",
  "Sikhio-Inbound",
  "bangkok_01",
  "Rest Area KM 120",
]

type ParkingRecord = {
  siteName: string
  deviceId: string
  capacity: number
  available: number
  timestamp: string
}

export default function ParkingPage() {
  const [data, setData] = useState<ParkingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [site, setSite] = useState("Sikhio-Outbound")
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getParking(site, limit)
        setData(res.data)
      } catch (err) {
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [site, limit])

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

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">🔢 Limit</label>
          <input
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-20 text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded shadow w-full">
        <table className="min-w-full bg-white text-sm text-black">
          <thead className="bg-black text-white uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">📍 Site</th>
              <th className="px-4 py-3 text-left">🆔 Device</th>
              <th className="px-4 py-3 text-center">🚗 Available / Capacity</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-left">🕒 Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No parking data</td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isFull = item.available === 0
                return (
                  <tr
                    key={`${item.deviceId}-${item.timestamp}-${index}`}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{item.siteName}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                    <td className="px-4 py-3 text-center">
                      {item.available} / {item.capacity}
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
    </div>
  )
}