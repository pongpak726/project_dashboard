export const PARKING_MOCK_SITES = [
  "Sikhio-Outbound", "Sikhio-Inbound", "bangkok_01", "Rest Area KM 120",
  "Korat-North", "Korat-South", "Ayutthaya-01", "Ayutthaya-02",
  "Saraburi-01", "Saraburi-02", "Chonburi-01", "Chonburi-02",
  "Rayong-01", "Pattaya-01", "Nakhon-01", "Nakhon-02",
  "Lopburi-01", "Singburi-01", "Angthong-01", "Suphanburi-01",
  "Kanchanaburi-01", "Ratchaburi-01", "Samutprakan-01", "Pathumthani-01",
  "Nonthaburi-01", "Nakhonpathom-01", "Samutsakorn-01"
]

export const buildMockParkingLatest = () => {
  return PARKING_MOCK_SITES.map((site, i) => {
    const capacity = [50, 40, 100, 60, 80, 70, 45, 55][i % 8]
    const available = Math.floor(Math.random() * capacity)
    return {
      site,
      deviceId: `parking-${String(i + 1).padStart(3, "0")}`,
      capacity,
      available,
      used: capacity - available,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 60000)
        .toISOString().replace("T", " ").slice(0, 19),
    }
  })
}