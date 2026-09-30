const authService = require('./auth.service')
const logger = require('../../lib/logger')

class authCOntroller {
    
    async register(req, res, next) {
        try {
            
            const data = req.body
            const result = await authService.register(data)
            
            logger.info('auth.register', { username: data.name, email: data.email });
            
            res.json({
                success: true,
                message: "berhasil register",
                data: result
            })
            
            
        } catch(e) {
            logger.warn('auth.register.failed', { message: e.message });
            next(e)
        }
       
    }
    
    async login(req, res, next) {
        try {
            
            const data = req.body
            const result = await authService.login(data)
            
            logger.info('auth.login', { email: data.email });
            
            res.json({
                success: true,
                message: "berhasil login",
                data: result
            })
            
            
        } catch(e) {
            logger.warn('auth.login.failed', { message: e.message });
            next(e)
        }
       
    }
    
    async profile(req, res, next) {
        try {
            
            const data = req.userid
            const result = await authService.profile(data)
            
            logger.info('auth.profile', { userId: data });
            
            res.json({
                success: true,
                message: "berhasil mengambil profile",
                data: result
            })
            
            
        } catch(e) {
            logger.warn('auth.profile.failed', { message: e.message });
            next(e)
        }
       
    }
    
}

module.exports = new authCOntroller()
