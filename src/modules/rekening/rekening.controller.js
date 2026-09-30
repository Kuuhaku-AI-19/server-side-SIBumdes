const RekeningService = require('./rekening.service')
const NotFoundError = require('../../error/NotfoundError')
const logger = require('../../lib/logger')

const MODULE = 'rekening';

class RekeningController {

    async getAll(req, res, next) {
        try {
            logger.debug(`${MODULE}.read`, { operation: 'getAll' });
            const rekening = await RekeningService.getAll()
            if (!rekening) throw new NotFoundError("Rekening tidak di temukan")

            res.json({
                "success": true,
                "message": "berhasil mengambil rekening",
                "data": rekening
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getAll', message: e.message });
            next(e)
        }
    }

    async getByUuid(req, res, next) {
        try {
            const rekening = await RekeningService.getByUuid(req.params.uuid)
            if (!rekening) throw new NotFoundError("Rekening tidak di temukan")

            logger.debug(`${MODULE}.read`, { operation: 'getByUuid', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "berhasil mengambil rekening by uuid",
                "data": rekening
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getByUuid', message: e.message });
            next(e)
        }
    }

    async create(req, res, next) {
        try {
            const rekening = await RekeningService.create(req.body)
            if (!rekening) throw new NotFoundError("Gagal membuat rekening")

            logger.info(`${MODULE}.create`, { operation: 'create', id: rekening.id });

            res.json({
                "success": true,
                "message": "berhasil membuat rekening",
                "data": rekening
            })
        } catch (e) {
            logger.error(`${MODULE}.create.failed`, { operation: 'create', message: e.message });
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const rekening = await RekeningService.update(req.params.uuid, req.body)
            if (!rekening) throw new NotFoundError("Rekening tidak di temukan")

            logger.info(`${MODULE}.update`, { operation: 'update', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "berhasil memperbarui rekening",
                "data": rekening
            })
        } catch (e) {
            logger.error(`${MODULE}.update.failed`, { operation: 'update', message: e.message });
            next(e)
        }
    }

    async delete(req, res, next) {
        try {
            const rekening = await RekeningService.delete(req.params.uuid)
            if (!rekening) throw new NotFoundError("Rekening tidak di temukan")

            logger.info(`${MODULE}.delete`, { operation: 'delete', id: req.params.uuid });

            res.json({
                "success": true,
                "message": "Rekening berhasil di hapus",
            })
        } catch (e) {
            logger.error(`${MODULE}.delete.failed`, { operation: 'delete', message: e.message });
            next(e)
        }
    }

    async dashboard(req, res, next) {
        try {
            const data = await RekeningService.getDashboard()
            if (!data) throw new NotFoundError("Data tidak di temukan")

            logger.debug(`${MODULE}.read`, { operation: 'dashboard' });

            res.json({
                "success": true,
                "message": "data dashboard rekening berhasil di ambil",
                "data": data
            })
        } catch (e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'dashboard', message: e.message });
            next(e)
        }
    }

}

module.exports = new RekeningController()
