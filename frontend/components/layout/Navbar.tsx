"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getUser } from "@/app/lib/auth"
import { getRoleBadge } from "@/app/lib/badge"
import { IoLogOutSharp } from "react-icons/io5"
import Swal from "sweetalert2"

type UserPayload = {
  id: string
  username: string
  role: "USER" | "ADMIN" | "SUPER_ADMIN"
  exp: number
}

export default function Navbar() {
  const [user, setUser] = useState<UserPayload | null>(null)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setUser(getUser())
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = () => {
    setOpen(false)
    Swal.fire({
      title: "Logout?",
      text: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        router.replace("/login")
      }
    })
  }

  const navLinkClass = (href: string, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href)
    return `px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150
      ${isActive
        ? "bg-white/15 text-white"
        : "text-gray-400 hover:text-white hover:bg-white/10"
      }`
  }

  const roleLabel: Record<string, string> = {
    USER: "User",
    ADMIN: "Admin",
    SUPER_ADMIN: "Super Admin",
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-[#0f172a] border-b border-white/10 text-white">
      <h1 className="font-bold text-lg tracking-wide">Dashboard</h1>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link href="/dashboard" className={navLinkClass("/dashboard", true)}>
              Dashboard
            </Link>

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <Link href="/admin/users" className={navLinkClass("/admin")}>
                Admin
              </Link>
            )}

            {/* Profile avatar + dropdown */}
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center font-bold text-sm uppercase transition-colors ring-2 ring-white/20"
              >
                {user.username?.[0] ?? "?"}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                      {user.username?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{user.username}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadge(user.role)}`}>
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </div>
                  </div>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <IoLogOutSharp size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link href="/login" className={navLinkClass("/login", true)}>
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}