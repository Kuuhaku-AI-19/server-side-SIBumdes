const { Sequelize, DataTypes } = require('sequelize')
const config = require('../config/config')

const isTest = process.env.NODE_ENV === 'test'

// Inisialisasi koneksi Sequelize
let sequelize;
if (isTest) {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: config.db.dialect,
        logging: false
    });
} else {
    sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
        logging: false // Ubah ke console.log jika ingin melihat query SQL yang dieksekusi
    });
}

// Test koneksi
const testConnection = async () => {
    if (isTest) return;
    try {
        await sequelize.authenticate()
        console.log("Connection successfully to PostgreSQL....")
    } catch(e) {
        console.error("Connection failed to PostgreSQL....", e)
    }
}
testConnection()

// Inisialisasi Objek DB untuk menampung semua model
const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize

// Load Model
db.user = require('../modules/users/user.model')(sequelize, DataTypes)
db.kantor_pusat = require('../modules/kantor_pusat/kantor_pusat.model')(sequelize, DataTypes)
db.internet = require('../modules/internet/internet.model')(sequelize, DataTypes)
db.resik = require('../modules/resik/resik.model')(sequelize, DataTypes)

// ─── Model Baru ────
db.niaga = require('../modules/niaga/niaga.model')(sequelize, DataTypes)
db.mina = require('../modules/mina/mina.model')(sequelize, DataTypes)
db.rekening = require('../modules/rekening/rekening.model')(sequelize, DataTypes)
db.customer_internet = require('../modules/internet/customer/customer_internet.model')(sequelize, DataTypes)
db.customer_resik = require('../modules/resik/customer/customer_resik.model')(sequelize, DataTypes)

// Terapkan relasi (Associations) jika ada
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

// === SCRIPT MIGRASI OTOMATIS ===
// memanggil function ini di file server utama (app.js / server.js)
db.syncDatabase = async () => {
    try {
        // alter: true akan mengubah tabel yang sudah ada agar sesuai dengan model terbaru tanpa menghapus data.
        // Jika pakai force: true, SEMUA DATA AKAN DIHAPUS (DROP TABLE) lalu dibuat ulang.
        await db.sequelize.sync({ alter: true })
        console.log('Database ter-sinkronisasi (Migrasi Selesai)!')
    } catch (error) {
        console.error('Gagal melakukan sinkronisasi database:', error)
        throw error
    }
}

module.exports = db