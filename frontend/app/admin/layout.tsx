"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/app/lib/auth"
import AdminNavbar from "@/components/layout/AdminNavbar"
import Navbar from "@/components/layout/Navbar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const user = getUser()

    if (!user) {
      router.replace("/login") // 🔥 replace แทน push
      return
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/dashboard")
      return
    }

    setAuthorized(true)
  }, [])

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Checking permission...</p>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="flex">
        <AdminNavbar />
        <main className="flex-1 bg-gray-100">
          {children}
        </main>
      </div>
    </>
  )
}