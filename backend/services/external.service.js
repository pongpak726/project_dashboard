const fetchExternal = require("../utils/fetchexternal")


exports.getWeather = async ({ site, limit } = {}) => {
  const data = await fetchExternal("weather", { site_name: site || "bangkok_01", limit: Number(limit) || 10 })
  if (!Array.isArray(data.data)) throw new Error("Invalid API response")

  return data.data.map(item => ({
    location: item.site_name,
    deviceId: item.device_id,
    lat: Number(item.latitude) || 0,
    lon: Number(item.longitude) || 0,
    temperature: Number(item.temp_c) || 0,
    humidity: Number(item.humidity_pct) || 0,
    pm25: Number(item.pm25_ugm3) || 0,
    rain: item.rain_mm != null ? Number(item.rain_mm) : null,
    windSpeed: item.wind_kph != null ? Number(item.wind_kph) : null,
    windDirection: item.wind_dir_deg != null ? Number(item.wind_dir_deg) : null,
    timestamp: item.created_at
  }))
}

exports.getRestroom = async ({ site, limit } = {}) => {
  const data = await fetchExternal("restroom", { site_name: site, limit: Number(limit) || 10 })
  if (!Array.isArray(data.data)) throw new Error("Invalid API response")

  return data.data.map(item => ({
    siteName: item.site_name,
    deviceId: item.device_id,
    lat: Number(item.latitude) || 0,   
    lon: Number(item.longitude) || 0,  
    maleStalls: Number(item.male_stalls) || 0,
    maleAvailable: Number(item.male_available) || 0,
    femaleStalls: Number(item.female_stalls) || 0,
    femaleAvailable: Number(item.female_available) || 0,
    timestamp: item.created_at
  }))
}

exports.getParking = async ({ site, limit } = {}) => {
  const data = await fetchExternal("parking", { site_name: site, limit: Number(limit) || 10 })
  if (!Array.isArray(data.data)) throw new Error("Invalid API response")

  return data.data.map(item => ({
    siteName: item.site_name,
    deviceId: item.device_id,
    lat: Number(item.latitude) || 0,
    lon: Number(item.longitude) || 0,
    capacity: Number(item.capacity) || 0,
    available: Number(item.available) || 0,
    timestamp: item.created_at
  }))
}



// exports.getRestroom = async ({ site = "Rest Area KM 120" , limit = 10 }) => {
//   const params = { limit }

//   if (site) {
//     params.site_name = site
//   }

//   const url = buildUrl("restroom", params)

//   const response = await fetch(url, {
//     headers: {
//       Authorization: `Bearer ${process.env.SECRET_API}`
//     }
//   })

//   if (!response.ok) {
//     throw new Error("Restroom API failed")
//   }

//   const data = await response.json()

//   if (!data.data || !Array.isArray(data.data)) {
//     throw new Error("Invalid restroom API format")
//   }

//   return data.data.map(item => ({
//     siteName: item.site_name,
//     deviceId: item.device_id,
//     maleStalls: item.male_stalls,
//     maleAvailable: item.male_available,
//     femaleStalls: item.female_stalls,
//     femaleAvailable: item.female_available,
//     timestamp: item.created_at
//   }))
// }