const CustomerInternetService = require('./customer_internet.service')
const NotFoundError = require('../../../error/NotfoundError')
const logger = require('../../../lib/logger')

const MODULE = 'customer_internet';

class CustomerInternetController {

    async getAll(req, res, next) {
        try {
            logger.debug(`${MODULE}.read`, { operation: 'getAll' });
            const customers = await CustomerInternetService.getAll()
            if (!customers) throw new NotFoundError("Customer internet tidak di temukan")

            res.json({
                "success": true,
                "message": "berhasil mengambil data customer internet",
                "data": customers
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getAll', message: e.message });
            next(e)
        }
    }

    async getByUuid(req, res, next) {
        try {
            const customer = await CustomerInternetService.getByUuid(req.params.uuid)
            if (!customer) throw new NotFoundError("Customer internet tidak di temukan")

            logger.debug(`${MODULE}.read`, { operation: 'getByUuid', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "berhasil mengambil data customer internet by uuid",
                "data": customer
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getByUuid', message: e.message });
            next(e)
        }
    }

    async create(req, res, next) {
        try {
            const customer = await CustomerInternetService.create({ ...req.body, user_id: req.userid, created_by: req.userid, updated_by: req.userid })
            if (!customer) throw new NotFoundError("Gagal membuat customer internet")

            logger.info(`${MODULE}.create`, { operation: 'create', id: customer.id });

            res.json({
                "success": true,
                "message": "berhasil membuat customer internet",
                "data": customer
            })
        } catch (e) {
            logger.error(`${MODULE}.create.failed`, { operation: 'create', message: e.message });
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const customer = await CustomerInternetService.update(req.params.uuid, { ...req.body, updated_by: req.userid })
            if (!customer) throw new NotFoundError("Customer internet tidak di temukan")

            logger.info(`${MODULE}.update`, { operation: 'update', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "berhasil memperbarui customer internet",
                "data": customer
            })
        } catch (e) {
            logger.error(`${MODULE}.update.failed`, { operation: 'update', message: e.message });
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const customer = await CustomerInternetService.delete(req.params.uuid)
            if (!customer) throw new NotFoundError("Customer internet tidak di temukan")

            logger.info(`${MODULE}.delete`, { operation: 'delete', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "Customer internet berhasil di hapus",
            })
        } catch (e) {
            logger.error(`${MODULE}.delete.failed`, { operation: 'delete', message: e.message });
            next(e)
        }
    }

}

module.exports = new CustomerInternetController()
