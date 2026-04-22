"use client"

import { useEffect, useState } from "react"
import { getWeather } from "@/app/lib/services/external"

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getWeather("Sikhio-Outbound", 10)
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p className="p-6">Loading...</p>
  if (data.length === 0) return <p className="p-6 text-black">No weather data</p>

  return (
    <div className="p-6 ">
      

      <div className="overflow-x-auto rounded shadow ">
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
            {data.map((item: any, index: number) => (
              <tr
                key={`${item.deviceId}-${item.timestamp}-${index}`}
                className="border-t hover:bg-gray-200 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{item.location}</td>
                <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                <td className="px-4 py-3 text-center">
                  <PM25Badge value={item.pm25} />
                </td>
                <td className="px-4 py-3 text-center">{item.temperature} °C</td>
                <td className="px-4 py-3 text-center">{item.humidity} %</td>
                <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}