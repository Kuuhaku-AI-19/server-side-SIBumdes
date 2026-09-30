const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { registerValidator, loginValidator} = require('./auth.validator')
const validateRequest = require('../../middleware/validation.middleware')
const asyncErrorHanlder = require('../../error/asyncErrorHandler')
const authController = require('./auth.controller')
const authJwt = require('../../middleware/auth.middleware')

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per 15 minutes
    message: { success: false, message: 'Terlalu banyak percobaan dari IP ini, coba lagi nanti.' },
    standardHeaders: true,
    legacyHeaders: false,
})

router.post("/register",
    loginLimiter,
    registerValidator,
    validateRequest,
    asyncErrorHanlder(authController.register.bind(authController))
)

router.post("/login",
    loginLimiter,
    loginValidator,
    validateRequest,
    asyncErrorHanlder(authController.login.bind(authController))
)

router.get("/profile",
    authJwt,
    asyncErrorHanlder(authController.profile.bind(authController))
)

module.exports = router