// ====PM2.5/day====

export const buildMultiSitePm25Chart = (data: any[]) => {
  // group by site ก่อน
  const bySite: Record<string, any[]> = {}

  data.forEach(item => {
    if (!bySite[item.site]) bySite[item.site] = []
    bySite[item.site].push({
      pm25: Number(item.pm25) || 0,
      time: new Date(item.timestamp).toISOString().slice(11, 16)
    })
  })

  // หา maxLength ของ site ที่ยาวสุด
  const maxLen = Math.max(...Object.values(bySite).map(arr => arr.length))

  // build rows by index
  const result = []
  for (let i = 0; i < maxLen; i++) {
    const row: any = { index: i + 1 }
    Object.entries(bySite).forEach(([site, arr]) => {
      if (arr[i] !== undefined) {
        row[site] = arr[i].pm25
        row[`${site}_time`] = arr[i].time  // เก็บเวลาจริงไว้ใน tooltip
      }
    })
    result.push(row)
  }

  return result
}

// restroom chart
export const buildMultiSiteRestroomChart = (data: any[]) => {
  const grouped: Record<string, any> = {}

  data.forEach(item => {
    const date = new Date(item.timestamp)
    const minutes = Math.floor(date.getMinutes() / 5) * 5

    const time = `${date.getHours()
      .toString()
      .padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`

    const used =
      (Number(item.maleStalls) - Number(item.maleAvailable)) +
      (Number(item.femaleStalls) - Number(item.femaleAvailable))

    if (!grouped[time]) {
      grouped[time] = { time }
    }

    grouped[time][item.site] = Math.max(0, used)
  })

  return Object.values(grouped)
}

export const buildMultiSiteTempChart = (data: any[]) => {
  const bySite: Record<string, any[]> = {}

  data.forEach(item => {
    if (!bySite[item.site]) bySite[item.site] = []
    bySite[item.site].push({
      temperature: Number(item.temperature) || 0,
      time: new Date(item.timestamp).toISOString().slice(11, 16)
    })
  })

  const maxLen = Math.max(...Object.values(bySite).map(arr => arr.length))

  const result = []
  for (let i = 0; i < maxLen; i++) {
    const row: any = { index: i + 1 }
    Object.entries(bySite).forEach(([site, arr]) => {
      if (arr[i] !== undefined) {
        row[site] = arr[i].temperature
        row[`${site}_time`] = arr[i].time
      }
    })
    result.push(row)
  }

  return result
}
// ====restroom Usage/hour====
// export const buildUsageChart = (data: any[]) => {
//   const grouped: any = {}

//   data.forEach(item => {
//     const hour = new Date(item.timestamp).getHours()

//     const usage =
//       (item.maleStalls - item.maleAvailable) +
//       (item.femaleStalls - item.femaleAvailable)

//     if (!grouped[hour]) grouped[hour] = []

//     grouped[hour].push(usage)
//   })

//   return Object.entries(grouped).map(([hour, values]: any) => ({
//     hour,
//     avg: values.reduce((a: number, b: number) => a + b, 0) / values.length
//   }))
// }


// ====restroom Available====
// export const buildAvailabilityChart = (data: any[]) => {
//   const grouped: Record<string, number[]> = {}

//   data.forEach(item => {
//     const time = new Date(item.timestamp)

//     const minutes = Math.floor(time.getMinutes() / 5) * 5

//     const label = `${time
//       .getHours()
//       .toString()
//       .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

//     const total =
//       (item.male_stalls ?? 0) +
//       (item.female_stalls ?? 0)

//     const available =
//       (item.male_available ?? 0) +
//       (item.female_available ?? 0)

//     const percent = total === 0 ? 0 : (available / total) * 100

//     if (!grouped[label]) {
//       grouped[label] = []
//     }

//     grouped[label].push(percent)
//   })

//   const result = Object.entries(grouped).map(([time, values]) => ({
//     time,
//     avg:
//       values.reduce((sum, v) => sum + v, 0) /
//       values.length
//   }))

//   return result.sort((a, b) => {
//     const [h1, m1] = a.time.split(":").map(Number)
//     const [h2, m2] = b.time.split(":").map(Number)
//     return h1 * 60 + m1 - (h2 * 60 + m2)
//   })
// }