"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decodeToken } from "@/app/lib/auth"
import Swal from "sweetalert2"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`

  const handleLogin = async () => {
    setLoading(true)
    try {
      if (!email || !password) {
        Swal.fire({
          icon: "warning",
          title: "กรุณากรอกข้อมูล",
          text: "Please fill all fields",
          background: "#1e2a3a",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
        })
        return
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error("Login failed")
      if (!data.token) throw new Error("No token received")

      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.message,
        background: "#1e2a3a",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return
    const payload = decodeToken(token)
    if (!payload) { localStorage.removeItem("token"); return }
    if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN") {
      router.push("/admin/dashboard")
    } else {
      router.push("/dashboard")
    }
  }, [])

  return (
    <div className="bg-[#1e2a3a] p-6 rounded-2xl shadow-xl w-80 border border-white/10">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h2 className="text-3xl font-bold mb-4 text-white text-center">Login</h2>

      <input
        className="w-full mb-3 p-2 border-2 border-white/10 rounded-lg bg-[#0f172a] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full mb-3 p-2 border-2 border-white/10 rounded-lg bg-[#0f172a] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-95 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/25"
        disabled={loading}
        onClick={handleLogin}
      >
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  )
}