const externalService = require("../services/external.service")

exports.getWeather = async (req, res, next) => {
  try {
    const data = await externalService.getWeather()

    res.json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}