"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"

const SiteMap = dynamic(() => import("@/components/SiteMap"), { ssr: false })
import { getOverview } from "@/app/lib/services/external"
import { buildMultiSitePm25Chart, buildMultiSiteRestroomChart, buildMultiSiteTempChart } from "@/app/lib/utils/chart"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, LabelList, Cell,
  PieChart, Pie,
} from "recharts"
import { buildPmInsight, buildWeatherInsight } from "../lib/utils/insight"

// ============ MOCK (ลบออกเมื่อใช้จริง) ============
import { buildMockPm25Data } from "@/app/lib/mock/pm25Mock"
import { buildMockTempData } from "@/app/lib/mock/tempMock"
import { buildMockLatestWeather, buildMockLatestParking, buildMockLatestRestroom } from "@/app/lib/mock/latestMock"
// ===================================================

const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7"]
const PAGE_SIZE = 5

type Tab = "weather" | "parking" | "restroom"

function paginate(data: any[], currentPage: number) {
  return data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
}

function totalPages(data: any[]) {
  return Math.ceil(data.length / PAGE_SIZE)
}

function PaginationBar({
  tab, data, page, setPage,
}: {
  tab: Tab
  data: any[]
  page: Record<Tab, number>
  setPage: React.Dispatch<React.SetStateAction<Record<Tab, number>>>
}) {
  const total = totalPages(data)
  const current = page[tab]
  if (total <= 1) return null
  return (
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
  )
}

function formatTs(ts: string | undefined | null) {
  if (!ts) return "-"
  return ts.replace("T", " ").slice(0, 19)
}

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

