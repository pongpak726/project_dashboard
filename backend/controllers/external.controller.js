const externalService = require("../services/external.service")

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.getWeather = async (req, res, next) => {
  const { site, limit, startDate, endDate } = req.query  // เพิ่ม startDate, endDate
  const perDevice = Number(limit) || 50

  const timestampFilter = {}
  if (startDate) timestampFilter.gte = new Date(startDate)
  if (endDate) timestampFilter.lte = new Date(endDate)

  try {
    const devices = await prisma.device.findMany({
      where: site ? { siteName: site } : {}
    })

    const results = await Promise.all(
      devices.map(device =>
        prisma.weather.findMany({
          where: {
            deviceId: device.id,
            ...(Object.keys(timestampFilter).length > 0 && { timestamp: timestampFilter }) // เพิ่มตรงนี้
          },
          orderBy: { timestamp: "desc" },
          take: perDevice
        })
      )
    )

    const data = results.flat().sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )

    res.json({ success: true, count: data.length, data })
  } catch (err) {
    next(err)
  }
}



exports.getRestroom = async (req, res, next) => {
  const { site, limit } = req.query
  const startDate = req.query.startDate ? decodeURIComponent(req.query.startDate) : undefined
  const endDate = req.query.endDate ? decodeURIComponent(req.query.endDate) : undefined
  const perDevice = Number(limit) || 50

  const timestampFilter = {}
  if (startDate) timestampFilter.gte = new Date(startDate)
  if (endDate) timestampFilter.lte = new Date(endDate)

  try {
    const devices = await prisma.device.findMany({
      where: site ? { siteName: site } : {}
    })

    const results = await Promise.all(
      devices.map(device =>
        prisma.restroom.findMany({
          where: {
            deviceId: device.id,
            ...(Object.keys(timestampFilter).length > 0 && { timestamp: timestampFilter })
          },
          orderBy: { timestamp: "desc" },
          take: perDevice
        })
      )
    )

    const data = results.flat().sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )

    res.json({ success: true, count: data.length, data })
  } catch (err) {
    next(err)
  }
}

exports.getParking = async (req, res, next) => {
  const { site, limit, startDate, endDate } = req.query
  const perDevice = Number(limit) || 50

   const timestampFilter = {}
  if (startDate) timestampFilter.gte = new Date(startDate)
  if (endDate) timestampFilter.lte = new Date(endDate)

  try {
    const devices = await prisma.device.findMany({
      where: site ? { siteName: site } : {}
    })

    const results = await Promise.all(
      devices.map(device =>
        prisma.parking.findMany({
          where: { deviceId: device.id },
          orderBy: { timestamp: "desc" },
          take: perDevice
        })
      )
    )

    const data = results.flat().sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    )

    res.json({ success: true, count: data.length, data })
  } catch (err) {
    next(err)
  }
}

exports.getOverview = async (req, res, next) => {
  const { site, limit } = req.query
  const sites = Array.isArray(site) ? site : [site]
  const perDevice = Number(limit) || 50

  try {
    const results = await Promise.all(
      sites.map(async (s) => {
        const devices = await prisma.device.findMany({
          where: s ? { siteName: s } : {}
        })

        const [weatherArr, restroomArr, parkingArr] = await Promise.all([
          Promise.all(devices.map(d =>
            prisma.weather.findMany({
              where: { deviceId: d.id },
              orderBy: { timestamp: "desc" },
              take: perDevice
            })
          )),
          Promise.all(devices.map(d =>
            prisma.restroom.findMany({
              where: { deviceId: d.id },
              orderBy: { timestamp: "desc" },
              take: perDevice
            })
          )),
          Promise.all(devices.map(d =>
            prisma.parking.findMany({
              where: { deviceId: d.id },
              orderBy: { timestamp: "desc" },
              take: perDevice
            })
          ))
        ])

        const sort = (arr) => arr.flat().sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        )

        return {
          site: s,
          devices: devices.map(d => ({ id: d.id, lat: Number(d.lat) || null, lon: Number(d.lon) || null })),
          weather: sort(weatherArr),
          restroom: sort(restroomArr),
          parking: sort(parkingArr)
        }
      })
    )

    res.json({ success: true, data: results })
  } catch (err) {
    next(err)
  }
}


exports.getDevices = async (req, res, next) => {
  try{
  const data = await prisma.device.findMany({
    select: {
      id: true,
      siteName: true,
      lat: true,
      lon: true
    }
  })

  res.json({ success: true, data })
}catch (err) {
    next(err)
  }
}


