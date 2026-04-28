"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { FaUsers } from "react-icons/fa"
import { FiTrendingUp, FiCalendar, FiAlertTriangle } from "react-icons/fi"

// ===== Mock Data =====
const stats = {
  totalUsers: 4,
  totalTransaction: 295417,
  todayTransaction: 2476,
  errorRate: "0%",
}

const apiUsageData = [
  { name: "restroom", value: 280000 },
  { name: "weather", value: 10000 },
  { name: "parking", value: 3000 },
  { name: "beacon", value: 1500 },
]

const activeUsersData = [
  { name: "สถานี อุตรติด์", value: 265000 },
  { name: "Admin User", value: 500 },
  { name: "ขาออก", value: 12000 },
  { name: "ขาเข้า", value: 800 },
]

// ===== Stat Card =====
type StatCardProps = {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  textColor: string
  iconBg: string
}

function StatCard({ label, value, icon, color, textColor, iconBg }: StatCardProps) {
  return (
    <div className={`${color} rounded-xl p-5 flex justify-between items-center border border-gray-200 shadow-sm`}>
      <div>
        <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        <p className={`text-sm mt-1 ${textColor} opacity-70`}>{label}</p>
      </div>
      <div className={`${iconBg} p-3 rounded-full text-2xl`}>
        {icon}
      </div>
    </div>
  )
}

// ===== Main Page =====
export default function AdminDashboardPage() {
  return (
    <div className="bg-gray-100 min-h-screen p-6 text-black">

      {/* ===== Header ===== */}
      <div className="mb-6 border-b-2 border-blue-500 pb-3">
        <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of system statistics</p>
      </div>

      {/* ===== Stat Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<span className="text-blue-500"><FaUsers /></span>}
          color="bg-white"
          textColor="text-black"
          iconBg="bg-blue-100"
        />
        <StatCard
          label="Total Transaction"
          value={stats.totalTransaction.toLocaleString()}
          icon={<span className="text-yellow-500"><FiTrendingUp /></span>}
          color="bg-yellow-400"
          textColor="text-black"
          iconBg="bg-yellow-200"
        />
        <StatCard
          label="Today's Transaction"
          value={stats.todayTransaction.toLocaleString()}
          icon={<span className="text-blue-600"><FiCalendar /></span>}
          color="bg-blue-600"
          textColor="text-white"
          iconBg="bg-blue-400"
        />
        <StatCard
          label="Error Rate"
          value={stats.errorRate}
          icon={<span className="text-black"><FiAlertTriangle /></span>}
          color="bg-black"
          textColor="text-white"
          iconBg="bg-gray-700"
        />
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* API Usage */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-blue-600 mb-1">📊 API Usage by Endpoint</h2>
          <p className="text-xs text-gray-400 mb-4">Total requests per endpoint</p>
          <ResponsiveContainer debounce={350} width="100%" height={300}>
            <BarChart data={apiUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 12 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString()} tick={{ fill: "#555", fontSize: 11 }} />
              <Tooltip formatter={(v: any) => v.toLocaleString()} />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-blue-600 mb-1">👥 Active Users by Transaction Count</h2>
          <p className="text-xs text-gray-400 mb-4">Requests grouped by user</p>
          <ResponsiveContainer debounce={350} width="100%" height={300}>
            <BarChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} />
              <YAxis tickFormatter={(v) => v.toLocaleString()} tick={{ fill: "#555", fontSize: 11 }} />
              <Tooltip formatter={(v: any) => v.toLocaleString()} />
              <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}