"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import DashboardNav from "@/components/layout/dashboard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    // 🔐 optional: validate token (แนะนำ)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (!payload) {
        localStorage.removeItem("token")
        router.push("/login")
        return
      }
    } catch {
      localStorage.removeItem("token")
      router.push("/login")
      return
    }

    setLoading(false)
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Navbar />
      <DashboardNav />
      {children}
    </>
  )
}