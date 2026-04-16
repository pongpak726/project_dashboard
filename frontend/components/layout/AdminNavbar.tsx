"use client"

import { useRouter } from "next/navigation"

export default function AdminNavbar() {
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
    }

    return(
        <aside className="w-64 h-screen sticky top-0 bg-gray-800 text-white p-4 flex flex-col justify-between">
            <div>
                <h2 className="font-bold mb-4">Admin</h2>

                <ul className="space-y-2">
                <li onClick={() => router.push("/dashboard")}>Dashboard</li>
                <li onClick={() => router.push("/admin/users")}>Users</li>
                </ul>
            </div>

            <button
                onClick={handleLogout}
                className="bg-red-500 p-2 rounded mt-6"
            >
                Logout
            </button>
        </aside>
    )
}