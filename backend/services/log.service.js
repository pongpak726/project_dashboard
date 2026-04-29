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

exports.getLogs = async ({ page = 1, limit = 20, username } = {}) => {
  const skip = (page - 1) * limit
  const where = username ? { username: { contains: username } } : {}

  const [logs, total] = await Promise.all([
    prisma.loginLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma.loginLog.count({ where })
  ])

  return { logs, total, page, limit }
}