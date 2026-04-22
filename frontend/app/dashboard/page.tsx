"use client"

import { useEffect, useState } from "react"
import { getOverview } from "@/app/lib/services/external"
import { buildMultiSitePm25Chart, buildMultiSiteRestroomChart } from "@/app/lib/utils/chart"
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
import { buildPmInsight, buildWeatherInsight } from "../lib/utils/insight"

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

  const colors = [
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#a855f7"
]

export default function OverviewPage() {
  const [pm25Data, setPm25Data] = useState<any[]>([])
  const [usageData, setUsageData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<any>({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOverview(["Sikhio-Inbound","Sikhio-Outbound", "bangkok_01","Rest Area KM 120",], 10)

        const weather = res.data.flatMap((d: any) =>
          (d.weather || []).map((w: any) => ({
            ...w,
            site: d.site   
          }))
        )
        const restroom = res.data.flatMap((d: any) =>
          (d.restroom || []).map((r: any) => ({
            ...r,
            site: d.site
          }))
        )
        
        const sortedWeather = [...weather].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() -
            new Date(b.timestamp).getTime()
        )

        const pm = buildMultiSitePm25Chart(sortedWeather)
        const usage = buildMultiSiteRestroomChart(restroom)

        setPm25Data(pm)
        setUsageData(usage)

        console.log(res)

        const pmInsight = buildPmInsight(pm)
        const weatherInsight = buildWeatherInsight(weather)

        setInsight({
          maxPm: pmInsight.max,
          minPm: pmInsight.min,
          ...weatherInsight,
          usageStatus:
            usage.length === 0 || usage.every(d => d.male === 0 && d.female === 0)
              ? "No Usage"
              : "Active"
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
  usageData.every(d =>
    Object.keys(d)
      .filter(k => k !== "time")
      .every(site => (d[site] || 0) === 0)
  )

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
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />

              {Object.keys(pm25Data[0] || {})
              .filter(key => key !== "time")
              .map((site, i) => (
                <Line
                  key={site}
                  type="linear"
                  dataKey={site}
                  stroke={colors[i % colors.length]}
                  name={site}
                />
              ))}
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

                  {Object.keys(usageData[0] || {})
                  .filter(key => key !== "time")
                  .map((site, i) => (
                    <Line
                      key={site}
                      type="linear"
                      dataKey={site}
                      stroke={colors[i % colors.length]}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}