const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

exports.ingestVMS = async (req, res, next) => {
  try {
    const { id } = req.body
    const file = req.file

    if (!id || !file) {
      throw new Error("Missing id or image")
    }

    // 🔥 parse id
    const [siteName, deviceId] = id.split(":")

    if (!siteName || !deviceId) {
      throw new Error("Invalid id format (expected site:device)")
    }

    const vmsId = id
    const imageUrl = `/uploads/${file.filename}`
    const ts = new Date() // ✅ ใช้เวลาที่ receive

    // 1. upsert VMS
    await prisma.vMS.upsert({
      where: { id: vmsId },
      update: {
        siteName,
        currentImage: imageUrl
      },
      create: {
        id: vmsId,
        siteName,
        currentImage: imageUrl
      }
    })

    // 2. insert log (กัน duplicate)
    await prisma.vMSLog.createMany({
      data: [{
        vmsId,
        imageUrl,
        timestamp: ts
      }],
      skipDuplicates: true
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

//  GET current VMS (ภาพล่าสุดของแต่ละจอ)
exports.getVMS = async (req, res, next) => {
  try {
    const { site } = req.query

    const where = site ? { siteName: site } : {}

    const data = await prisma.vMS.findMany({
      where,
      orderBy: { updatedAt: "desc" }
    })

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    next(err)
  }
}

//  GET history ของ VMS
exports.getVMSLogs = async (req, res, next) => {
  try {
    const { id, limit } = req.query

    if (!id) {
      return res.status(400).json({ error: "Missing id" })
    }

    const data = await prisma.vMSLog.findMany({
      where: { vmsId: id },
      orderBy: { timestamp: "desc" },
      take: Number(limit) || 50
    })

    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (err) {
    next(err)
  }
}

exports.updateVMSLocation = async (req, res, next) => {
  try {
    const { id } = req.params
    const { lat, lon } = req.body

    if (!id) {
      return res.status(400).json({ message: "Missing id" })
    }

    const data = await prisma.vMS.update({
      where: { id },
      data: {
        lat: lat !== undefined ? Number(lat) : undefined,
        lon: lon !== undefined ? Number(lon) : undefined
      }
    })

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
}