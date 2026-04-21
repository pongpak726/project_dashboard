// ====PM2.5/day====
export const buildPm25Chart = (data: any[]) => {
  const grouped: any = {}

  data.forEach(item => {
    const day = item.timestamp.split("T")[0]

    if (!grouped[day]) grouped[day] = []

    grouped[day].push(item.pm25)
  })

  return Object.entries(grouped).map(([day, values]: any) => ({
    day,
    avg: values.reduce((a: number, b: number) => a + b, 0) / values.length
  }))
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
export const buildAvailabilityChart = (data: any[]) => {
  const grouped: Record<string, number[]> = {}

  data.forEach(item => {
    const time = new Date(item.timestamp)

    const minutes = Math.floor(time.getMinutes() / 5) * 5

    const label = `${time
      .getHours()
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    const total =
      (item.male_stalls ?? 0) +
      (item.female_stalls ?? 0)

    const available =
      (item.male_available ?? 0) +
      (item.female_available ?? 0)

    const percent = total === 0 ? 0 : (available / total) * 100

    if (!grouped[label]) {
      grouped[label] = []
    }

    grouped[label].push(percent)
  })

  const result = Object.entries(grouped).map(([time, values]) => ({
    time,
    avg:
      values.reduce((sum, v) => sum + v, 0) /
      values.length
  }))

  return result.sort((a, b) => {
    const [h1, m1] = a.time.split(":").map(Number)
    const [h2, m2] = b.time.split(":").map(Number)
    return h1 * 60 + m1 - (h2 * 60 + m2)
  })
}