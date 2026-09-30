const express = require('express')
const router = express.Router()
const RekeningController = require('./rekening.controller')
const { createRekening, updateRekening, getRekeningByUuid } = require('./rekening.validator')
const authJwt = require('../../middleware/auth.middleware')
const asyncErrorHandler = require('../../error/asyncErrorHandler')
const validateRequest = require('../../middleware/validation.middleware')

// Public routes (tanpa authJwt)
router.get('/',
    asyncErrorHandler(RekeningController.getAll.bind(RekeningController))
)

// PENTING: /dashboard harus didaftarkan sebelum /:uuid
// agar Express tidak menangkap string "dashboard" sebagai UUID param
router.get('/dashboard',
    asyncErrorHandler(RekeningController.dashboard.bind(RekeningController))
)

router.get('/:uuid',
    getRekeningByUuid,
    validateRequest,
    asyncErrorHandler(RekeningController.getByUuid.bind(RekeningController))
)

// Protected routes (dengan authJwt)
router.post('/',
    authJwt,
    createRekening,
    validateRequest,
    asyncErrorHandler(RekeningController.create.bind(RekeningController))
)

router.put('/:uuid',
    authJwt,
    updateRekening,
    validateRequest,
    asyncErrorHandler(RekeningController.update.bind(RekeningController))
)

router.delete('/:uuid',
    authJwt,
    getRekeningByUuid,
    validateRequest,
    asyncErrorHandler(RekeningController.delete.bind(RekeningController))
)

module.exports = router
