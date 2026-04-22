const externalService = require("../services/external.service")

exports.getWeather = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const data = await externalService.getWeather({
      site,
      limit: Number(limit)
    })

    res.json({
      success: true,
      message: "Weather retrieved successfully",
      data
    })
  } catch (err) {
    next(err)
  }
}

exports.getRestroom = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const data = await externalService.getRestroom({
      site,
      limit: Number(limit)
    })

    res.json({
      success: true,
      message: "Restroom retrieved successfully",
      data
    })
  } catch (err) {
    next(err)
  }
}

exports.getOverview = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const [weather, restroom] = await Promise.all([
      externalService.getWeather({ site, limit: Number(limit) }),
      externalService.getRestroom({ site, limit: Number(limit) })
    ])

    res.json({
      success: true,
      message: "Overview retrieved successfully",
      data: {
        weather,
        restroom
      }
    })
  } catch (err) {
    next(err)
  }
}

exports.getParking = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const data = await externalService.getParking({
      site,
      limit: Number(limit)
    })

    res.json({
      success: true,
      message: "Parking retrieved successfully",
      data
    })
  } catch (err) {
    next(err)
  }
}