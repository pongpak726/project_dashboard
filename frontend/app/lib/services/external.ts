import { apiClient } from "@/app/lib/apiClient"

export const getWeather = (site: string, limit = 10, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ site, limit: String(limit) })
  if (startDate) params.append("startDate", startDate)
  if (endDate) params.append("endDate", endDate)
  return apiClient(`/dashboard/weather?${params.toString()}`)
}



export const getRestroom = (site: string, limit = 10, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ site, limit: String(limit) })
  if (startDate) params.append("startDate", startDate)
  if (endDate) params.append("endDate", endDate)
  console.log("URL:", `/dashboard/restroom?${params.toString()}`)
  return apiClient(`/dashboard/restroom?${params.toString()}`)
}

export const getOverview = (site: string | string[], limit = 10) => {
  const query = Array.isArray(site)
    ? site.map(s => `site=${encodeURIComponent(s)}`).join("&")
    : `site=${encodeURIComponent(site)}`

  return apiClient(`/dashboard/overview?${query}&limit=${limit}`)
}

export const getParking = (site: string, limit = 10, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ site, limit: String(limit) })
  if (startDate) params.append("startDate", startDate)
  if (endDate) params.append("endDate", endDate)
  return apiClient(`/dashboard/parking?${params.toString()}`)
}