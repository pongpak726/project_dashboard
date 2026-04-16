"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    setLoading(false)
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-black text-center font-bold text-2xl pt-2">
        Dashboard
      </h1>
    </div>
  )
}