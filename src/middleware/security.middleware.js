const cors = require('cors')
const helmet = require('helmet')

const corsOptions = {
    origin: (origin, callback) => {
        const envOrigin = process.env.CORS_ORIGIN || '*'
        
        // Allow if no origin (e.g. Postman) or wildcard is used
        if (!origin || envOrigin === '*') return callback(null, true)
        
        // Parse allowed origins, removing trailing slashes for exact match
        const allowed = envOrigin.split(',').map(o => o.trim().replace(/\/$/, ''))
        
        if (allowed.includes(origin)) return callback(null, true)
        
        callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`))
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
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