"use client"

import { useEffect, useState } from "react"
import { getOverview } from "@/app/lib/services/external"
import { buildMultiSitePm25Chart, buildMultiSiteRestroomChart,buildMultiSiteTempChart } from "@/app/lib/utils/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts"

import { Card } from "@/components/ui/card"
import { buildPmInsight, buildWeatherInsight } from "../lib/utils/insight"
import { tr } from "zod/locales"

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

export default function OverviewPage() {
  const [pm25Data, setPm25Data] = useState<any[]>([])
  const [usageData, setUsageData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<any>({})
  const [latestWeather, setLatestWeather] = useState<any[]>([])
  const [restroomLatest, setRestroomLatest] = useState<any[]>([])
  const [parkingLatest, setParkingLatest] = useState<any[]>([
  { site: "Sikhio-Outbound", deviceId: "parking-001", capacity: 50, available: 20, used: 30 },
  { site: "Sikhio-Inbound", deviceId: "parking-002", capacity: 40, available: 35, used: 5 },
  { site: "bangkok_01", deviceId: "parking-003", capacity: 100, available: 10, used: 90 },
  { site: "Rest Area KM 120", deviceId: "parking-004", capacity: 60, available: 45, used: 15 },
])
  const [tempData, setTempData] = useState<any[]>([])
  const [hiddenSites, setHiddenSites] = useState<Record<string, boolean>>({})
  const [hiddenTempSites, setHiddenTempSites] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOverview(["Sikhio-Inbound","Sikhio-Outbound", "bangkok_01","Rest Area KM 120",], 10)
        console.log("WEATHER SAMPLE:", res.data[0]?.weather?.[0])
        console.log("RESTROOM SAMPLE:", res.data[0]?.restroom?.[0])
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
        const temp = buildMultiSiteTempChart(sortedWeather)
        setTempData(temp)
        // เพิ่มใน useEffect หลัง setPm25Data
        const latest = res.data.flatMap((d: any) => {
          const sorted = [...(d.weather || [])].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          return sorted.slice(0, 1).map((w: any) => ({
            site: d.site,
            deviceId: w.deviceId,
            pm25: w.pm25,
            temperature: w.temperature,
            humidity: w.humidity,
            timestamp: w.timestamp,
          }))
        })
        setLatestWeather(latest)

        setUsageData(usage)
        
        const latestRestroom = res.data.map((d: any) => {
          const sorted = [...(d.restroom || [])].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          const latest = sorted[0]
          if (!latest) return null
          return {
            site: d.site,
            maleTotal: Number(latest.maleStalls) || 0,
            maleAvailable: Number(latest.maleAvailable) || 0,
            maleUsed: (Number(latest.maleStalls) - Number(latest.maleAvailable)) || 0,
            femaleTotal: Number(latest.femaleStalls) || 0,
            femaleAvailable: Number(latest.femaleAvailable) || 0,
            femaleUsed: (Number(latest.femaleStalls) - Number(latest.femaleAvailable)) || 0,
          }
        }).filter(Boolean)

        setRestroomLatest(latestRestroom)

        const latestParking = res.data.map((d: any) => {
          const sorted = [...(d.parking || [])].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          const latest = sorted[0]
          if (!latest) return null
          return {
            site: d.site,
            deviceId: latest.deviceId,
            capacity: latest.capacity,
            available: latest.available,
            used: latest.capacity - latest.available,
          }
        }).filter(Boolean)

        if (latestParking.length > 0) {
  setParkingLatest(latestParking)
}

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
console.log("PARKING LATEST:", parkingLatest)
  return (
    <div className="p-6 space-y-6">
      {/* LATEST TABLE */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Latest Data</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-black">
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
                {latestWeather.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No data</td>
                  </tr>
                ) : (
                  latestWeather.map((item, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{item.site}</td>
                      <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                      <td className="px-4 py-3 text-center"><PM25Badge value={item.pm25} /></td>
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
      

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">

        {/* PM2.5 */}
<div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4 text-black">PM2.5 Trend</h2>

  {pm25Data.length === 0 ? (
    <p>No data</p>
  ) : (
    <ResponsiveContainer width="100%" height={300}>
  <LineChart data={pm25Data} margin={{ left: -30 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="index" label={{ value: "ครั้งที่", position: "insideBottomRight", offset: -5 }} />
    <YAxis />
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null
        return (
          <div className="bg-white border rounded shadow p-2 text-xs text-black space-y-1">
            {payload.map((p: any) => (
              <div key={p.dataKey} style={{ color: p.color }}>
                <span className="font-medium">{p.name}</span>
                {" · "}
                {p.payload[`${p.dataKey}_time`] ?? ""} · {p.value} μg/m³
              </div>
            ))}
          </div>
        )
      }}
    />
    <Legend
  onClick={(e) =>
    setHiddenSites(prev => ({ ...prev, [e.dataKey as string]: !prev[e.dataKey as string] }))
  }
      formatter={(value, entry: any) => (
        <span style={{ color: hiddenSites[entry.dataKey as string] ? "#ccc" : entry.color, cursor: "pointer" }}>
          {value}
        </span>
      )}
    />
    {Object.keys(pm25Data[0] || {})
      .filter(key => key !== "index" && !key.endsWith("_time"))
      .map((site, i) => (
        <Line
          key={site}
          type="monotone"
          dataKey={site}
          stroke={colors[i % colors.length]}
          name={site}
          dot={{ r: 3, fill: "#fff" }}
          connectNulls
          strokeWidth={3}
          hide={hiddenSites[site] === true}
        />
      ))}
  </LineChart>
</ResponsiveContainer>
  )}
</div>

        {/* RESTROOM DONUT */}
<div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4 text-black">Restroom Usage</h2>

  {restroomLatest.length === 0 ? (
    <p>No data</p>
  ) : (
    <div className="grid grid-cols-2 gap-6">
      {restroomLatest.map((item, i) => {
        const malePct = item.maleTotal > 0 ? Math.round((item.maleUsed / item.maleTotal) * 100) : 0
        const femalePct = item.femaleTotal > 0 ? Math.round((item.femaleUsed / item.femaleTotal) * 100) : 0
        const radius = 35
        const circumference = 2 * Math.PI * radius

        const MiniDonut = ({ pct, color, label, used, total }: any) => {
          const dash = (pct / 100) * circumference
          return (
            <div className="flex flex-col items-center">
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle
                  cx="45" cy="45" r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="12"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeLinecap="round"
                  transform="rotate(-90 45 45)"
                />
                <text x="45" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">{pct}%</text>
                <text x="45" y="55" textAnchor="middle" fontSize="9" fill="#6b7280">used</text>
              </svg>
              <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
              <p className="text-xs text-gray-400">{used} / {total}</p>
            </div>
          )
        }

        return (
          <div key={item.site} className="border rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-700 mb-3 text-center">{item.site}</p>
            <div className="flex justify-around">
              <MiniDonut pct={malePct} color="#3b82f6" label="🚹 Male" used={item.maleUsed} total={item.maleTotal} />
              <MiniDonut pct={femalePct} color="#ec4899" label="🚺 Female" used={item.femaleUsed} total={item.femaleTotal} />
            </div>
          </div>
        )
      })}
    </div>
  )}
</div>

{/* PARKING BAR CHART */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4 text-black">Parking Usage</h2>

        {parkingLatest.length === 0 ? (
          <p>No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={parkingLatest} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="site" angle={-20} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend verticalAlign="top" />
              <Bar dataKey="available" name="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="used" name="Used" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>


      <div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4 text-black">Temperature Trend</h2>

  {tempData.length === 0 ? (
    <p>No data</p>
  ) : (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={tempData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="index" label={{ value: "ครั้งที่", position: "insideBottomRight", offset: -5 }} />
        <YAxis unit="°C" domain={[10, "dataMax + 15"]} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-white border rounded shadow p-2 text-xs text-black space-y-1">
                {payload.map((p: any) => (
                  <div key={p.dataKey} style={{ color: p.color }}>
                    <span className="font-medium">{p.name}</span>
                    {" · "}
                    {p.payload[`${p.dataKey}_time`] ?? ""} · {p.value} °C
                  </div>
                ))}
              </div>
            )
          }}
        />
        <Legend
          onClick={(e) =>
            setHiddenTempSites(prev => ({ ...prev, [e.dataKey as string]: !prev[e.dataKey as string] }))
          }
          formatter={(value, entry: any) => (
            <span style={{ color: hiddenTempSites[entry.dataKey] ? "#ccc" : entry.color, cursor: "pointer" }}>
              {value}
            </span>
          )}
        />
        {Object.keys(tempData[0] || {})
          .filter(key => key !== "index" && !key.endsWith("_time"))
          .map((site, i) => (
            <Line
              key={site}
              type="monotone"
              dataKey={site}
              stroke={colors[i % colors.length]}
              name={site}
              dot={true}
              connectNulls
              hide={hiddenTempSites[site] === true}
              strokeWidth={3}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  )}
</div>

      </div>
    </div>
  )
}