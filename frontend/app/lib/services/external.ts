import { apiClient } from "@/app/lib/apiClient"

export const getWeather = () =>
  apiClient("/dashboard/weather")

// ถ้ามีหลาย API
// export const getParking = () =>
//   apiClient("/parking")

// export const getRestroom = () =>
//   apiClient("/restroom")