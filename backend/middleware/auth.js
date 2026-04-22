const jwt = require("jsonwebtoken");

module.exports = (req,res,next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({message:"No token provided"})
    }

    const token = authHeader.split(" ")[1]

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log("DECODE OK:", decode)

        req.user = decode

        next()
    }
    catch(err){
        console.log("VERIFY FAIL:", err.message)
        return res.status(401).json({message:"Invalid token"})
    }
}