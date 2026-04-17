const userService = require("../services/user.service");

// GET /users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    if (!user) {
      throw new Error("User not found");
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// POST /users
exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body, req.user)

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};