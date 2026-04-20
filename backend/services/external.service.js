exports.getWeather = async () => {
  const response = await fetch(process.env.WEATHER_API)

  if (!response.ok) {
    throw new Error("Weather API failed")
  }

  const data = await response.json()

  return {
    location: data.site_name,
    temperature: data.temp_c,
    humidity: data.humidity_pct,
    pm25: data.pm25_ugm3,
    timestamp: data.created_at
  }
}