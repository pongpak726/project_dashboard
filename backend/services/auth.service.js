const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("../utils/hash")

const { comparePassword } = require("../utils/hash")
const { generateToken } = require("../utils/jwt")

exports.register = async (data) => {
    const hashed = await hashPassword(data.password)

    return prisma.user.create({
        data:{
            email:data.email,
            name:data.name,
            password: hashed
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true
        }
    })
}

exports.login = async (data) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email }
    })

    if (!user) {
        throw new Error("User not found")
    }

    const isMatch = await comparePassword(data.password, user.password)

    if (!isMatch) {
        throw new Error("Invalid password")
    }

    const token = generateToken({
        id: user.id,
        role: user.role
    })

    return {
        token
    }
}