import { useEffect } from "react"
import { decodeToken, isTokenExpired } from "@/app/lib/auth"

export function useSilentRefresh() {
  useEffect(() => {
    let timer: NodeJS.Timeout

    const schedule = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const payload = decodeToken(token)
      if (!payload?.exp) return

      const now = Math.floor(Date.now() / 1000)
      const refreshAt = (payload.exp - now - 60) * 1000 // ✅ ก่อนหมด 1 นาที

      // ✅ ถ้าหมดแล้ว → ลอง refresh ทันทีเลย
        if (refreshAt <= 0) {
        // token หมดแล้ว ให้ useRequireAuth จัดการ หรือ refresh ทันที
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken })
        })

        if (res.ok) {
            const data = await res.json()
            localStorage.setItem("accessToken", data.accessToken)
            schedule() // วน schedule ใหม่
        }
        return
        }

      timer = setTimeout(async () => {
        const refreshToken = localStorage.getItem("refreshToken")
        if (!refreshToken) return

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        })

        if (res.ok) {
          const data = await res.json()
          localStorage.setItem("accessToken", data.accessToken)
          schedule() // ✅ วน schedule ครั้งถัดไป
        }
      }, refreshAt)
    }

    schedule()
    return () => clearTimeout(timer)
  }, [])
}