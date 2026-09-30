const CustomerResikService = require('./customer_resik.service')
const NotFoundError = require('../../../error/NotfoundError')
const logger = require('../../../lib/logger')

const MODULE = 'customer_resik';

class CustomerResikController {

    async getAll(req, res, next) {
        try {
            logger.debug(`${MODULE}.read`, { operation: 'getAll' });
            const customers = await CustomerResikService.getAll()
            if (!customers) throw new NotFoundError('Customer resik tidak di temukan')

            res.json({
                success: true,
                message: 'berhasil mengambil customer resik',
                data: customers
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getAll', message: e.message });
            next(e)
        }
    }

    async getByUuid(req, res, next) {
        try {
            const customer = await CustomerResikService.getByUuid(req.params.uuid)
            if (!customer) throw new NotFoundError('Customer resik tidak di temukan')

            logger.debug(`${MODULE}.read`, { operation: 'getByUuid', id: req.params.uuid });

            res.json({
                success: true,
                message: 'berhasil mengambil customer resik by uuid',
                data: customer
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getByUuid', message: e.message });
            next(e)
        }
    }

    async create(req, res, next) {
        try {
            const customer = await CustomerResikService.create({ ...req.body, user_id: req.userid, created_by: req.userid, updated_by: req.userid })
            if (!customer) throw new NotFoundError('Gagal membuat customer resik')

            logger.info(`${MODULE}.create`, { operation: 'create', id: customer.id });

            res.json({
                success: true,
                message: 'berhasil membuat customer resik',
                data: customer
            })
        } catch (e) {
            logger.error(`${MODULE}.create.failed`, { operation: 'create', message: e.message });
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const customer = await CustomerResikService.update(req.params.uuid, { ...req.body, updated_by: req.userid })
            if (!customer) throw new NotFoundError('Customer resik tidak di temukan')

            logger.info(`${MODULE}.update`, { operation: 'update', id: req.params.uuid });

            res.json({
                success: true,
                message: 'berhasil memperbarui customer resik',
                data: customer
            })
        } catch (e) {
            logger.error(`${MODULE}.update.failed`, { operation: 'update', message: e.message });
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const customer = await CustomerResikService.delete(req.params.uuid)
            if (!customer) throw new NotFoundError('Customer resik tidak di temukan')

            logger.info(`${MODULE}.delete`, { operation: 'delete', id: req.params.uuid });

            res.json({
                success: true,
                message: 'Customer resik berhasil di hapus'
            })
        } catch (e) {
            logger.error(`${MODULE}.delete.failed`, { operation: 'delete', message: e.message });
            next(e)
        }
    }
}

module.exports = new CustomerResikController()
