"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { decodeToken } from "@/app/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) return

    const payload = decodeToken(token)

    if (!payload) {
      localStorage.removeItem("token")
      return
    }

    setUser(payload)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-white text-black">
      <Link href="/" className="font-bold text-xl">Home</Link>

      <div className="flex gap-4">
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <Link href="/admin/users">Users</Link>
            )}

            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}