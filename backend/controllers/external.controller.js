const externalService = require("../services/external.service")

const prisma = require("../prisma")

exports.getWeather = async (req, res, next) => {
  const { site, limit } = req.query

  try{
    const where = site
      ? { device: { siteName: site } }
      : {}

    const data = await prisma.weather.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: Number(limit) || 10
    })

    res.json({
      success: true,
      data
    })
  } catch (err){
    next(err)
  }
}



exports.getRestroom = async (req, res, next) => {
  const { site, limit } = req.query
  try{
    const where = site
      ? { device: { siteName: site } }
      : {}

    const data = await prisma.restroom.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: Number(limit) || 10
    })

    res.json({
      success: true,
      data
    })
  } catch (err){
    next(err)
  }
}


exports.getParking = async (req, res, next) => {
  const { site, limit } = req.query
  try{
    const where = site
      ? { device: { siteName: site } }
      : {}

    const data = await prisma.parking.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: Number(limit) || 10
    })

    res.json({
      success: true,
      data
    })
  } catch (err){
    next(err)
  }
}


exports.getOverview = async (req, res, next) => {
  const { site, limit } = req.query
  const sites = Array.isArray(site) ? site : [site]

  try {
    const results = await Promise.all(
      sites.map(async (s) => {
        const where = s ? { device: { siteName: s } } : {}

        const [weather, restroom, parking] = await Promise.all([
          prisma.weather.findMany({
            where,
            orderBy: { timestamp: "desc" },
            take: Number(limit) || 10
          }),
          prisma.restroom.findMany({
            where,
            orderBy: { timestamp: "desc" },
            take: Number(limit) || 10
          }),
          prisma.parking.findMany({
            where,
            orderBy: { timestamp: "desc" },
            take: Number(limit) || 10
          })
        ])

        return { site: s, weather, restroom, parking }
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