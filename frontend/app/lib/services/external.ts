import { apiClient } from "@/app/lib/apiClient"

export const getWeather = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/weather?site=${encodeURIComponent(site)}&limit=${limit}`
  )

// ถ้ามีหลาย API
// export const getParking = () =>
//   apiClient("/dashboard/parking")

export const getRestroom = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/restroom?site=${encodeURIComponent(site)}&limit=${limit}`
  )

export const getOverview = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/overview?site=${encodeURIComponent(site)}&limit=${limit}`
  )