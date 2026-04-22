export const buildPmInsight = (data: any[]) => {
  if (!data.length) {
    return { max: 0, min: 0 }
  }


  const values = data.flatMap(d =>
    Object.keys(d)
      .filter(k => k !== "time")
      .map(k => Number(d[k]) || 0)
  )

  return {
    max: Math.max(...values),
    min: Math.min(...values)
  }
}


export const buildWeatherInsight = (data: any[]) => {
  if (!data.length) {
    return {
      avgTemp: 0,
      avgHumidity: 0,
      avgPm25: 0,
      latestTime: "-"
    }
  }

  const avg = (arr: number[]) =>
    arr.reduce((a, b) => a + b, 0) / arr.length

  const temps = data.map(d => d.temperature)
  const humidity = data.map(d => d.humidity)
  const pm25 = data.map(d => d.pm25)

  const latest = new Date(
    Math.max(...data.map(d => new Date(d.timestamp).getTime()))
  )

  return {
    avgTemp: avg(temps).toFixed(1),
    avgHumidity: avg(humidity).toFixed(1),
    avgPm25: avg(pm25).toFixed(1),
    latestTime: latest.toLocaleString()
  }
}