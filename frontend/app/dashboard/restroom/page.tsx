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
        const res = await getRestroom()
        setData(res.data)
      } catch (err) {
        console.error("LOAD ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])
  // ===== Loading =====
  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  // ===== No Data =====
  if (data.length === 0) {
    return <p className="p-6 text-black">No restroom data</p>
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-black">Restroom</h1>

      {/* 🔥 Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div
            key={`${item.deviceId}-${item.timestamp}-${index}`}
            className="bg-white p-4 rounded shadow text-black"
          >
            {/* 📍 Location */}
            <p className="font-semibold text-lg">
              📍 {item.siteName}
            </p>

            {/* 🚹 Male */}
            <p>
              🚹 Male: {item.maleAvailable} / {item.maleStalls}
            </p>

            {/* 🚺 Female */}
            <p>
              🚺 Female: {item.femaleAvailable} / {item.femaleStalls}
            </p>
{/* 🧠 Status */}
            <p className="mt-2">
              Status:{" "}
              <span
                className={
                  item.maleAvailable === 0 &&
                  item.femaleAvailable === 0
                    ? "text-red-500 font-bold"
                    : "text-green-500 font-bold"
                }
              >
                {item.maleAvailable === 0 &&
                item.femaleAvailable === 0
                  ? "FULL"
                  : "AVAILABLE"}
              </span>
            </p>

            {/* 🕒 Time */}
            <p className="text-sm text-gray-500 mt-2">
              🕒 {item.timestamp}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}