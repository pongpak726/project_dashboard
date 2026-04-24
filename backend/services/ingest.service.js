const externalService = require("./external.service")
const prisma = require("../prisma")
const pLimit = require("p-limit").default

const concurrency = pLimit(10)

const parseDate = (ts) => {
  const d = new Date(ts.replace(" ", "T") + "Z")
  d.setSeconds(0, 0)
  return d
}

// ✅ สร้าง composite id ที่นี่ที่เดียว
const makeDeviceId = (item) =>
  `${item.location || item.siteName}:${item.deviceId}`

const upsertDevice = (item) => {
  const id = makeDeviceId(item)
  const hasCoords = item.lat && item.lon  // ✅ declare แล้ว

  return prisma.device.upsert({
    where: { id },
    update: {
      siteName: item.location || item.siteName || "unknown",
      ...(hasCoords && { lat: item.lat, lon: item.lon })
    },
    create: {
      id,
      siteName: item.location || item.siteName || "unknown",
      lat: Number(item.lat) || 0,
      lon: Number(item.lon) || 0
    }
  })
}

// ✅ helper upsert device unique ก่อน
const upsertUniqueDevices = (data) => {
  const unique = [...new Map(data.map(i => [makeDeviceId(i), i])).values()]
  return Promise.all(unique.map(item => concurrency(() => upsertDevice(item))))
}

const ingestWeather = async ({ site, limit }) => {
  const data = await externalService.getWeather({ site, limit })
  await upsertUniqueDevices(data)

  await prisma.weather.createMany({
    data: data.map(item => ({
      deviceId: makeDeviceId(item),
      temperature: item.temperature,
      humidity: item.humidity,
      pm25: item.pm25,
      rain: item.rain,
      windSpeed: item.windSpeed,
      windDirection: item.windDirection,
      timestamp: parseDate(item.timestamp)
    })),
    skipDuplicates: true
  })
}

const ingestRestroom = async ({ site, limit }) => {
  const data = await externalService.getRestroom({ site, limit })
  await upsertUniqueDevices(data)

  await prisma.restroom.createMany({
    data: data.map(item => ({
      deviceId: makeDeviceId(item),
      maleStalls: item.maleStalls,
      maleAvailable: item.maleAvailable,
      femaleStalls: item.femaleStalls,
      femaleAvailable: item.femaleAvailable,
      timestamp: parseDate(item.timestamp)
    })),
    skipDuplicates: true
  })
}

const ingestParking = async ({ site, limit }) => {
  const data = await externalService.getParking({ site, limit })
  await upsertUniqueDevices(data)

  await prisma.parking.createMany({
    data: data.map(item => ({
      deviceId: makeDeviceId(item),
      capacity: item.capacity,
      available: item.available,
      timestamp: parseDate(item.timestamp)
    })),
    skipDuplicates: true
  })
}

exports.ingestAll = async ({ site, limit }) => {
  await Promise.all([
    ingestWeather({ site, limit }),
    ingestRestroom({ site, limit }),
    ingestParking({ site, limit })
  ])
}