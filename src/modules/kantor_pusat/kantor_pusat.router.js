const express = require('express')
const router = express.Router()
const KantorPusatController = require('../kantor_pusat/kantor_pusat.controller')
const { createTransaksiKantor, updateTransaksiKantor, getTransaksiByUuid } = require('../kantor_pusat/kantor_pusat.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')
const authJwt = require('../../middleware/auth.middleware')

router.get('/', 
    asyncErrorHandler(KantorPusatController.getAll.bind(KantorPusatController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(KantorPusatController.getByUuid.bind(KantorPusatController))
)

router.post('/',
    authJwt,
    createTransaksiKantor,
    validateRequest,
    asyncErrorHandler(KantorPusatController.create.bind(KantorPusatController))
)

// ─── Static POST routes must come before any POST /:uuid to avoid param capture
router.post('/dashboard',
    authJwt,
    asyncErrorHandler(KantorPusatController.dashboard.bind(KantorPusatController))
)

router.post('/trend-saldo',
    authJwt,
    asyncErrorHandler(KantorPusatController.trendSaldo.bind(KantorPusatController))
)

router.post('/breakdown-pengeluaran',
    authJwt,
    asyncErrorHandler(KantorPusatController.breakdownPengeluaran.bind(KantorPusatController))
)

router.put('/:uuid',
    authJwt,
    updateTransaksiKantor,
    validateRequest,
    asyncErrorHandler(KantorPusatController.update.bind(KantorPusatController))
)

router.delete('/:uuid',
    authJwt,
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(KantorPusatController.delete.bind(KantorPusatController))
)

module.exports = router