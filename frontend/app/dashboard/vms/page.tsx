"use client"

import { useEffect, useState } from "react"
import { getVMSList, getVMSLogs, updateVMSLocation } from "@/app/lib/services/vms"
import { useResizeDelay } from "@/app/lib/hooks/useResizeDelay"


type VMS = {
  id: string
  siteName: string
  currentImage: string | null
  updatedAt: string
  lat?: number | null
  lon?: number | null
}

type VMSLog = {
  id: string
  vmsId: string
  imageUrl: string
  timestamp: string
}


export default function VMSPage() {
  const [vmsList, setVmsList] = useState<VMS[]>([])
  const [selectedVMS, setSelectedVMS] = useState<VMS | null>(null)
  const [logs, setLogs] = useState<VMSLog[]>([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [logLimit, setLogLimit] = useState(20)
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? ""
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVMS, setEditingVMS] = useState<VMS | null>(null)
  const [latInput, setLatInput] = useState("")
  const [lonInput, setLonInput] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getVMSList()
        setVmsList(res.data || [])
        if (res.data?.length > 0) {
          setSelectedVMS(res.data[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedVMS) return

    const loadLogs = async () => {
      setLogsLoading(true)
      try {
        const res = await getVMSLogs(selectedVMS.id, logLimit)
        setLogs(res.data || [])
        console.log("VMS response:", res)
      } catch (err) {
        console.error(err)
      } finally {
        setLogsLoading(false)
      }
    }
    loadLogs()
  }, [selectedVMS, logLimit])


  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
        <div className="animate-pulse h-96 bg-gray-200 rounded" />
      </div>
    )
  }

 return (
  <>
    <div className="p-6 space-y-6">

      {/* VMS Grid — ภาพล่าสุดทุกจอ */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold text-black mb-4">VMS — Current Display</h2>

        {vmsList.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No VMS data</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vmsList.map(vms => (
              <div
                key={vms.id}
                onClick={() => setSelectedVMS(vms)}
                className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                  selectedVMS?.id === vms.id ? "ring-2 ring-black" : ""
                }`}
              >
                {/* ภาพ */}
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  {vms.currentImage ? (
                    <img
                      src={`${BASE_URL}${vms.currentImage}`}
                      alt={vms.id}
                      className="w-full h-full object-contain"
                      width={300}
                      height={200}
                    />
                  ) : (
                    <p className="text-gray-400 text-sm">No image</p>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 bg-white">
                  <p className="font-semibold text-sm text-black">{vms.id}</p>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {vms.siteName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    🕒 {new Date(vms.updatedAt).toLocaleString("th-TH")}
                  </p>
                  <button
                    className="mt-2 text-xs text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingVMS(vms)
                      setLatInput(String(vms.lat ?? ""))
                      setLonInput(String(vms.lon ?? ""))
                      setIsModalOpen(true)
                    }}
                  >
                    ✏️ Edit Location
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log ของ VMS ที่เลือก */}
      {selectedVMS && (
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-black">History</h2>
              <p className="text-sm text-gray-500">{selectedVMS.id} · {selectedVMS.siteName}</p>
            </div>
            <select
              value={logLimit}
              onChange={e => setLogLimit(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1 text-black"
            >
              {[10, 20, 50, 100].map(n => (
                <option key={n} value={n}>Last {n}</option>
              ))}
            </select>
          </div>

          {logsLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse h-20 bg-gray-100 rounded" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No logs</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {logs.map(log => (
                <div key={log.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 h-32 flex items-center justify-center">
                    <img
                      src={`${BASE_URL}${log.imageUrl}`}
                      alt={log.timestamp}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString("th-TH")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

    {/* ==== modal ==== */}
    {isModalOpen && editingVMS && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">

          <h2 className="text-lg font-bold mb-4 text-black">
            Edit Location
          </h2>

          <p className="text-sm text-gray-500 mb-3">
            {editingVMS.id}
          </p>

          <div className="space-y-3">
            <input
              type="number"
              placeholder="Latitude"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />

            <input
              type="number"
              placeholder="Longitude"
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm text-black"
            />
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              className="px-3 py-1 text-sm border rounded"
              onClick={() => {
                setIsModalOpen(false)
                setEditingVMS(null)
              }}
            >
              Cancel
            </button>

            <button
              className="px-3 py-1 text-sm bg-black text-white rounded"
              onClick={async () => {
                try {
                  const lat = parseFloat(latInput)
                  const lon = parseFloat(lonInput)

                  if (isNaN(lat) || isNaN(lon)) {
                    alert("Invalid lat/lon")
                    return
                  }

                  await updateVMSLocation(editingVMS.id, lat, lon)

                  const res = await getVMSList()
                  setVmsList(res.data || [])

                  const updated = res.data.find((d: VMS) => d.id === editingVMS.id)
                  setSelectedVMS(updated)

                  setIsModalOpen(false)
                  setEditingVMS(null)

                } catch (err) {
                  console.error(err)
                }
              }}
            >
              Save
            </button>
          </div>

        </div>
      </div>
    )}
  </>
)
}
