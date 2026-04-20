exports.getWeather = async () => {
    const response = await fetch(process.env.EXTERNAL_API, {
    headers: {
        Authorization: `Bearer ${process.env.SECRET_API}`,
        "Content-Type": "application/json"
    }
  })

    if (!response.ok) {
        throw new Error("Weather API failed")
    }
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