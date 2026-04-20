"use client"

import { useEffect, useState } from "react"
import { getWeather } from "@/app/lib/services/external"
import { tr } from "zod/locales";


function PM25Badge({ value }: { value: number }) {
  const color =
    value <= 25
      ? "bg-green-100 text-green-800"
      : value <= 50
      ? "bg-yellow-300 text-yellow-900"
      : "bg-red-400 text-red-900";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value} μg/m³
    </span>
  );
}

export default function RestroomPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWeather()
        setData(res.data) // 🔥 สำคัญ
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <p>Loading...</p>

  if (data.length === 0) return <p className="text-black">No data</p>
  return (
    <div className="text-black">
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-4 mx-4">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-gray-200 bg-blue-500">
          <th className="text-left text-lg px-4 py-2 font-semibold text-white">Location</th>
          <th className="text-left text-lg px-4 py-2 font-semibold text-white">Device</th>
          <th className="text-left text-lg px-4 py-2 font-semibold text-white">status</th>
          <th className="text-left text-lg px-4 py-2 font-semibold text-white">Update time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: any) => (
          <tr key={`${item.deviceId}-${item.timestamp}`} className="border-b border-gray-100">
            <td className="px-4 py-3">📍 {item.location}</td>
            <td className="px-4 py-3">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {item.deviceId}
              </span>
            </td>
            <td className="px-4 py-3">
              <PM25Badge value={item.pm25} />
            </td>
            <td className="px-4 py-3">🌡 {item.temperature} °C</td>
            <td className="px-4 py-3">💧 {item.humidity} %</td>
            <td className="px-4 py-3 text-gray-400 text-xs">🕒 {item.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
}