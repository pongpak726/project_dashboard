"use client"

import { useEffect, useState } from "react"
import { getWeather } from "@/app/lib/services/external"

const SITES = [
  "Sikhio-Outbound",
  "Sikhio-Inbound",
  "bangkok_01",
  "Rest Area KM 120",
]

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
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getWeather(site, limit)
        setData(res.data)
      } catch (err) {
        console.error(err)
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
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No weather data</td>
              </tr>
            ) : (
              data.map((item: any, index: number) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}