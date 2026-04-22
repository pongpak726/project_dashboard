"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { IoLogOutSharp } from "react-icons/io5";
import Swal from "sweetalert2";

export default function AdminNavbar() {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = () => {
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
    

    const navLinkClass = (href: string) => {
    const isActive = pathname === href
    return `flex items-center gap-2 text-lg px-2 py-2 rounded transition-colors duration-150
        ${isActive
            ? "bg-gray-600 text-white font-semibold ring-1 ring-white/60"
            : "hover:bg-gray-700"
        }`
}

    return(
        <aside className="
            group
            w-18 hover:w-64
            h-screen sticky top-0
            bg-gray-800 text-white p-4
            flex flex-col justify-between
            transition-all duration-300 overflow-hidden
        ">
            <div>
                <ul className="space-y-2 ">
                    <li>
                        <Link href="/admin/dashboard" className={navLinkClass("/admin/dashboard")}>
                            <span className="shrink-0">
                                <RiDashboardHorizontalLine size={24} />
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap ">
                                Dashboard
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/users" className={navLinkClass("/admin/users")}>
                            <span className="shrink-0">
                                <FaUsers size={24} />
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                Users
                            </span>
                        </Link>
                    </li>
                </ul>
            </div>

            <button
    onClick={handleLogout}
    className="bg-red-500 hover:bg-red-600 p-2 rounded mt-6 transition-colors duration-150 flex items-center gap-2"
>
    <span className="shrink-0">
        <IoLogOutSharp size={24} />
    </span>
    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Logout
    </span>
</button>
        </aside>
    )
}