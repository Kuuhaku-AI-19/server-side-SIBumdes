const db = require('../../../store/sequelize')
const NotFoundError = require('../../../error/NotfoundError')

const CustomerResik = db.customer_resik

class CustomerResikService {

    // Ambil semua customer
    async getAll() {
        return await CustomerResik.findAll({
            order: [['nama', 'ASC']]
        })
    }

    // Ambil customer berdasarkan UUID
    async getByUuid(uuid) {
        const customer = await CustomerResik.findOne({
            where: { uuid }
        })

        if (!customer) throw new NotFoundError('Customer tidak ditemukan')

        return customer
    }

    // Buat customer baru
    async create(data) {
        const newCustomer = await CustomerResik.create({ ...data })
        return newCustomer
    }

    // Update customer berdasarkan UUID
    async update(uuid, data) {
        const customer = await CustomerResik.findOne({
            where: { uuid }
        })

        if (!customer) throw new NotFoundError('Customer tidak ditemukan')

        await customer.update({ ...data })

        return customer
    }

    // Hapus customer berdasarkan UUID
    async delete(uuid) {
        const customer = await CustomerResik.findOne({
            where: { uuid }
        })

        if (!customer) throw new NotFoundError('Customer tidak ditemukan')

        await customer.destroy()
        return true
    }
}

module.exports = new CustomerResikService()
