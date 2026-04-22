import { apiClient } from "@/app/lib/apiClient"

export const getWeather = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/weather?site=${encodeURIComponent(site)}&limit=${limit}`
  )



export const getRestroom = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/restroom?site=${encodeURIComponent(site)}&limit=${limit}`
  )

export const getOverview = (site: string | string[], limit = 10) => {
  const query = Array.isArray(site)
    ? site.map(s => `site=${encodeURIComponent(s)}`).join("&")
    : `site=${encodeURIComponent(site)}`

  return apiClient(`/dashboard/overview?${query}&limit=${limit}`)
}

export const getParking = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/parking?site=${encodeURIComponent(site)}&limit=${limit}`
  )