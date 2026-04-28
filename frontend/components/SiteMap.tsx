"use client"

import { useState, useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function pm25Color(value: number) {
  if (value <= 25) return "#22c55e"
  if (value <= 50) return "#eab308"
  return "#ef4444"
}

function pm25Label(value: number) {
  if (value <= 25) return "Good"
  if (value <= 50) return "Moderate"
  return "Unhealthy"
}

interface WeatherData {
  site: string
  pm25: number
  lat?: number
  lon?: number
  temperature?: number
  humidity?: number
  timestamp?: string
}

interface RestroomData {
  site: string
  maleAvailable: number
  maleTotal: number
  femaleAvailable: number
  femaleTotal: number
}

interface ParkingData {
  site: string
  available: number
  capacity: number
}

interface Props {
  sites: WeatherData[]
  restroom?: RestroomData[]
  parking?: ParkingData[]
}

export default function SiteMap({ sites, restroom = [], parking = [] }: Props) {
  const [showRestroom, setShowRestroom] = useState(false)
  const [showParking, setShowParking]   = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)

  const located = sites.filter(s => s.lat && s.lon)
  const centerLat = located.length > 0 ? located.reduce((s, d) => s + d.lat!, 0) / located.length : 14.0
  const centerLon = located.length > 0 ? located.reduce((s, d) => s + d.lon!, 0) / located.length : 100.8

  const restroomBySite = Object.fromEntries(restroom.map(r => [r.site, r]))
  const parkingBySite  = Object.fromEntries(parking.map(p => [p.site, p]))

  useEffect(() => {
    if (!containerRef.current) return

    // ลบ map เก่าก่อนเสมอ
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLon],
      zoom: 7,
      scrollWheelZoom: false,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    located.forEach(s => {
      const color = pm25Color(s.pm25)
      const r = restroomBySite[s.site]
      const p = parkingBySite[s.site]

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:38px;height:38px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:11px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${s.pm25}</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      })

      const restroomHtml = showRestroom && r ? `
        <div style="border-top:1px solid #e5e7eb;margin-top:4px;padding-top:4px;">
          <div style="font-weight:600;color:#6b7280;font-size:11px;margin-bottom:2px;">🚻 ห้องน้ำ</div>
          <div>🚹 ใช้ ${r.maleTotal - r.maleAvailable}/${r.maleTotal} · ว่าง <strong>${r.maleAvailable}</strong></div>
          <div>🚺 ใช้ ${r.femaleTotal - r.femaleAvailable}/${r.femaleTotal} · ว่าง <strong>${r.femaleAvailable}</strong></div>
        </div>` : ""

      const parkingHtml = showParking && p ? `
        <div style="border-top:1px solid #e5e7eb;margin-top:4px;padding-top:4px;">
          <div style="font-weight:600;color:#6b7280;font-size:11px;margin-bottom:2px;">🚗 ที่จอดรถ</div>
          <div>📍 ใช้ <strong>${p.capacity - p.available}</strong> · ว่าง <strong>${p.available}</strong>/${p.capacity}${p.available === 0 ? ' <strong style="color:#ef4444">FULL</strong>' : ""}</div>
        </div>` : ""

      const popupContent = `
        <div style="font-size:14px;line-height:1.7;">
          <div style="font-weight:700;margin-bottom:4px;font-size:15px;">${s.site}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 8px;">
            <span style="color:${color}">●</span>
            <span>PM2.5 <strong>${s.pm25} μg/m³</strong> <span style="color:${color};font-size:12px;">(${pm25Label(s.pm25)})</span></span>
            ${s.temperature !== undefined ? `<span>🌡️</span><span>${s.temperature}°C · 💧 ${s.humidity}%</span>` : ""}
          </div>
          ${restroomHtml}
          ${parkingHtml}
        </div>`

      const marker = L.marker([s.lat!, s.lon!], { icon }).addTo(map)
      marker.bindPopup(popupContent, { autoPan: false, minWidth: 160 })
      marker.on("mouseover", () => marker.openPopup())
      marker.on("mouseout", () => marker.closePopup())
    })

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [JSON.stringify(located), showRestroom, showParking])

  return (
    <div style={{ height: 600, width: "100%", position: "relative" }}>

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 24, left: 10, zIndex: 1000,
        background: "white", borderRadius: 8, padding: "8px 12px",
        boxShadow: "0 1px 5px rgba(0,0,0,0.2)", fontSize: 12, lineHeight: 1.8,
      }}>
        {[
          { color: "#22c55e", label: "Good (≤25 μg/m³)" },
          { color: "#eab308", label: "Moderate (≤50 μg/m³)" },
          { color: "#ef4444", label: "Unhealthy (>50 μg/m³)" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
            <span style={{ color: "#374151" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Toggle buttons */}
      <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000, display: "flex", gap: 6 }}>
        {[
          { label: "🚻 ห้องน้ำ", active: showRestroom, toggle: () => setShowRestroom(v => !v) },
          { label: "🚗 ที่จอดรถ", active: showParking, toggle: () => setShowParking(v => !v) },
        ].map(({ label, active, toggle }) => (
          <button key={label} onClick={toggle} style={{
            padding: "4px 10px", borderRadius: 6, border: "1px solid",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            backgroundColor: active ? "#111" : "#fff",
            color: active ? "#fff" : "#374151",
            borderColor: active ? "#111" : "#d1d5db",
            boxShadow: "0 1px 4px rgba(0,0,0,0.15)", transition: "all 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>

      <div ref={containerRef} style={{ height: "100%", width: "100%", borderRadius: 8 }} />
    </div>
  )
}