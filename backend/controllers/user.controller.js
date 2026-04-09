const userService = require("../services/user.service");

// GET /users
exports.getUsers = async (req, res) => {
  const users = await userService.getUsers();
  res.json(users);
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};

// POST /users
exports.createUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await userService.createUser({ email, name });
  res.json(user);
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await userService.updateUser(id, req.body);

    res.json(updatedUser);
  } catch (error) {
    console.error(error);

    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      message: "User not found",
    });
  }
};