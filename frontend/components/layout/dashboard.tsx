"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardNav() {
  const pathname = usePathname()

  const menus = [
    { name: "Overview", href: "/dashboard" },
    { name: "Weather", href: "/dashboard/weather" },
    { name: "Parking", href: "/dashboard/parking" },
    { name: "Restroom", href: "/dashboard/restroom" },
  ]

  return (
    <div className="flex gap-4 p-4 border-b bg-white">
      {menus.map((menu) => {
        const isActive = pathname === menu.href

        return (
          <Link
            key={menu.href}
            href={menu.href}
            className={`px-3 py-1 rounded ${
              isActive
                ? "bg-blue-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {menu.name}
          </Link>
        )
      })}
    </div>
  )
}