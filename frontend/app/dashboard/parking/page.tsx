"use client"

import { useEffect, useState } from "react"
import { getParking } from "@/app/lib/services/external"

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getParking("Sikhio-Outbound", 10)
        setData(res.data)
        console.log("RES:", res)
      } catch (err) {
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="p-6">Loading...</p>

return (
  <div className="p-6">
    <div className="overflow-x-auto rounded shadow">
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
          {data.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                No parking data
              </td>
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