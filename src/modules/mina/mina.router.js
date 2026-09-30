const express = require('express')
const router = express.Router()
const MinaController = require('./mina.controller')
const { createTransaksiMina, updateTransaksiMina, getTransaksiByUuid } = require('./mina.validator')
const authJwt = require('../../middleware/auth.middleware')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')

router.get('/',
    asyncErrorHandler(MinaController.getAll.bind(MinaController))
)

router.get('/:uuid',
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(MinaController.getByUuid.bind(MinaController))
)

router.post('/',
    authJwt,
    createTransaksiMina,
    validateRequest,
    asyncErrorHandler(MinaController.create.bind(MinaController))
)

// Dashboard routes (static routes BEFORE /:uuid to avoid param capture)
router.post('/dashboard',
    authJwt,
    asyncErrorHandler(MinaController.dashboard.bind(MinaController))
)

router.post('/trend-saldo',
    authJwt,
    asyncErrorHandler(MinaController.trendSaldo.bind(MinaController))
)

router.post('/breakdown-pengeluaran',
    authJwt,
    asyncErrorHandler(MinaController.breakdownPengeluaran.bind(MinaController))
)

router.put('/:uuid',
    authJwt,
    updateTransaksiMina,
    validateRequest,
    asyncErrorHandler(MinaController.update.bind(MinaController))
)

router.delete('/:uuid',
    authJwt,
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(MinaController.delete.bind(MinaController))
)

module.exports = router
