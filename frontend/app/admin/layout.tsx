"use client"

import { useEffect,useState } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/app/lib/auth"
import AdminNavbar from "@/components/layout/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    const router = useRouter()
    const [allowed, setAllowed] = useState(false)

    useEffect(() => {
        const user = getUser()

        if (!user) {
        router.push("/login")
        return
        }

        if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        router.push("/dashboard")
        return
        }

        
        setAllowed(true)
    }, [])

    if (!allowed) return null

    return (
        <div className="flex">
            <AdminNavbar />

            <main className="flex-1 bg-gray-100 ">
                {children}
            </main>
        </div>
    );
}