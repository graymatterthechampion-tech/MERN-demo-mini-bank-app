const jwt = require('jsonwebtoken')
const User = require('../models/Users')

const protect = async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return res.status(401).json({message: 'Not authorised, please log in.'})
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        if(!user){
            return res.status(403).json({message: 'Your account has been suspended by an administrator.'})
        }
        req.user = user;
        next()
    } catch (error) {
        return res.status(401).json({message: 'Inavlid or expired session token'})
    }
}

const adminOnly = (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        next()
    }else{
        res.status(403).json({meassge: 'Forbidden. Admin priviledges required'})
    }
}

module.exports = {protect, adminOnly}