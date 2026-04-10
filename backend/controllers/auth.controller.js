const authService = require("../services/auth.service")

exports.register = async (req,res) => {
    try{
        const user = await authService.register(req.body)
        res.json(user)
    }catch(err){
        res.status(500).json({ message: err.message })
    }
}