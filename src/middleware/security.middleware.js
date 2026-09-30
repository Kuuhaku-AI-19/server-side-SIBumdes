const cors = require('cors')
const helmet = require('helmet')

// Daftar origin yang diizinkan
// CORS_ORIGIN bisa berupa single URL atau comma-separated list
const getAllowedOrigins = () => {
    const envOrigin = process.env.CORS_ORIGIN
    if (!envOrigin || envOrigin === '*') {
        // Development fallback: izinkan localhost di berbagai port
        return ['http://localhost:3000', 'http://127.0.0.1:3000']
    }
    return envOrigin.split(',').map(o => o.trim())
}

const corsOptions = {
    origin: (origin, callback) => {
        const allowed = getAllowedOrigins()
        // Izinkan request tanpa origin (curl, server-side fetch, Postman)
        if (!origin) return callback(null, true)
        if (allowed.includes(origin)) return callback(null, true)
        callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // JWT dikirim via header, bukan cookie tidak perlu credentials
}

const enableCORS = cors(corsOptions)

const setSecurityHeaders = helmet({
    contentSecurityPolicy: false,
    frameguard: { action: 'deny' },
    noSniff: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})

module.exports = { enableCORS, setSecurityHeaders }