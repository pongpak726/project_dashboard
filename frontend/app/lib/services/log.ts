import { apiClient } from "@/app/lib/apiClient"

export const getLogs = (params: { page?: number; limit?: number; username?: string } = {}) => {
  const qs = new URLSearchParams()
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))
  if (params.username) qs.set("username", params.username)
  return apiClient(`/logs?${qs.toString()}`)
}