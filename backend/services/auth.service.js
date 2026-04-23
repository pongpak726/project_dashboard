const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("../utils/hash")

const { comparePassword } = require("../utils/hash")

exports.register = async (data) => {
    const hashed = await hashPassword(data.password)

    return prisma.user.create({
        data:{
            username: data.username, 
            name:data.name,
            password: hashed
        },
        select: {
            id: true,
            username: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    })
}

exports.login = async (data) => {
  const user = await prisma.user.findUnique({
    where: { username: data.username }
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (!user.isActive) {
    throw new Error("User is inactive")
  }

  const isMatch = await comparePassword(data.password, user.password)

  if (!isMatch) {
    throw new Error("Invalid password")
  }

  // 🔥 return user only
  return {
    id: user.id,
    role: user.role
  }
}