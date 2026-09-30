const express = require('express')
const router = express.Router()
const ResikController = require('./resik.controller')
const { createTransaksiResik, updateTransaksiResik, getTransaksiByUuid } = require('./resik.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')
const authJwt = require('../../middleware/auth.middleware')
const customerResikRouter = require('./customer/customer_resik.router')

// Sub-router harus SEBELUM /:uuid agar "customer" tidak ditangkap sebagai uuid
router.use('/customer', customerResikRouter)

router.get('/', 
    asyncErrorHandler(ResikController.getAll.bind(ResikController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(ResikController.getByUuid.bind(ResikController))
)

router.post('/',
    authJwt,
    createTransaksiResik,
    validateRequest,
    asyncErrorHandler(ResikController.create.bind(ResikController))
)

// Static POST routes must come before any POST /:uuid to avoid param capture
router.post('/dashboard',
    authJwt,
    asyncErrorHandler(ResikController.dashboard.bind(ResikController))
)

router.post('/trend-saldo',
    authJwt,
    asyncErrorHandler(ResikController.trendSaldo.bind(ResikController))
)

router.post('/breakdown-pengeluaran',
    authJwt,
    asyncErrorHandler(ResikController.breakdownPengeluaran.bind(ResikController))
)

router.put('/:uuid',
    authJwt,
    updateTransaksiResik,
    validateRequest,
    asyncErrorHandler(ResikController.update.bind(ResikController))
)

router.delete('/:uuid',
    authJwt,
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(ResikController.delete.bind(ResikController))
)

module.exports = router
