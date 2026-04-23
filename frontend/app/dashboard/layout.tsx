"use client"

import { useRequireAuth } from "@/app/lib/hooks/useRequireAuth"
import Navbar from "@/components/layout/Navbar"
import DashboardNav from "@/components/layout/dashboard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authorized = useRequireAuth()

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking auth...</p>
      </div>
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