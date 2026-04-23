import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getUser, isTokenExpired } from "@/app/lib/auth"  // ✅ import มาใช้

type Role = "USER" | "ADMIN" | "SUPER_ADMIN"

async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken")
  if (!refreshToken) return false

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) return false

    const data = await res.json()
    localStorage.setItem("accessToken", data.accessToken)
    return true
  } catch {
    return false
  }
}

export function useRequireAuth(allowedRoles?: Role[]) {
  const router = useRouter()
  const pathname = usePathname()

  const [authorized, setAuthorized] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const user = getUser()
    if (!user) return false
    if (allowedRoles && !allowedRoles.includes(user.role as Role)) return false
    return true
  })

  useEffect(() => {
    const check = async () => {
      let user = getUser()

      if (!user) {
        const accessToken = localStorage.getItem("accessToken")
        const expired = !!accessToken && isTokenExpired(accessToken)

        if (expired) {
          const ok = await tryRefresh()
          if (ok) user = getUser()
        }

        if (!user) {
          localStorage.clear()
          router.replace("/login")
          return
        }
      }

      if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
        router.replace("/dashboard")
        return
      }

      setAuthorized(true)
    }

    check()
  }, [pathname])

  return authorized
}