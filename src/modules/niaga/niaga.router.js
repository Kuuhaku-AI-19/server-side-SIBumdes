const express = require('express')
const router = express.Router()
const NiagaController = require('./niaga.controller')
const { createTransaksiNiaga, updateTransaksiNiaga, getTransaksiByUuid } = require('./niaga.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')
const authJwt = require('../../middleware/auth.middleware')

// ─── Public routes (tanpa authJwt)
router.get('/',
    asyncErrorHandler(NiagaController.getAll.bind(NiagaController))
)

router.get('/:uuid',
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(NiagaController.getByUuid.bind(NiagaController))
)

// ─── Protected mutation routes (authJwt sebelum validator)
router.post('/',
    authJwt,
    createTransaksiNiaga,
    validateRequest,
    asyncErrorHandler(NiagaController.create.bind(NiagaController))
)

// ─── Protected dashboard routes (static routes BEFORE /:uuid to avoid param capture)
router.post('/dashboard',
    authJwt,
    asyncErrorHandler(NiagaController.dashboard.bind(NiagaController))
)

router.post('/trend-saldo',
    authJwt,
    asyncErrorHandler(NiagaController.trendSaldo.bind(NiagaController))
)

router.post('/breakdown-pengeluaran',
    authJwt,
    asyncErrorHandler(NiagaController.breakdownPengeluaran.bind(NiagaController))
)

router.put('/:uuid',
    authJwt,
    updateTransaksiNiaga,
    validateRequest,
    asyncErrorHandler(NiagaController.update.bind(NiagaController))
)

router.delete('/:uuid',
    authJwt,
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(NiagaController.delete.bind(NiagaController))
)

module.exports = router
