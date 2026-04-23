"use client"

import { useSilentRefresh } from "@/app/lib/hooks/useSilentRefresh"

export function SilentRefreshProvider({ children }: { children: React.ReactNode }) {
  useSilentRefresh() // ✅ Hook อยู่ใน Client Component แล้ว
  return <>{children}</>
}