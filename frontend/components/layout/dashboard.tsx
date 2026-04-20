"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function DashboardNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const menus = [
    { name: "Overview", href: "/dashboard" },
    { name: "Weather", href: "/dashboard/weather" },
    { name: "Parking", href: "/dashboard/parking" },
    { name: "Restroom", href: "/dashboard/restroom" },
  ]

  const activeMenu = menus.find((menu) => menu.href === pathname)

  return (
    <div className="relative p-4 border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {activeMenu?.name ?? "Menu"}
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="absolute mt-1 bg-white border border-gray-200 rounded shadow-md z-10">
          {menus.map((menu) => {
            const isActive = pathname === menu.href
            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`block px-6 py-2 hover:bg-gray-100 ${
                  isActive ? "text-blue-500 font-medium" : "text-gray-600"
                }`}
              >
                {menu.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}