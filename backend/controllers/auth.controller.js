const authService = require("../services/auth.service")
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt")

exports.register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const user = await authService.login(req.body)

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.json({
      accessToken,
      refreshToken
    })

  } catch (err) {
    next(err)
  }
}