function ParkingStatusBadge({ available, capacity }: { available: number; capacity: number }) {
  const pct = capacity > 0 ? (available / capacity) * 100 : 0
  const [color, label] =
    available === 0 ? ["bg-red-400 text-red-900",       "FULL"] :
    pct < 50        ? ["bg-yellow-300 text-yellow-900", "ALMOST FULL"] :
                      ["bg-green-100 text-green-800",   "AVAILABLE"]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

function RestroomStatusBadge({ maleAvailable, maleTotal, femaleAvailable, femaleTotal }: { maleAvailable: number; maleTotal: number; femaleAvailable: number; femaleTotal: number }) {
  const totalAvailable = maleAvailable + femaleAvailable
  const totalCapacity = maleTotal + femaleTotal
  const pct = totalCapacity > 0 ? (totalAvailable / totalCapacity) * 100 : 0
  const [color, label] =
    totalAvailable === 0 ? ["bg-red-400 text-red-900",       "FULL"] :
    pct < 50             ? ["bg-yellow-300 text-yellow-900", "ALMOST FULL"] :
                           ["bg-green-100 text-green-800",   "AVAILABLE"]
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {label}
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null)
  const [sortTempOrder, setSortTempOrder] = useState<"asc" | "desc" | null>(null)
  const [sortHumidityOrder, setSortHumidityOrder] = useState<"asc" | "desc" | null>(null)
  const [sortTsOrder, setSortTsOrder] = useState<"asc" | "desc" | null>(null)
  const [sortParkingStatus, setSortParkingStatus] = useState<"asc" | "desc" | null>(null)
  const [sortRestroomStatus, setSortRestroomStatus] = useState<"asc" | "desc" | null>(null)
  const [restroomFilter, setRestroomFilter] = useState<'Both' | 'Male' | 'Female'>('Both')

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
         //setPm25Data(pm) // production
         setPm25Data(buildMockPm25Data()) // mock

        const allSites = Object.keys(pm[0] || {}).filter(k => k !== "index" && !k.endsWith("_time"))
        setSelectedSites(allSites.slice(0, 5))

        // ---- Temperature ----
        //setTempData(temp) // production
        setTempData(buildMockTempData()) // mock

         //---- Latest Weather ----
         const latestWeatherData = res.data.flatMap((d: any) => {
           const coordsById = Object.fromEntries(
             (d.devices || []).map((dev: any) => [dev.id, { lat: dev.lat, lon: dev.lon }])
           )
           // fallback: ถ้า weather device ไม่มี coords ให้ใช้ device อื่นในไซต์ที่มี coords จริง
           const siteCoords = (d.devices || []).find((dev: any) => dev.lat && dev.lon)
           const sorted = [...(d.weather || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
           return sorted.slice(0, 1).map((w: any) => {
             const direct = coordsById[w.deviceId]
             const coords = (direct?.lat && direct?.lon) ? direct : siteCoords
             return {
               site: d.site, deviceId: w.deviceId, pm25: w.pm25,
               temperature: w.temperature, humidity: w.humidity, timestamp: w.timestamp,
               lat: coords?.lat,
               lon: coords?.lon,
             }
           })
         })
        //setLatestWeather(latestWeatherData) // production
        setLatestWeather(buildMockLatestWeather()) // mock

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
         //setRestroomLatest(latestRestroomData) // production
         setRestroomLatest(buildMockLatestRestroom()) // mock

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
         //setParkingLatest(latestParkingData) // production
         setParkingLatest(buildMockLatestParking()) // mock

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

  const sortedWeatherData = useMemo(() => [...latestWeather].sort((a, b) => {
    if (sortOrder === "asc") return a.pm25 - b.pm25
    if (sortOrder === "desc") return b.pm25 - a.pm25
    if (sortTempOrder === "asc") return a.temperature - b.temperature
    if (sortTempOrder === "desc") return b.temperature - a.temperature
    if (sortHumidityOrder === "asc") return a.humidity - b.humidity
    if (sortHumidityOrder === "desc") return b.humidity - a.humidity
    if (sortTsOrder === "asc") return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    if (sortTsOrder === "desc") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    return 0
  }), [latestWeather, sortOrder, sortTempOrder, sortHumidityOrder, sortTsOrder])

  const sortedParkingData = useMemo(() => [...parkingLatest].sort((a, b) => {
    const occA = a.capacity > 0 ? a.available / a.capacity : 0
    const occB = b.capacity > 0 ? b.available / b.capacity : 0
    if (sortParkingStatus === "asc") return occA - occB
    if (sortParkingStatus === "desc") return occB - occA
    return 0
  }), [parkingLatest, sortParkingStatus])

  const sortedRestroomData = useMemo(() => [...restroomLatest].sort((a, b) => {
    const totalA = a.maleTotal + a.femaleTotal
    const totalB = b.maleTotal + b.femaleTotal
    const pctA = totalA > 0 ? (a.maleAvailable + a.femaleAvailable) / totalA : 0
    const pctB = totalB > 0 ? (b.maleAvailable + b.femaleAvailable) / totalB : 0
    if (sortRestroomStatus === "asc") return pctA - pctB
    if (sortRestroomStatus === "desc") return pctB - pctA
    return 0
  }), [restroomLatest, sortRestroomStatus])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-24 bg-gray-200 rounded" />
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      </div>
    )
  }


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
  onClick={() => { setSortTempOrder(null); setSortHumidityOrder(null); setSortTsOrder(null); setSortOrder(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null) }}
>
  🌫️ PM2.5
  {sortOrder === "asc" ? " ↑" : sortOrder === "desc" ? " ↓" : " ↕"}
</th>
                  <th
  className="px-4 py-3 text-center cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => { setSortOrder(null); setSortHumidityOrder(null); setSortTsOrder(null); setSortTempOrder(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null) }}
>
  🌡️ Temperature
  {sortTempOrder === "asc" ? " ↑" : sortTempOrder === "desc" ? " ↓" : " ↕"}
</th>
                  <th
  className="px-4 py-3 text-center cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => { setSortOrder(null); setSortTempOrder(null); setSortTsOrder(null); setSortHumidityOrder(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null) }}
>
  💧 Humidity
  {sortHumidityOrder === "asc" ? " ↑" : sortHumidityOrder === "desc" ? " ↓" : " ↕"}
</th>
                  <th
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => { setSortOrder(null); setSortTempOrder(null); setSortHumidityOrder(null); setSortTsOrder(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null) }}
>
  🕒 Timestamp
  {sortTsOrder === "asc" ? " ↑" : sortTsOrder === "desc" ? " ↓" : " ↕"}
