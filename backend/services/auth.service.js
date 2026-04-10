const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("../utils/hash")

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