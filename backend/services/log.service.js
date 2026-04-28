const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.createLoginLog = async ({ user, req }) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress

  return prisma.loginLog.create({
    data: {
      userId: user.id,
      username: user.username,
      ip,
      userAgent: req.headers["user-agent"]
    }
  })
}