const express = require('express')
const router = express.Router()
const InternetController = require('./internet.controller')
const { createTransaksiInternet, updateTransaksiInternet, getTransaksiByUuid } = require('./internet.validator')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')
const authJwt = require('../../middleware/auth.middleware')
const customerInternetRouter = require('./customer/customer_internet.router')

// ─── Sub-router harus SEBELUM /:uuid agar "customer" tidak ditangkap sebagai uuid
router.use('/customer', customerInternetRouter)

router.get('/', 
    asyncErrorHandler(InternetController.getAll.bind(InternetController))
)

router.get('/:uuid', 
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(InternetController.getByUuid.bind(InternetController))
)

router.post('/',
    authJwt,
    createTransaksiInternet,
    validateRequest,
    asyncErrorHandler(InternetController.create.bind(InternetController))
)


router.post('/dashboard',
    authJwt,
    asyncErrorHandler(InternetController.dashboard.bind(InternetController))
)

router.post('/trend-saldo',
    authJwt,
    asyncErrorHandler(InternetController.trendSaldo.bind(InternetController))
)

router.post('/breakdown-pengeluaran',
    authJwt,
    asyncErrorHandler(InternetController.breakdownPengeluaran.bind(InternetController))
)

router.put('/:uuid',
    authJwt,
    updateTransaksiInternet,
    validateRequest,
    asyncErrorHandler(InternetController.update.bind(InternetController))
)

router.delete('/:uuid',
    authJwt,
    getTransaksiByUuid,
    validateRequest,
    asyncErrorHandler(InternetController.delete.bind(InternetController))
)

module.exports = router
