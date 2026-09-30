const app = require('./app')
const db = require('./store/sequelize')
const config = require('./config/config')

const PORT = config.server.port || 5001

// Jalankan syncDatabase sebelum server mulai listen.
db.syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
    })
}).catch((err) => {
    console.error('Gagal sinkronisasi database, server tidak dijalankan:', err)
    process.exit(1)
})
