"use client"

import { useEffect, useState, useCallback } from "react"
import { getLogs } from "@/app/lib/services/log"
import { FiSearch, FiRefreshCw } from "react-icons/fi"
import { MdOutlineHistory } from "react-icons/md"

type LoginLog = {
  id: string
  username: string
  ip: string | null
  userAgent: string | null
  createdAt: string
}

const LIMIT = 20

export default function AdminLogPage() {
  const [logs, setLogs] = useState<LoginLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const load = useCallback(async (p: number, username: string) => {
    setLoading(true)
    try {
      const data = await getLogs({ page: p, limit: LIMIT, username })
      setLogs(data.logs)
      setTotal(data.total)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page, search)
  }, [page, search, load])

  const handleSearch = () => {
    setPage(1)
    setSearch(inputValue)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("th-TH", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    })

  const parseUA = (ua: string | null) => {
    if (!ua) return "-"
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "Chrome"
    if (/Edg/i.test(ua)) return "Edge"
    if (/Firefox/i.test(ua)) return "Firefox"
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari"
    return ua.slice(0, 40)
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 text-black">

      {/* Header */}
      <div className="mb-6 border-b-2 border-blue-500 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <MdOutlineHistory size={28} />
            Login Logs
          </h1>
          <p className="text-sm text-gray-400 mt-1">ประวัติการเข้าสู่ระบบทั้งหมด</p>
        </div>
        <button
          onClick={() => load(page, search)}
          className="flex items-center gap-1 text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="ค้นหา username..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          ค้นหา
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">IP Address</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Browser</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เวลา</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">กำลังโหลด...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{log.username}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.ip || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{parseUA(log.userAgent)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(log.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500">ทั้งหมด {total.toLocaleString()} รายการ</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}