const NiagaService = require('./niaga.service')
const NotFoundError = require('../../error/NotfoundError')
const logger = require('../../lib/logger')

const MODULE = 'niaga';

class NiagaController {
    
    async getAll(req, res, next) {
        try{
            logger.debug(`${MODULE}.read`, { operation: 'getAll' });
            const transaction = await NiagaService.getAll()
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            res.json({
                "success": true,
                "message": "berhasil mengambil transaksi niaga",
                "data": transaction
            })
        } catch(e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getAll', message: e.message });
            next(e)
        }
    }
    
    async getByUuid(req, res, next) {
        try{
            const transaction = await NiagaService.getByUuid(req.params.uuid)
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            logger.debug(`${MODULE}.read`, { operation: 'getByUuid', id: req.params.uuid });
                
            res.json({
                "success":true,
                "message": "berhasil mengambil transaksi niaga by uuid",
                "data": transaction
            })
        } catch(e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'getByUuid', message: e.message });
            next(e)
        }
    }
    
    async create(req, res, next) {
        try{
            const transaction = await NiagaService.create({ ...req.body, user_id: req.userid, created_by: req.userid, updated_by: req.userid })
            if(!transaction) throw new NotFoundError("Gagal membuat transaksi")
            
            logger.info(`${MODULE}.create`, { operation: 'create', id: transaction.id });
                
            res.json({
                "success": true,
                "message": "berhasil membuat transaksi niaga",
                "data": transaction
            })
        } catch(e) {
            logger.error(`${MODULE}.create.failed`, { operation: 'create', message: e.message });
            next(e)
        }
    }
    
    async update(req, res, next) {
        try{
            const transaction = await NiagaService.update(req.params.uuid, { ...req.body, updated_by: req.userid })
            if(!transaction) throw new NotFoundError("Transaksi tidak di temukan")
            
            logger.info(`${MODULE}.update`, { operation: 'update', id: req.params.uuid });
                
            res.json({
                "success": true,
                "message": "berhasil memperbarui transaksi niaga",
                "data": transaction
            })
        } catch(e) {
            logger.error(`${MODULE}.update.failed`, { operation: 'update', message: e.message });
            next(e)
        }
    }
    
    async delete(req, res, next) {
        try{
            const transaction = await NiagaService.delete(req.params.uuid)
            if(!transaction) throw new NotFoundError("transaksi tidak di temukan")
            
            logger.info(`${MODULE}.delete`, { operation: 'delete', id: req.params.uuid });
                
            res.json({
                "success": true,
                "message": "Transaksi niaga berhasil di hapus",
            })
        } catch(e){
            logger.error(`${MODULE}.delete.failed`, { operation: 'delete', message: e.message });
            next(e)
        }
    }
    
    async dashboard(req, res, next) {
        try{
            const {bulan, tahun} = req.body
            const data = await NiagaService.getDashboardSummary(bulan, tahun)
            if(!data) throw new NotFoundError("data tidak di temukan")
            
            logger.debug(`${MODULE}.read`, { operation: 'dashboard' });
            
            res.json({
                "success": true,
                "message": "data dashboard niaga berhasil di ambil",
                "data": data
            })
        } catch(e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'dashboard', message: e.message });
            next(e)
        }
    }
    
    async trendSaldo(req, res, next) {
        try {
            const { tahun } = req.body
            const trend = await NiagaService.getTrendSaldo(tahun)
            if(!trend) throw new NotFoundError("Data tidak di temukan")
            
            logger.debug(`${MODULE}.read`, { operation: 'trendSaldo' });
            
            res.json({
                "success": true,
                "message": "data trend niaga berhasil di ambil",
                "data": trend
            })
        } catch(e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'trendSaldo', message: e.message });
            next(e)
        }
    }
    
    async breakdownPengeluaran(req, res, next) {
        try {
            const {bulan, tahun} = req.body
            const expenses = await NiagaService.getBreakdownPengeluaran(bulan, tahun)
            if(!expenses) throw new NotFoundError("Tidak ada pengeluaran")
            
            logger.debug(`${MODULE}.read`, { operation: 'breakdownPengeluaran' });
            
            res.json({
                "success": true,
                "message": "pengeluaran niaga berhasil di dapatkan",
                "data": expenses
            })
        } catch(e) {
            logger.error(`${MODULE}.read.failed`, { operation: 'breakdownPengeluaran', message: e.message });
            next(e)
        }
    }
    
}

module.exports = new NiagaController()
