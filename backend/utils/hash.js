const bcrypt = require("bcrypt")

exports.hashPassword = async (password) => {
    return bcrypt.hash(password,10)
}