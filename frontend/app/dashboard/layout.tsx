"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUser } from "@/app/lib/auth"
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export default function dashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) { 
    const router = useRouter()

    useEffect(() => {
        const user = getUser()

        if (!user) {
        router.push("/login")
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />

                <div className="flex-1">
                    {children}
                </div>

            <Footer />
        </div>
    );
}