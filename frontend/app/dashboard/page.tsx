"use client"

import { useEffect, useState } from "react"
import { getOverview } from "@/app/lib/services/external"
import { buildMultiSitePm25Chart, buildMultiSiteRestroomChart, buildMultiSiteTempChart } from "@/app/lib/utils/chart"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts"
import { buildPmInsight, buildWeatherInsight } from "../lib/utils/insight"

// ============ MOCK (ลบออกเมื่อใช้จริง) ============
import { buildMockPm25Data } from "@/app/lib/mock/pm25Mock"
import { buildMockTempData } from "@/app/lib/mock/tempMock"
import { buildMockLatestWeather, buildMockLatestParking, buildMockLatestRestroom } from "@/app/lib/mock/latestMock"
// ===================================================

const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7"]

function PM25Badge({ value }: { value: number }) {
  const color =
    value <= 25 ? "bg-green-100 text-green-800" :
    value <= 50 ? "bg-yellow-300 text-yellow-900" :
    "bg-red-400 text-red-900"
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value} μg/m³
    </span>
  )
}

export default function OverviewPage() {
  const [pm25Data, setPm25Data] = useState<any[]>([])
  const [usageData, setUsageData] = useState<any[]>([])
  const [tempData, setTempData] = useState<any[]>([])
  const [latestWeather, setLatestWeather] = useState<any[]>([])
  const [restroomLatest, setRestroomLatest] = useState<any[]>([])
  const [parkingLatest, setParkingLatest] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<any>({})
  const [activeTab, setActiveTab] = useState<"weather" | "parking" | "restroom">("weather")
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [page, setPage] = useState({ weather: 1, parking: 1, restroom: 1 })
  const PAGE_SIZE = 5
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOverview(["Sikhio-Inbound", "Sikhio-Outbound", "bangkok_01", "Rest Area KM 120"], 10)

        const weather = res.data.flatMap((d: any) =>
          (d.weather || []).map((w: any) => ({ ...w, site: d.site }))
        )
        const restroom = res.data.flatMap((d: any) =>
          (d.restroom || []).map((r: any) => ({ ...r, site: d.site }))
        )
        const sortedWeather = [...weather].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )

        const pm = buildMultiSitePm25Chart(sortedWeather)
        const usage = buildMultiSiteRestroomChart(restroom)
        const temp = buildMultiSiteTempChart(sortedWeather)

        // ---- PM2.5 ----
         setPm25Data(pm) // production
         //setPm25Data(buildMockPm25Data()) // mock

        const allSites = Object.keys(pm[0] || {}).filter(k => k !== "index" && !k.endsWith("_time"))
        setSelectedSites(allSites.slice(0, 5))

        // ---- Temperature ----
        setTempData(temp) // production
         //setTempData(buildMockTempData()) // mock

         //---- Latest Weather ----
         const latestWeatherData = res.data.flatMap((d: any) => {
           const sorted = [...(d.weather || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
           return sorted.slice(0, 1).map((w: any) => ({
            site: d.site, deviceId: w.deviceId, pm25: w.pm25,
             temperature: w.temperature, humidity: w.humidity, timestamp: w.timestamp,
           }))
         })
        setLatestWeather(latestWeatherData) // production
         //setLatestWeather(buildMockLatestWeather()) // mock

        setUsageData(usage)

        // ---- Latest Restroom ----
         const latestRestroomData = res.data.map((d: any) => {
           const sorted = [...(d.restroom || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
           const latest = sorted[0]
           if (!latest) return null
           return {
             site: d.site, deviceId: latest.deviceId,
             maleTotal: Number(latest.maleStalls) || 0,
             maleAvailable: Number(latest.maleAvailable) || 0,
             maleUsed: (Number(latest.maleStalls) - Number(latest.maleAvailable)) || 0,
             femaleTotal: Number(latest.femaleStalls) || 0,
             femaleAvailable: Number(latest.femaleAvailable) || 0,
             femaleUsed: (Number(latest.femaleStalls) - Number(latest.femaleAvailable)) || 0,
             timestamp: latest.timestamp,
           }
         }).filter(Boolean)
         setRestroomLatest(latestRestroomData) // production
         //setRestroomLatest(buildMockLatestRestroom()) // mock

        // ---- Latest Parking ----
         const latestParkingData = res.data.map((d: any) => {
           const sorted = [...(d.parking || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
           const latest = sorted[0]
           if (!latest) return null
           return {
             site: d.site, deviceId: latest.deviceId,
             capacity: latest.capacity, available: latest.available,
             used: latest.capacity - latest.available, timestamp: latest.timestamp,
           }
         }).filter(Boolean)
         setParkingLatest(latestParkingData) // production
         //setParkingLatest(buildMockLatestParking()) // mock

        const pmInsight = buildPmInsight(pm)
        const weatherInsight = buildWeatherInsight(weather)
        setInsight({
          maxPm: pmInsight.max,
          minPm: pmInsight.min,
          ...weatherInsight,
          usageStatus: usage.length === 0 || usage.every(d => d.male === 0 && d.female === 0) ? "No Usage" : "Active"
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
        <div className="animate-pulse h-24 bg-gray-200 rounded" />
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  const paginate = (data: any[], tab: "weather" | "parking" | "restroom") => {
  const p = page[tab]
  return data.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)
}

const totalPages = (data: any[]) => Math.ceil(data.length / PAGE_SIZE)

const PaginationBar = ({ tab, data }: { tab: "weather" | "parking" | "restroom", data: any[] }) => {
  const total = totalPages(data)
  const current = page[tab]
  if (total <= 1) return null
  return (
    <>
      <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
        <p>แสดง {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, data.length)} จาก {data.length} รายการ</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => ({ ...p, [tab]: 1 }))} disabled={current === 1}
            className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100">«</button>
          <button onClick={() => setPage(p => ({ ...p, [tab]: p[tab] - 1 }))} disabled={current === 1}
            className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100">‹</button>
          {Array.from({ length: total }, (_, i) => i + 1)
            .filter(p => p === 1 || p === total || Math.abs(p - current) <= 1)
            .reduce((acc: (number | string)[], p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...")
              acc.push(p)
              return acc
            }, [])
            .map((p, i) => p === "..." ? (
              <span key={`e-${i}`} className="px-2">...</span>
            ) : (
              <button key={p} onClick={() => setPage(prev => ({ ...prev, [tab]: p as number }))}
                className={`px-3 py-1 rounded border transition ${current === p ? "bg-black text-white" : "hover:bg-gray-100"}`}>
                {p}
              </button>
            ))}
          <button onClick={() => setPage(p => ({ ...p, [tab]: p[tab] + 1 }))} disabled={current === total}
            className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100">›</button>
          <button onClick={() => setPage(p => ({ ...p, [tab]: total }))} disabled={current === total}
            className="px-2 py-1 rounded border disabled:opacity-30 hover:bg-gray-100">»</button>
        </div>
      </div>
    </>
  )
}

const sortedWeatherData = [...latestWeather].sort((a, b) => {
  if (sortOrder === "asc") return a.pm25 - b.pm25
  if (sortOrder === "desc") return b.pm25 - a.pm25
  return 0
})

  return (
    <div className="p-6 space-y-6">

      {/* LATEST TABLE */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Latest Data</h2>
          <div className="flex gap-2">
            {(["weather", "parking", "restroom"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(p => ({ ...p, [tab]: 1 })) }}
                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                  activeTab === tab ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "weather" ? "🌤 Weather" : tab === "parking" ? "🚗 Parking" : "🚻 Restroom"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === "weather" && (
            <><table className="min-w-full text-sm text-black">
              <thead className="bg-black text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">📍 Location</th>
                  <th className="px-4 py-3 text-left">🆔 Device</th>
                  <th
  className="px-4 py-3 text-center cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => setSortOrder(prev =>
    prev === null ? "asc" : prev === "asc" ? "desc" : null
  )}
>
  🌫️ PM2.5
  {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : " ↕"}
</th>
                  <th className="px-4 py-3 text-center">🌡️ Temperature</th>
                  <th className="px-4 py-3 text-center">💧 Humidity</th>
                  <th className="px-4 py-3 text-left">🕒 Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {latestWeather.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(sortedWeatherData, "weather").map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                    <td className="px-4 py-3 text-center"><PM25Badge value={item.pm25} /></td>
                    <td className="px-4 py-3 text-center">{item.temperature} °C</td>
                    <td className="px-4 py-3 text-center">{item.humidity} %</td>
                    <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="weather" data={latestWeather} /></>
            
          )}

          {activeTab === "parking" && (
            <><table className="min-w-full text-sm text-black">
              <thead className="bg-black text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">📍 Location</th>
                  <th className="px-4 py-3 text-left">🆔 Device</th>
                  <th className="px-4 py-3 text-center">🚗 Available / Capacity</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">🕒 Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {parkingLatest.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(parkingLatest, "parking").map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                    <td className="px-4 py-3 text-center">{item.available} / {item.capacity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.available === 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {item.available === 0 ? "FULL" : "AVAILABLE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="parking" data={parkingLatest} /></>
          )}

          {activeTab === "restroom" && (
            <><table className="min-w-full text-sm text-black">
              <thead className="bg-black text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">📍 Location</th>
                  <th className="px-4 py-3 text-left">🆔 Device</th>
                  <th className="px-4 py-3 text-center">🚹 Male (Available/Total)</th>
                  <th className="px-4 py-3 text-center">🚺 Female (Available/Total)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">🕒 Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {restroomLatest.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(restroomLatest, "restroom").map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId}</td>
                    <td className="px-4 py-3 text-center">{item.maleAvailable} / {item.maleTotal}</td>
                    <td className="px-4 py-3 text-center">{item.femaleAvailable} / {item.femaleTotal}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.maleAvailable === 0 && item.femaleAvailable === 0
                          ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                        {item.maleAvailable === 0 && item.femaleAvailable === 0 ? "FULL" : "AVAILABLE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="restroom" data={restroomLatest} /></>
          )}
        </div>
      </div>

      {/* CHARTS */}
      <div className="flex flex-col gap-6">

        {/* PM2.5 */}
        <div className="bg-white p-4 rounded shadow" style={{ isolation: 'isolate' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">PM2.5 Trend</h2>
            <div className="relative" style={{ zIndex: 50 }}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span>Sites ({selectedSites.length})</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-9 z-40 bg-white border rounded-lg shadow-lg w-72 p-2"
                    style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    <div className="flex gap-2 mb-2 pb-2 border-b sticky top-0 bg-white">
                      <button
                        onClick={() => setSelectedSites(Object.keys(pm25Data[0] || {}).filter(k => k !== "index" && !k.endsWith("_time")))}
                        className="text-sm text-blue-500 px-2 py-0.5 rounded"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >Select All</button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => setSelectedSites([])}
                        className="text-sm px-2 py-0.5 rounded"
                        style={{ color: '#ef4444' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >Clear</button>
                    </div>
                    {Object.keys(pm25Data[0] || {})
                      .filter(k => k !== "index" && !k.endsWith("_time"))
                      .map((site, i) => (
                        <label key={site} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSites.includes(site)}
                            onChange={() => setSelectedSites(prev =>
                              prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]
                            )}
                            className="rounded"
                            style={{ accentColor: colors[i % colors.length] }}
                          />
                          <span className="text-sm text-gray-700">{site}</span>
                        </label>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {pm25Data.length === 0 ? <p>No data</p> : (
            <div style={{ pointerEvents: dropdownOpen ? 'none' : 'auto' }}>
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
                              <span className="font-medium">{p.name}</span>{" · "}
                              {p.payload[`${p.dataKey}_time`] ?? ""} · {p.value} μg/m³
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                  {Object.keys(pm25Data[0] || {})
                    .filter(key => key !== "index" && !key.endsWith("_time"))
                    .map((site, i) => (
                      <Line key={site} type="monotone" dataKey={site} stroke={colors[i % colors.length]}
                        name={site} dot={{ r: 3, fill: "#fff" }} connectNulls strokeWidth={2}
                        hide={!selectedSites.includes(site)} />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* RESTROOM */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Restroom Usage</h2>
          {restroomLatest.length === 0 ? <p>No data</p> : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <div className="grid grid-cols-2 gap-6">
                {restroomLatest.map((item) => {
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
                          <circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="12"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeLinecap="round" transform="rotate(-90 45 45)" />
                          <text x="45" y="41" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111">{used}</text>
                          <text x="45" y="55" textAnchor="middle" fontSize="9" fill="#6b7280">/ {total}</text>
                        </svg>
                        <p className="text-xs font-medium text-gray-600 mt-1">{label}</p>
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
            </div>
          )}
        </div>

        {/* PARKING */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Parking Usage</h2>
          {parkingLatest.length === 0 ? <p>No data</p> : (
            <ResponsiveContainer width="100%" height={parkingLatest.length * 40}>
              <BarChart data={parkingLatest} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="site" tick={{ fontSize: 12 }} width={115} />
                <Tooltip isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111', marginBottom: '4px' }} />
                <Legend verticalAlign="top" />
                <Bar dataKey="available" name="Available" fill="#10b981" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                <Bar dataKey="used" name="Used" fill="#ef4444" radius={[0, 4, 4, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* TEMPERATURE */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4 text-black">Temperature Trend</h2>
          {tempData.length === 0 ? <p>No data</p> : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(tempData[0] || {})
                  .filter(key => key !== "index" && !key.endsWith("_time"))
                  .map((site, i) => {
                    const siteData = tempData.map(d => ({
                      index: d.index, temp: d[site], time: d[`${site}_time`]
                    })).filter(d => d.temp !== undefined)

                    return (
                      <div key={site} className="border rounded-lg p-2">
                        <p className="text-xs font-semibold mb-1" style={{ color: colors[i % colors.length] }}>{site}</p>
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={siteData} margin={{ top: 5, right: 10, left: -10, bottom: 15 }}>
                            <YAxis domain={["dataMin - 2", "dataMax + 2"]}
                              tick={{ fontSize: 16, fill: colors[i % colors.length] }} unit="°C" width={75} />
                            <XAxis dataKey="index"
                              tick={{ fontSize: 16, fill: colors[i % colors.length] }}
                              label={{ value: "ครั้งที่", position: "insideBottomRight", offset: -5, fontSize: 10 }} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.length) return null
                                return (
                                  <div className="bg-white border rounded shadow p-2 text-base text-black">
                                    <p className="font-medium mb-1">{site}</p>
                                    <p style={{ color: colors[i % colors.length] }}>🕒 {payload[0]?.payload?.time}</p>
                                    <p style={{ color: colors[i % colors.length] }}>🌡️ {payload[0]?.value}°C</p>
                                  </div>
                                )
                              }}
                            />
                            <Line type="monotone" dataKey="temp" stroke={colors[i % colors.length]}
                              dot={false} strokeWidth={2} connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}