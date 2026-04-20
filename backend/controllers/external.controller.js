const externalService = require("../services/external.service")

exports.getWeather = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const data = await externalService.getWeather({
      site,
      limit
    })

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

exports.getRestroom = async (req, res, next) => {
  try {
    const { site, limit } = req.query

    const data = await externalService.getRestroom({
      site,
      limit
    })

    res.json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

exports.getOverview = async (req, res, next) => {
  try {
    const [weather, restroom] = await Promise.all([
      externalService.getWeather({}),
      externalService.getRestroom({})
    ])

    res.json({
      success: true,
      data: {
        weather,
        restroom
      }
    })
  } catch (err) {
    next(err)
  }
}