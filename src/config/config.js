const dotenv = require('dotenv')
dotenv.config({
    path: process.env.DOTENV || ".env"
})

const dbDialect = "postgres"

module.exports = {
  db: {
    username: process.env.DB_USER || process.env.PGUSER,
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
    database: process.env.DB_DATABASE || process.env.PGDATABASE,
    host: process.env.DB_HOST || process.env.PGHOST,
    port: parseInt(process.env.DB_PORT) || parseInt(process.env.PGPORT) || 5432,
    dialect: dbDialect,
  },
  server: {
    baseUrl: process.env.SERVER_BASE_URL || "http://localhost:5001",
    port: parseInt(process.env.PORT) || parseInt(process.env.SERVER_PORT) || 5001,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },

}
