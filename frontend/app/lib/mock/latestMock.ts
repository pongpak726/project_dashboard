const SITES = [
  "Sikhio-Outbound", "Sikhio-Inbound", "bangkok_01", "Rest Area KM 120",
  "Korat-North", "Korat-South", "Ayutthaya-01", "Ayutthaya-02",
  "Saraburi-01", "Saraburi-02", "Chonburi-01", "Chonburi-02",
  "Rayong-01", "Pattaya-01", "Nakhon-01", "Nakhon-02",
  "Lopburi-01", "Singburi-01", "Angthong-01", "Suphanburi-01",
  "Kanchanaburi-01", "Ratchaburi-01", "Samutprakan-01", "Pathumthani-01",
  "Nonthaburi-01", "Nakhonpathom-01", "Samutsakorn-01"
]

const SITE_COORDS: Record<string, { lat: number; lon: number }> = {
  "Sikhio-Outbound":   { lat: 14.889,  lon: 101.724 },
  "Sikhio-Inbound":    { lat: 14.889,  lon: 101.720 },
  "bangkok_01":        { lat: 13.756,  lon: 100.502 },
  "Rest Area KM 120":  { lat: 14.500,  lon: 100.800 },
  "Korat-North":       { lat: 14.970,  lon: 102.110 },
  "Korat-South":       { lat: 14.960,  lon: 102.095 },
  "Ayutthaya-01":      { lat: 14.354,  lon: 100.570 },
  "Ayutthaya-02":      { lat: 14.360,  lon: 100.578 },
  "Saraburi-01":       { lat: 14.532,  lon: 100.912 },
  "Saraburi-02":       { lat: 14.538,  lon: 100.920 },
  "Chonburi-01":       { lat: 13.362,  lon: 100.985 },
  "Chonburi-02":       { lat: 13.368,  lon: 100.993 },
  "Rayong-01":         { lat: 12.672,  lon: 101.277 },
  "Pattaya-01":        { lat: 12.927,  lon: 100.877 },
  "Nakhon-01":         { lat: 14.970,  lon: 102.118 },
  "Nakhon-02":         { lat: 14.976,  lon: 102.126 },
  "Lopburi-01":        { lat: 14.799,  lon: 100.654 },
  "Singburi-01":       { lat: 14.890,  lon: 100.402 },
  "Angthong-01":       { lat: 14.596,  lon: 100.460 },
  "Suphanburi-01":     { lat: 14.473,  lon: 100.129 },
  "Kanchanaburi-01":   { lat: 14.004,  lon:  99.547 },
  "Ratchaburi-01":     { lat: 13.537,  lon:  99.817 },
  "Samutprakan-01":    { lat: 13.596,  lon: 100.602 },
  "Pathumthani-01":    { lat: 14.019,  lon: 100.529 },
  "Nonthaburi-01":     { lat: 13.859,  lon: 100.516 },
  "Nakhonpathom-01":   { lat: 13.819,  lon: 100.064 },
  "Samutsakorn-01":    { lat: 13.547,  lon: 100.274 },
}

const randomTime = () =>
  new Date(Date.now() - Math.floor(Math.random() * 30) * 60000)
    .toISOString().replace("T", " ").slice(0, 19)

export const buildMockLatestWeather = () =>
  SITES.map((site, i) => ({
    site,
    deviceId: `${site}:weather-station-${String(i + 1).padStart(3, "0")}`,
    pm25: Math.floor(Math.random() * 80) + 10,
    temperature: Math.floor(Math.random() * 15) + 28,
    humidity: Math.floor(Math.random() * 40) + 40,
    timestamp: randomTime(),
    lat: SITE_COORDS[site]?.lat,
    lon: SITE_COORDS[site]?.lon,
  }))

export const buildMockLatestParking = () =>
  SITES.map((site, i) => {
    const capacity = [50, 40, 100, 60, 80, 70, 45, 55][i % 8]
    const roll = Math.random()
    const available = roll < 0.25 ? 0 : roll < 0.5 ? Math.floor(Math.random() * capacity * 0.4) : Math.floor(Math.random() * capacity)
    return {
      site,
      deviceId: `${site}:parking-${String(i + 1).padStart(3, "0")}`,
      capacity,
      available,
      used: capacity - available,
      timestamp: randomTime(),
    }
  })

export const buildMockLatestRestroom = () =>
  SITES.map((site, i) => {
    const maleTotal = [6, 8, 4, 3, 10, 6][i % 6]
    const femaleTotal = [6, 8, 4, 3, 10, 6][i % 6]
    const maleAvailable = Math.floor(Math.random() * (maleTotal + 1))
    const femaleAvailable = Math.floor(Math.random() * (femaleTotal + 1))
    return {
      site,
      deviceId: `${site}:restroom-${String(i + 1).padStart(3, "0")}`,
      maleTotal,
      maleAvailable,
      maleUsed: maleTotal - maleAvailable,
      femaleTotal,
      femaleAvailable,
      femaleUsed: femaleTotal - femaleAvailable,
      timestamp: randomTime(),
    }
  })