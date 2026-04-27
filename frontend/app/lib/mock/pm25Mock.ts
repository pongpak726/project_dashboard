export const PM25_MOCK_SITES = [
  "Sikhio-Outbound", "Sikhio-Inbound", "bangkok_01", "Rest Area KM 120",
  "Korat-North", "Korat-South", "Ayutthaya-01", "Ayutthaya-02",
  "Saraburi-01", "Saraburi-02", "Chonburi-01", "Chonburi-02",
  "Rayong-01", "Pattaya-01", "Nakhon-01", "Nakhon-02",
  "Lopburi-01", "Singburi-01", "Angthong-01", "Suphanburi-01",
  "Kanchanaburi-01", "Ratchaburi-01", "Samutprakan-01", "Pathumthani-01",
  "Nonthaburi-01", "Nakhonpathom-01", "Samutsakorn-01"
]

export const buildMockPm25Data = () => {
  return Array.from({ length: 10 }, (_, i) => {
    const row: any = { index: i + 1 }
    PM25_MOCK_SITES.forEach(site => {
      row[site] = Math.floor(Math.random() * 60) + 20
      row[`${site}_time`] = `${String(8 + i).padStart(2, "0")}:00`
    })
    return row
  })
}