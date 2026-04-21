exports.getWeather = async ({ site = "bangkok_01", limit = 10 }) => {
  const url = buildUrl("weather", {
    site_name: site,
    limit
  })

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SECRET_API}`
    }
  })

  const data = await response.json()

  return data.data.map(item => ({
    location: item.site_name,
    deviceId: item.device_id,
    temperature: item.temp_c,
    humidity: item.humidity_pct,
    pm25: item.pm25_ugm3,
    timestamp: item.created_at
  }))
}


exports.getRestroom = async ({ site = "Rest Area KM 120" , limit = 10 }) => {
  const params = { limit }

  if (site) {
    params.site_name = site
  }

  const url = buildUrl("restroom", params)

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.SECRET_API}`
    }
  })

  if (!response.ok) {
    throw new Error("Restroom API failed")
  }

  const data = await response.json()

  if (!data.data || !Array.isArray(data.data)) {
    throw new Error("Invalid restroom API format")
  }

  return data.data.map(item => ({
    siteName: item.site_name,
    deviceId: item.device_id,
    maleStalls: item.male_stalls,
    maleAvailable: item.male_available,
    femaleStalls: item.female_stalls,
    femaleAvailable: item.female_available,
    timestamp: item.created_at
  }))
}

const buildUrl = (path, params = {}) => {
  const url = new URL(`${process.env.EXTERNAL_API}/${path}`)

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  return url.toString()
}