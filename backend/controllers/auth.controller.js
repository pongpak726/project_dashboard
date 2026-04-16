const authService = require("../services/auth.service")

exports.register = async (req,res) => {
    try{
        const user = await authService.register(req.body)
        res.json(user)
    }catch(err){
        res.status(500).json({ message: err.message })
    }
}

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body)
        res.json(result)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}