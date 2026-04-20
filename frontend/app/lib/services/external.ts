import { apiClient } from "@/app/lib/apiClient"

export const getWeather = () =>
  apiClient("/dashboard/weather")

// ถ้ามีหลาย API
// export const getParking = () =>
//   apiClient("/dashboard/parking")

 export const getRestroom = () =>
   apiClient("/dashboard/restroom")