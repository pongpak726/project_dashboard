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
    where: { id },
    select: {
    id: true,
    email: true,
    name: true,
    role: true,
    isActive: true,
    createdAt: true
  }
  });
};

// create 
exports.createUser = async (data) => {
  if (!data.password) {
    throw new Error("Password is required")
  }

  const hashed = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashed,
      role: data.role || "USER",
      isActive: data.isActive ?? true 
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  })
}

//patch
exports.updateUser = async (id, data, currentUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { id }
  })

  if (!existingUser) {
    throw new Error("User not found")
  }

  let updateData = {}

  // ===== ROLE FILTER =====
  let allowed = []

  if (currentUser.role === "ADMIN") {
    allowed = ["email", "name", "password", "role", "isActive"]
  } else if (currentUser.role === "SUPER_ADMIN") {
    allowed = ["email", "name", "password", "role", "isActive"]
  } else {
    throw new Error("Forbidden")
  }

  // ===== PATCH LOGIC =====
  for (const key of allowed) {
    if (
      data[key] !== undefined &&
      data[key] !== existingUser[key]
    ) {
      updateData[key] = data[key]
    }
  }

  // ===== ROLE SECURITY =====
  const rolePriority = {
    USER: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3
  }

  if (updateData.role) {
    if (rolePriority[updateData.role] > rolePriority[currentUser.role]) {
      throw new Error("Cannot assign higher role than yourself")
    }
  }

  if (
    currentUser.role === "ADMIN" &&
    updateData.role === "SUPER_ADMIN"
  ) {
    throw new Error("Not allowed to assign SUPER_ADMIN role")
  }

  // ===== NO CHANGE =====
  if (Object.keys(updateData).length === 0) {
    return existingUser
  }

  // ===== HASH PASSWORD =====
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password)
  }

  try {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("Email already exists")
    }
    if (error.code === "P2025") {
      throw new Error("User not found")
    }
    throw error
  }
}

// delete
exports.deleteUser = async (id) => {
  try {
    return await prisma.user.delete({
      where: { id }
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new Error("User not found")
    }

    throw error
  }
};