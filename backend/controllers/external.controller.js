const externalService = require("../services/external.service")

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.getWeather = async (req, res, next) => {
  const { site, limit } = req.query
  const perDevice = Number(limit) || 50

  try {
    // 1. หา device ทั้งหมดก่อน
    const devices = await prisma.device.findMany({
      where: site ? { siteName: site } : {}
    })

    // 2. query แต่ละ device อย่างละ 50
    const results = await Promise.all(
      devices.map(device =>
        prisma.weather.findMany({
          where: { deviceId: device.id },
          orderBy: { timestamp: "desc" },
          take: perDevice
        })
      )
    )

    // 3. รวมและเรียงใหม่
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
  const perDevice = Number(limit) || 50

  try {
    const devices = await prisma.device.findMany({
      where: site ? { siteName: site } : {}
    })

    const results = await Promise.all(
      devices.map(device =>
        prisma.restroom.findMany({
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

exports.getParking = async (req, res, next) => {
  const { site, limit } = req.query
  const perDevice = Number(limit) || 50

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




// exports.getRestroom = async (req, res, next) => {
//   try {
//     const { site, limit } = req.query

//     const data = await externalService.getRestroom({
//       site,
//       limit: Number(limit)
//     })

//     res.json({
//       success: true,
//       message: "Restroom retrieved successfully",
//       data
//     })
//   } catch (err) {
//     next(err)
//   }
// }

// exports.getWeather = async (req, res, next) => {
//   try {
//     const { site, limit } = req.query

//     const data = await externalService.getWeather({
//       site,
//       limit: Number(limit)
//     })

//     res.json({
//       success: true,
//       message: "Weather retrieved successfully",
//       data
//     })
//   } catch (err) {
//     next(err)
//   }
// }

// exports.getOverview = async (req, res, next) => {
//   try {
//     const { site, limit } = req.query

//     const sites = Array.isArray(site) ? site : [site]

//     const results = await Promise.all(
//       sites.map(async (s) => {
//         const [weather, restroom, parking] = await Promise.all([
//           externalService.getWeather({ site: s, limit: Number(limit) }),
//           externalService.getRestroom({ site: s, limit: Number(limit) }),
//           externalService.getParking({ site: s, limit: Number(limit) })
//         ])

//         return {
//           site: s,
//           weather,
//           restroom,
//           parking
//         }
//       })
//     )

//     res.json({
//       success: true,
//       message: "Overview retrieved successfully",
//       data: results
//     })
//   } catch (err) {
//     next(err)
//   }
// }

// exports.getParking = async (req, res, next) => {
//   try {
//     const { site, limit } = req.query

//     const data = await externalService.getParking({
//       site,
//       limit: Number(limit)
//     })

//     res.json({
//       success: true,
//       message: "Parking retrieved successfully",
//       data
//     })
//   } catch (err) {
//     next(err)
//   }
// }