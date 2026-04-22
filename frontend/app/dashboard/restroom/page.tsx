"use client"

import { useEffect, useState } from "react"
import { getRestroom } from "@/app/lib/services/external"

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRestroom("Sikhio-Outbound", 10)
        setData(res.data)
      } catch (err) {
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="p-6">Loading...</p>
  if (data.length === 0) return <p className="p-6 text-black">No restroom data</p>

  return (
    <div className="p-6">
      

      <div className="overflow-x-auto rounded shadow">
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
            {data.map((item, index) => {
              const isFull = item.maleAvailable === 0 && item.femaleAvailable === 0
              return (
                <tr
                  key={`${item.deviceId}-${item.timestamp}-${index}`}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{item.siteName}</td>
                  <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                  <td className="px-4 py-3 text-center">
                    {item.maleAvailable} / {item.maleStalls}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.femaleAvailable} / {item.femaleStalls}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        isFull
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {isFull ? "FULL" : "AVAILABLE"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    
  )
}