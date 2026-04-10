const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get
exports.getUsers = () => {
  return prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true
  }
})
};

// get by ID
exports.getUserById = (id) => {
  return prisma.user.findUnique({
    where: { id }
  });
};

// create 
exports.createUser = (data) => {
  return prisma.user.create({ data });
};

//patch
exports.updateUser = async (id, data) => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data, 
    });

    return user;
  } catch (error) {
    // Prisma error: P2025 = not found
    if (error.code === "P2025") {
      throw new Error("User not found");
    }
    throw error;
  }
};

// delete
exports.deleteUser = (id) => {
  return prisma.user.delete({
    where: { id }
  });
};