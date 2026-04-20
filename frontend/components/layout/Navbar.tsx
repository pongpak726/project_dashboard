"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/app/lib/auth"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
  const user = getUser()
  setUser(user)
}, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-white text-black">
      <Link href="/" className="font-bold text-xl">Home</Link>

      <div className="flex gap-16 bg-black text-white">
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>

            {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
              <Link href="/admin/dashboard">Admin</Link>
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