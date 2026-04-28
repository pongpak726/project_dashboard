"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MdOutlineSpaceDashboard } from "react-icons/md"
import { WiDaySunny } from "react-icons/wi"
import { MdLocalParking } from "react-icons/md"
import { MdWc } from "react-icons/md"
import { MdTv } from "react-icons/md"

export default function DashboardNav() {
  const pathname = usePathname()

  const menus = [
    { name: "Overview",  href: "/dashboard",          icon: <MdOutlineSpaceDashboard size={24} /> },
    { name: "Weather",   href: "/dashboard/weather",  icon: <WiDaySunny size={24} /> },
    { name: "Parking",   href: "/dashboard/parking",  icon: <MdLocalParking size={24} /> },
    { name: "Restroom",  href: "/dashboard/restroom", icon: <MdWc size={24} /> },
    { name: "VMS", href: "/dashboard/vms", icon: <MdTv size={24} /> }
  ]

  const navLinkClass = (href: string) => {
    const isActive = pathname === href
    return `flex items-center gap-2 text-lg px-2 py-2 rounded transition-colors duration-150
      ${isActive
        ? "bg-gray-600 text-white font-semibold ring-1 ring-white/60"
        : "hover:bg-gray-700"
      }`
  }

  return (
    <aside className="
      group
      w-18 hover:w-64
      h-screen sticky top-0
      bg-gray-800 text-white p-4
      flex flex-col justify-between
      transition-all duration-300 overflow-hidden
    ">
      <ul className="space-y-2">
        {menus.map((menu) => (
          <li key={menu.href}>
            <Link href={menu.href} className={navLinkClass(menu.href)}>
              <span className="shrink-0">{menu.icon}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {menu.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}