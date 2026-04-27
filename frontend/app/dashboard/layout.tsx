"use client"

import { useEffect, useState } from "react"
import { useRequireAuth } from "@/app/lib/hooks/useRequireAuth"
import Navbar from "@/components/layout/Navbar"
import DashboardNav from "@/components/layout/dashboard"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authorized = useRequireAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!authorized) {
    return (
      <nav className="flex items-center justify-center min-h-screen">
        <p>Checking auth...</p>
      </nav>
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 min-w-0 overflow-hidden">{children}</main>
      </div>
    </>
  )
}