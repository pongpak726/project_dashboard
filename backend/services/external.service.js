const fetchExternal = require("../utils/fetchexternal")


exports.getWeather = async ({ site, limit } = {}) => {
  const data = await fetchExternal("weather", { site_name: site || "bangkok_01", limit: Number(limit) || 10 })
  if (!Array.isArray(data.data)) throw new Error("Invalid API response")

  return data.data.map(item => ({
    location: item.site_name,
    deviceId: item.device_id,
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
    capacity: Number(item.capacity) || 0,
    available: Number(item.available) || 0,
    timestamp: item.created_at
  }))
}


