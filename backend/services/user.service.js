const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword } = require("../utils/hash")

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
exports.createUser = async (data) => {
  if (!data.password) {
    throw new Error("Password is required")
  }

  const hashed = await hashPassword(data.password || "123456")

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashed,
      role: data.role || "USER"
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })
}

//patch
exports.updateUser = async (id, data) => {
  if (data.password) {
    data.password = await hashPassword(data.password)
  }
  
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
exports.deleteUser = async (id) => {
  if (error.code === "P2025") {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(500).json({ message: "Internal server error" });

  return prisma.user.delete({
    where: { id }
  });
};