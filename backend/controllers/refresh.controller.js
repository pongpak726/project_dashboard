const jwt = require("jsonwebtoken")
const { generateAccessToken } = require("../utils/jwt")

exports.refresh = (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" })
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role
    })

    res.json({ accessToken })

  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" })
  }
}