</th>
                </tr>
              </thead>
              <tbody>
                {latestWeather.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(sortedWeatherData, page.weather).map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId?.split(":").slice(1).join(":")}</td>
                    <td className="px-4 py-3 text-center"><PM25Badge value={item.pm25} /></td>
                    <td className="px-4 py-3 text-center">{item.temperature} °C</td>
                    <td className="px-4 py-3 text-center">{item.humidity} %</td>
                    <td className="px-4 py-3 text-gray-500">{formatTs(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="weather" data={latestWeather} page={page} setPage={setPage} /></>
            
          )}

          {activeTab === "parking" && (
            <><table className="min-w-full text-sm text-black">
              <thead className="bg-black text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">📍 Location</th>
                  <th className="px-4 py-3 text-left">🆔 Device</th>
                  <th className="px-4 py-3 text-center">🚗 Available / Capacity</th>
                  <th
  className="px-4 py-3 text-center cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => setSortParkingStatus(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)}
>
  Status
  {sortParkingStatus === "asc" ? " ↑" : sortParkingStatus === "desc" ? " ↓" : " ↕"}
</th>
                  <th className="px-4 py-3 text-left">🕒 Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {parkingLatest.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(sortedParkingData, page.parking).map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId?.split(":").slice(1).join(":")}</td>
                    <td className="px-4 py-3 text-center">{item.available} / {item.capacity}</td>
                    <td className="px-4 py-3 text-center"><ParkingStatusBadge available={item.available} capacity={item.capacity} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatTs(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="parking" data={parkingLatest} page={page} setPage={setPage} /></>
          )}

          {activeTab === "restroom" && (
            <><table className="min-w-full text-sm text-black">
              <thead className="bg-black text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">📍 Location</th>
                  <th className="px-4 py-3 text-left">🆔 Device</th>
                  <th className="px-4 py-3 text-center">🚹 Male (Available/Total)</th>
                  <th className="px-4 py-3 text-center">🚺 Female (Available/Total)</th>
                  <th
  className="px-4 py-3 text-center cursor-pointer hover:bg-gray-800 select-none"
  onClick={() => setSortRestroomStatus(prev => prev === null ? "asc" : prev === "asc" ? "desc" : null)}
>
  Status
  {sortRestroomStatus === "asc" ? " ↑" : sortRestroomStatus === "desc" ? " ↓" : " ↕"}
</th>
                  <th className="px-4 py-3 text-left">🕒 Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {restroomLatest.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No data</td></tr>
                ) : paginate(sortedRestroomData, page.restroom).map((item, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.site}</td>
                    <td className="px-4 py-3 text-gray-500">{item.deviceId?.split(":").slice(1).join(":")}</td>
                    <td className="px-4 py-3 text-center">{item.maleAvailable} / {item.maleTotal}</td>
                    <td className="px-4 py-3 text-center">{item.femaleAvailable} / {item.femaleTotal}</td>
                    <td className="px-4 py-3 text-center"><RestroomStatusBadge maleAvailable={item.maleAvailable} maleTotal={item.maleTotal} femaleAvailable={item.femaleAvailable} femaleTotal={item.femaleTotal} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatTs(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table><PaginationBar tab="restroom" data={restroomLatest} page={page} setPage={setPage} /></>
          )}
        </div>
      </div>

      {/* MAP */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold text-black mb-4">Site Map</h2>
        <SiteMap sites={latestWeather} restroom={restroomLatest} parking={parkingLatest} />
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
        <span>Sites ({selectedSites.length} / {Object.keys(pm25Data[0] || {}).filter(k => k !== "index" && !k.endsWith("_time")).length})</span>
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
                className="text-sm text-blue-500 px-2 py-0.5 rounded hover:bg-blue-50"
              >Select All</button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setSelectedSites([])}
                className="text-sm text-red-500 px-2 py-0.5 rounded hover:bg-red-50"
              >Clear</button>
            </div>
            {Object.keys(pm25Data[0] || {})
              .filter(k => k !== "index" && !k.endsWith("_time"))
              .map((site, i) => {
                const latest = [...pm25Data].reverse().find(d => d[site] !== undefined)?.[site]
                return (
                  <label key={site} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSites.includes(site)}
                        onChange={() => setSelectedSites(prev =>
                          prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]
                        )}
                        className="rounded"
                        style={{ accentColor: colors[i % colors.length] }}
                      />
                      <span className="w-3 h-3 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                      <span className="text-sm text-gray-700">{site}</span>
                    </div>
                    {latest !== undefined && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: latest > 50 ? '#fef2f2' : latest > 25 ? '#fffbeb' : '#f0fdf4',
                          color: latest > 50 ? '#dc2626' : latest > 25 ? '#d97706' : '#16a34a'
                        }}>
                        {latest} μg
                      </span>
                    )}
                  </label>
                )
              })}
          </div>
        </>
      )}
    </div>
  </div>

  {pm25Data.length === 0 ? <p>No data</p> : (
    <div style={{ pointerEvents: dropdownOpen ? 'none' : 'auto' }}>
      <ResponsiveContainer debounce={350} width="100%" height={320}>
        <LineChart data={pm25Data} margin={{ left: -30, right: 10, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          {/* AQI reference lines */}
          <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "25", position: "right", fontSize: 10, fill: "#f59e0b" }} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "50", position: "right", fontSize: 10, fill: "#ef4444" }} />
          <XAxis dataKey="index" label={{ value: "ครั้งที่", position: "insideBottomRight", offset: -5, fontSize: 11 }} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit=" μg" />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const sorted = [...payload].sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
              return (
                <div className="bg-white border rounded-lg shadow-lg p-2 text-xs text-black"
                  style={{ maxHeight: '200px', overflowY: 'auto', minWidth: '180px' }}>
                  {sorted.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center justify-between gap-3 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-gray-600">{p.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: p.color }}>
                        {p.value} μg/m³
                      </span>
                    </div>
                  ))}
                </div>
              )
            }}
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
                dot={false}
                connectNulls
                strokeWidth={selectedSites.includes(site) ? 2 : 0}
                hide={!selectedSites.includes(site)}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
        {Object.keys(pm25Data[0] || {})
          .filter(k => k !== "index" && !k.endsWith("_time"))
          .map((site, i) => {
            const latest = [...pm25Data].reverse().find(d => d[site] !== undefined)?.[site]
            if (!selectedSites.includes(site)) return null
            return (
              <span key={site} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                style={{ borderColor: colors[i % colors.length], color: colors[i % colors.length] }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                {site} · {latest ?? "N/A"} μg
              </span>
            )
          })}
      </div>
    </div>
  )}
