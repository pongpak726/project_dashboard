const {z} = require("zod");

const loginSchema = z.object({
    email: z.email({ message: "Invalid email" }),
    password: z.string().min(1, { message: "Password is required" }),
});

module.exports = {
    loginSchema,
}