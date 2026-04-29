const logService = require("../services/log.service")

exports.getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const username = req.query.username || ""

    const result = await logService.getLogs({ page, limit, username })
    res.json(result)
  } catch (err) {
    next(err)
  }
}