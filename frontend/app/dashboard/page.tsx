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

        setPm25Data(pm)
        setUsageData(usage)

        // ✅ PM insight
        const maxPm = pm.length ? Math.max(...pm.map(d => d.avg)) : 0
        const minPm = pm.length ? Math.min(...pm.map(d => d.avg)) : 0

        // ✅ Usage insight (รวมชาย+หญิง)
        const isNoUsage =
          usage.length === 0 ||
          usage.every(d => d.male === 0 && d.female === 0)

        setInsight({
          maxPm,
          minPm,
          usageStatus: isNoUsage ? "No Usage" : "Active"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Max PM2.5" value={insight.maxPm} color="text-red-500" />
        <Card title="Min PM2.5" value={insight.minPm} color="text-green-500" />
        <Card title="Restroom Status" value={insight.usageStatus} color="text-blue-500" />
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

                  <YAxis domain={[0, "dataMax + 1"]}/>

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