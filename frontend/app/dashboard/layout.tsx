"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import DashboardNav from "@/components/layout/dashboard"
import { getUser } from "../lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = getUser()

    if (!user) {
      router.replace("/login")
      return
    }

    setAuthorized(true)
  }, [])

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
        <main className="flex-1 min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </>
  )
}