</div>
{/* RESTROOM */}
<div className="bg-white p-4 rounded shadow">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-bold text-black">Restroom Usage</h2>
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {(['Both', 'Male', 'Female'] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => setRestroomFilter(opt)}
          className="px-3 py-1 rounded-md text-sm font-medium transition-all"
          style={{
            backgroundColor: restroomFilter === opt ? '#fff' : 'transparent',
            color: restroomFilter === opt
              ? opt === 'Male' ? '#3b82f6' : opt === 'Female' ? '#ec4899' : '#111'
              : '#6b7280',
            boxShadow: restroomFilter === opt ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          {opt === 'Male' ? '🚹 Male' : opt === 'Female' ? '🚺 Female' : '👥 Both'}
        </button>
      ))}
    </div>
  </div>

  {restroomLatest.length === 0 ? <p>No data</p> : (
    <ResponsiveContainer debounce={350} width="100%" height={320}>
      <BarChart
        data={restroomLatest.map(item => ({
          site: item.site,
          ...(restroomFilter !== 'Female' && { "🚹 Male": item.maleUsed }),
          ...(restroomFilter !== 'Male' && { "🚺 Female": item.femaleUsed }),
          maleUsed: item.maleUsed,
          maleTotal: item.maleTotal,
          femaleUsed: item.femaleUsed,
          femaleTotal: item.femaleTotal,
        }))}
        margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
        barCategoryGap="25%"
        barGap={4}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="site"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={70}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div className="bg-white border rounded-lg shadow-lg p-2 text-xs text-black space-y-1 min-w-[170px]">
                <p className="font-semibold text-sm border-b pb-1 mb-1">{label}</p>
                {restroomFilter !== 'Female' && (
                  <div className="flex justify-between gap-4">
                    <span style={{ color: '#3b82f6' }} className="font-medium">🚹 Male</span>
                    <span className="font-semibold">{d.maleUsed} / {d.maleTotal}</span>
                  </div>
                )}
                {restroomFilter !== 'Male' && (
                  <div className="flex justify-between gap-4">
                    <span style={{ color: '#ec4899' }} className="font-medium">🚺 Female</span>
                    <span className="font-semibold">{d.femaleUsed} / {d.femaleTotal}</span>
                  </div>
                )}
              </div>
            )
          }}
        />
        <Legend verticalAlign="top" height={28} />
        {restroomFilter !== 'Female' && (
          <Bar dataKey="🚹 Male" fill="#3b82f6" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="🚹 Male"
              position="top"
              formatter={(value: any) => value}
              style={{ fontSize: 11, fontWeight: 'bold', fill: '#111' }}
            />
          </Bar>
        )}
        {restroomFilter !== 'Male' && (
          <Bar dataKey="🚺 Female" fill="#ec4899" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="🚺 Female"
              position="top"
              formatter={(value: any) => value}
              style={{ fontSize: 11, fontWeight: 'bold', fill: '#111' }}
            />
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )}
</div>

        {/* PARKING */}
