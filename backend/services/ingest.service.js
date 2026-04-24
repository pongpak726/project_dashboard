const externalService = require("./external.service")
const prisma = require("../prisma")
const pLimit = require("p-limit")

const concurrency = pLimit(10)  // ✅ เปลี่ยนชื่อไม่ชนกับ param limit

const parseDate = (ts) => new Date(ts.replace(" ", "T") + "Z")

const upsertDevice = (item) =>
  prisma.device.upsert({
    where: { id: item.deviceId },
    update: {
      siteName: item.location || item.siteName || "unknown"
      // ✅ ไม่ update lat/lon เพราะไม่มีข้อมูลจาก GET
    },
    create: {
      id: item.deviceId,
      siteName: item.location || item.siteName || "unknown",
      lat: 0,  // placeholder — lat/lon จริงอยู่ใน POST ที่ external รับ
      lon: 0
    }
  })

const processBatch = async (data, handler) => {
  // ✅ upsert device เฉพาะตัวที่ unique — ไม่ยิงซ้ำ
  const uniqueDevices = [...new Map(data.map(i => [i.deviceId, i])).values()]
  await Promise.all(uniqueDevices.map(item => concurrency(() => upsertDevice(item))))

  // ✅ แล้วค่อย upsert log ทั้งหมด
  await Promise.all(
    data.map(item =>
      concurrency(async () => {
        const timestamp = parseDate(item.timestamp)
        await handler(item, timestamp)
      })
    )
  )
}

const ingestWeather = async ({ site, limit }) => {
  const data = await externalService.getWeather({ site, limit })
  await processBatch(data, (item, timestamp) =>
    prisma.weather.upsert({
      where: { deviceId_timestamp: { deviceId: item.deviceId, timestamp } },
      update: {},
      create: {
        deviceId: item.deviceId,
        temperature: item.temperature,
        humidity: item.humidity,
        pm25: item.pm25,
        rain: item.rain,             
        windSpeed: item.windSpeed,   
        windDirection: item.windDirection, 
        timestamp
      }
    })
  )
}

const ingestRestroom = async ({ site, limit }) => {
  const data = await externalService.getRestroom({ site, limit })
  await processBatch(data, (item, timestamp) =>
    prisma.restroom.upsert({
      where: { deviceId_timestamp: { deviceId: item.deviceId, timestamp } },
      update: {},
      create: {
        deviceId: item.deviceId,
        maleStalls: item.maleStalls,
        maleAvailable: item.maleAvailable,
        femaleStalls: item.femaleStalls,
        femaleAvailable: item.femaleAvailable,
        timestamp
      }
    })
  )
}

const ingestParking = async ({ site, limit }) => {
  const data = await externalService.getParking({ site, limit })
  await processBatch(data, (item, timestamp) =>
    prisma.parking.upsert({
      where: { deviceId_timestamp: { deviceId: item.deviceId, timestamp } },
      update: {},
      create: {
        deviceId: item.deviceId,
        capacity: item.capacity,
        available: item.available,
        timestamp
      }
    })
  )
}

exports.ingestAll = async ({ site, limit }) => {
  await Promise.all([
    ingestWeather({ site, limit }),
    ingestRestroom({ site, limit }),
    ingestParking({ site, limit })
  ])
}