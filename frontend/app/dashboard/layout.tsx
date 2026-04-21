"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import DashboardNav from "@/components/layout/dashboard"
import { getUser } from "../lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const user = getUser()

    if (!user) {
      router.push("/login")
      return
    }


    setLoading(false)
  }, [pathname])

  if (loading) return <div>Loading...</div>

  return (
    <>
      <Navbar />
      <div className="flex">
  <DashboardNav />
  <main className="flex-1">
    {children}
  </main>
</div>
    </>
  )
}