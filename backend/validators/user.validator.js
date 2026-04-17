const{z} = require("zod");

//====create user====
const createUserSchema = z.object({
    email: z.email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
    isActive: z.boolean().optional()
});

//====update user====
const updateUserSchema = z.object({
    email: z.email("Invalid email format").optional(),
    name: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
    isActive: z.boolean().optional()   
});

module.exports = {
  createUserSchema,
  updateUserSchema,
};