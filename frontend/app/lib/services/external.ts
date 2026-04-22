import { apiClient } from "@/app/lib/apiClient"

export const getWeather = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/weather?site=${encodeURIComponent(site)}&limit=${limit}`
  )



export const getRestroom = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/restroom?site=${encodeURIComponent(site)}&limit=${limit}`
  )

export const getOverview = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/overview?site=${encodeURIComponent(site)}&limit=${limit}`
  )

export const getParking = (site: string, limit = 10) =>
  apiClient(
    `/dashboard/parking?site=${encodeURIComponent(site)}&limit=${limit}`
  )