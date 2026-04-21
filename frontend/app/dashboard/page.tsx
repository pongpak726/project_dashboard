"use client"

import { useEffect, useState } from "react"
import { getOverview } from "@/app/lib/services/external"
import { buildPm25Chart, buildAvailabilityChart } from "@/app/lib/utils/chart"
import {
  ScatterChart,
  Scatter,
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

        const weather = res.data.weather
        const restroom = res.data.restroom

        const pm = buildPm25Chart(weather)
        const usage = buildAvailabilityChart(restroom)

        setPm25Data(pm)
        setUsageData(usage)

        // INSIGHT (safe)
        const maxPm = pm.length ? Math.max(...pm.map(d => d.avg)) : 0
        const minPm = pm.length ? Math.min(...pm.map(d => d.avg)) : 0

        const isAllAvailable =
          usage.length === 0 || usage.every(d => d.avg === 100)

        setInsight({
          maxPm,
          minPm,
          usageStatus: isAllAvailable ? "All Available" : "In Use"
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
            Restroom Available
          </h2>

          {usageData.length === 0 ? (
            <p>No data</p>
          ) : (
            <div className="relative">

              {/* SHOW MESSAGE ถ้าว่าง */}
              {usageData.every(d => d.avg === 100) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10 pointer-events-none">
                  <p className="text-lg">All restrooms available</p>
                  <p className="text-sm">No occupancy detected</p>
                </div>
              )}

              {/* SHOW GRAPH ตลอด */}
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="time"
                    type="category"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                  />

                  <YAxis domain={[0, 100]} />

                  <Tooltip
                    formatter={(v: any) => [`${Number(v).toFixed(0)}%`, "Available"]}
                  />

                  <Scatter
                    data={usageData}
                    fill="#3b82f6"
                  />
                </ScatterChart>
              </ResponsiveContainer>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}