<div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4 text-black">Parking Usage</h2>
  {parkingLatest.length === 0 ? <p>No data</p> : (
    <ResponsiveContainer debounce={350} width="100%" height={320}>
      <BarChart
        data={parkingLatest}
        margin={{ top: 10, right: 20, left: 10, bottom: 60 }}
        barCategoryGap="35%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="site"
          tick={{ fontSize: 11 }}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={70}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          isAnimationActive={false}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            const used = payload.find((p: any) => p.dataKey === "used")?.value ?? 0
            const available = payload.find((p: any) => p.dataKey === "available")?.value ?? 0
            const total = (used as number) + (available as number)
            const pct = total > 0 ? Math.round(((used as number) / total) * 100) : 0
            return (
              <div className="bg-white border rounded-lg shadow-lg p-2 text-xs text-black space-y-1 min-w-[160px]">
                <p className="font-semibold text-sm border-b pb-1 mb-1">{label}</p>
                <div className="flex justify-between gap-4">
                  <span style={{ color: '#ef4444' }} className="font-medium">Used</span>
                  <span className="font-semibold">{used} / {total}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span style={{ color: '#10b981' }} className="font-medium">Available</span>
                  <span className="font-semibold">{available}</span>
                </div>
                <div className="mt-1 pt-1 border-t flex justify-between">
                  <span className="text-gray-500">Occupancy</span>
                  <span className="font-bold">{pct}%</span>
                </div>
              </div>
            )
          }}
        />
        <Legend verticalAlign="top" height={28} />
        <Bar dataKey="available" name="Available" stackId="a" fill="#10b981" isAnimationActive={false} />
        <Bar dataKey="used" name="Used" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList
            dataKey="used"
            position="top"
            formatter={(value: any) => value}
            style={{ fontSize: 11, fontWeight: 'bold', fill: '#111' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )}
</div>

        {/* TEMPERATURE */}
<div className="bg-white p-4 rounded shadow">
  <h2 className="text-xl font-bold mb-4 text-black">Temperature</h2>
  {tempData.length === 0 ? <p>No data</p> : (() => {
    const latestTemp = Object.keys(tempData[0] || {})
      .filter(k => k !== "index" && !k.endsWith("_time"))
      .map(site => {
        const latest = [...tempData].reverse().find(d => d[site] !== undefined)
        return { site, temp: latest?.[site] ?? null }
      })
      .filter(d => d.temp !== null)

    const avgTemp = (latestTemp.reduce((s, d) => s + d.temp, 0) / latestTemp.length).toFixed(1)

    const minTemp = Math.min(...latestTemp.map(d => d.temp))
    const maxTemp = Math.max(...latestTemp.map(d => d.temp))

    const getTempColor = (temp: number) => {
      const ratio = maxTemp > minTemp ? (temp - minTemp) / (maxTemp - minTemp) : 0.5
      const r = Math.round(220 * ratio)
      const b = Math.round(220 * (1 - ratio))
      return `rgb(${r}, 100, ${b})`
    }

    // จัดกลุ่มตามค่าอุณหภูมิเหมือนกันเป๊ะ เรียงจากมากไปน้อย
    const grouped = Object.entries(
      latestTemp.reduce((acc, d) => {
        const key = String(d.temp)
        if (!acc[key]) acc[key] = []
        acc[key].push(d)
        return acc
      }, {} as Record<string, typeof latestTemp>)
    )
      .map(([temp, sites]) => ({ temp: Number(temp), sites, label: `${temp}°C`, color: getTempColor(Number(temp)) }))
      .sort((a, b) => b.temp - a.temp)

    return (
      <div style={{ position: 'relative' }}>
        {/* Center label — ต้องอยู่ก่อน ResponsiveContainer ให้ tooltip ลอยทับได้ */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -65%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#111' }}>{avgTemp}°C</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Average</div>
        </div>
        <ResponsiveContainer debounce={350} width="100%" height={340}>
          <PieChart>
            <Pie
              data={grouped}
              dataKey="sites.length"
              cx="50%"
              cy="50%"
              innerRadius={85}
              outerRadius={130}
              paddingAngle={3}
              isAnimationActive={false}
            >
              {grouped.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const g = payload[0]?.payload
                return (
                  <div className="bg-white border rounded-lg shadow-lg p-3 text-xs text-black min-w-[180px]">
                    <p className="font-semibold text-sm border-b pb-1 mb-2" style={{ color: g.color }}>
                      🌡️ {g.label} ({g.sites.length} sites)
                    </p>
                    <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                      {[...g.sites].sort((a: any, b: any) => b.temp - a.temp).map((s: any) => (
                        <div key={s.site} className="flex justify-between gap-4 py-0.5">
                          <span className="text-gray-600">{s.site}</span>
                          <span className="font-bold">{s.temp}°C</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  })()}
</div>

      </div>
    </div>
  )
}