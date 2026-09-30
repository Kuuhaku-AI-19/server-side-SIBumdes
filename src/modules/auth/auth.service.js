const db = require('../../store/sequelize')
const User = db.user
const bcrypt = require('bcrypt')
const BadRequestError = require('../../error/BadrequestError')
const UnauthorizedError = require('../../error/UnauthorizedError')
const jwt = require('../auth/jwtService')

class authService {
    constructor() {
        this.SALT_ROUND = 10
    }

    async register({ name, email, password, number, role, unit_usaha }) {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) throw new BadRequestError("email sudah terdaftar")

        const hash = await bcrypt.hash(password, this.SALT_ROUND)
        const newUser = await User.create({ name, email, password: hash, number, role, unit_usaha })

        const token = jwt.sign({ id: newUser.id, email: newUser.email })
        const userJson = newUser.toJSON()
        delete userJson.password

        return { user: userJson, token }
    }

    async login({ email, password }) {
        const user = await User.findOne({ where: { email } })

        if (!user) throw new UnauthorizedError("Email Tidak Terdaftar")

        const compare = await bcrypt.compare(password, user.password)
        if (!compare) throw new UnauthorizedError("password yang dimasukan salah")

        const token = jwt.sign({ id: user.id, email: user.email })
        const userJson = user.toJSON()
        delete userJson.password

        return { user: userJson, token }
    }

    async profile(userid) {
        return await User.findByPk(userid, {
            attributes: { exclude: ['password'] }
        })
    }
}

module.exports = new authService()
