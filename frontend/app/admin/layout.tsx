"use client"

import { useRequireAuth } from "@/app/lib/hooks/useRequireAuth"
import AdminNavbar from "@/components/layout/AdminNavbar"
import Navbar from "@/components/layout/Navbar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authorized = useRequireAuth(["ADMIN", "SUPER_ADMIN"])

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
        <main className="flex-1 bg-gray-100">{children}</main>
      </div>
    </>
  )
}