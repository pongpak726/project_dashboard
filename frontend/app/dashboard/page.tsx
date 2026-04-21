"use client"

import { useEffect, useState } from "react"
import { getOverview } from "@/app/lib/services/external"
import { buildPm25Chart, buildUsageByGenderChart } from "@/app/lib/utils/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts"
import { Card } from "@/components/ui/card"

  type Weather = {
    temperature: number
    humidity: number
    pm25: number
    timestamp: string
  }

  export type Restroom = {
    siteName: string
    deviceId: string
    maleStalls: number
    maleAvailable: number
    femaleStalls: number
    femaleAvailable: number
    timestamp: string
  }

export default function OverviewPage() {
  const [pm25Data, setPm25Data] = useState<any[]>([])
  const [usageData, setUsageData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<any>({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOverview()

        const pm = buildPm25Chart(res.data.weather)
        const usage = buildUsageByGenderChart(res.data.restroom)

        const weather: Weather[] = res.data.weather
        const restroom: Restroom[] = res.data.restroom

        console.log(weather)


        setPm25Data(pm)
        setUsageData(usage)

        // PM insight
        const maxPm = pm.length ? Math.max(...pm.map(d => d.avg)) : 0
        const minPm = pm.length ? Math.min(...pm.map(d => d.avg)) : 0

        // avg Weather
        const avgTemp =
          weather.length > 0
            ? weather.reduce((sum, d) => sum + d.temperature, 0) / weather.length
            : 0

        const avgHumidity =
          weather.length > 0
            ? weather.reduce((sum, d) => sum + d.humidity, 0) / weather.length
            : 0

        const avgPm25 =
          weather.length > 0
            ? weather.reduce((sum, d) => sum + d.pm25, 0) / weather.length
            : 0

        // เวลาล่าสุด (สำคัญ)
        const latestTime =
          weather.length > 0
            ? weather
                .map(d => new Date(d.timestamp))
                .sort((a, b) => b.getTime() - a.getTime())[0]
            : null


        // ✅ Usage insight (รวมชาย+หญิง)
        const isNoUsage =
          usage.length === 0 ||
          usage.every(d => d.male === 0 && d.female === 0)

        setInsight({
          maxPm,
          minPm,
          usageStatus: isNoUsage ? "No Usage" : "Active",

          avgTemp: avgTemp.toFixed(1),
          avgHumidity: avgHumidity.toFixed(1),
          avgPm25: avgPm25.toFixed(1),
          latestTime: latestTime
            ? latestTime.toLocaleString()
            : "-"
        })

        
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const isNoUsage =
    usageData.length === 0 ||
    usageData.every(d => d.male === 0 && d.female === 0)

  return (
    <div className="p-6 space-y-6">

      {/* INSIGHT */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <Card title="Max PM2.5" value={insight.maxPm} color="text-red-500" />
        <Card title="Min PM2.5" value={insight.minPm} color="text-green-500" />

        <Card title="Avg Temp" value={`${insight.avgTemp}°C`} color="text-orange-500"  />
        <Card title="Avg Humidity" value={`${insight.avgHumidity}%`}  color="text-blue-500" />
        <Card title="Avg PM2.5" value={insight.avgPm25} color="text-yellow-500" />

        <Card title="Last Update" value={insight.latestTime} color="text-gray-500" />

    </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PM2.5 */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">PM2.5 Trend</h2>

          {pm25Data.length === 0 ? (
            <p>No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pm25Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#ef4444" dot />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RESTROOM */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">
            Restroom Usage
          </h2>

          {usageData.length === 0 ? (
            <p>No data</p>
          ) : (
            <div className="relative">

              {/* Overlay */}
              {isNoUsage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10 pointer-events-none">
                  <p className="text-lg">No usage detected</p>
                  <p className="text-sm">All restrooms are free</p>
                </div>
              )}

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="time"
                    angle={-30}
                    textAnchor="end"
                  />

                  <YAxis domain={[0, "dataMax + 1"]}
                  allowDecimals={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="male"
                    stroke="#3b82f6"
                    name="Male"
                  />

                  <Line
                    type="monotone"
                    dataKey="female"
                    stroke="#a855f7"
                    name="Female"
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}