export const RESTROOM_MOCK_SITES = [
  "Sikhio-Outbound", "Sikhio-Inbound", "bangkok_01", "Rest Area KM 120",
  "Korat-North", "Korat-South", "Ayutthaya-01", "Ayutthaya-02",
  "Saraburi-01", "Saraburi-02", "Chonburi-01", "Chonburi-02",
  "Rayong-01", "Pattaya-01", "Nakhon-01", "Nakhon-02",
  "Lopburi-01", "Singburi-01", "Angthong-01", "Suphanburi-01",
  "Kanchanaburi-01", "Ratchaburi-01", "Samutprakan-01", "Pathumthani-01",
  "Nonthaburi-01", "Nakhonpathom-01", "Samutsakorn-01"
]

export const buildMockRestroomLatest = () => {
  return RESTROOM_MOCK_SITES.map((site, i) => {
    const maleTotal = [6, 8, 4, 3, 10, 6][i % 6]
    const femaleTotal = [6, 8, 4, 3, 10, 6][i % 6]
    const maleAvailable = Math.floor(Math.random() * (maleTotal + 1))
    const femaleAvailable = Math.floor(Math.random() * (femaleTotal + 1))
    return {
      site,
      deviceId: `restroom-${String(i + 1).padStart(3, "0")}`,
      maleTotal,
      maleAvailable,
      maleUsed: maleTotal - maleAvailable,
      femaleTotal,
      femaleAvailable,
      femaleUsed: femaleTotal - femaleAvailable,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 60000)
        .toISOString().replace("T", " ").slice(0, 19),
    }
  })
}