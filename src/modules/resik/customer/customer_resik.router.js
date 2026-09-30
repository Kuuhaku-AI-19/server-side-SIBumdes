const express = require('express')
const router = express.Router()
const CustomerResikController = require('./customer_resik.controller')
const { createCustomerResik, updateCustomerResik, getCustomerByUuid } = require('./customer_resik.validator')
const authJwt = require('../../../middleware/auth.middleware')
const asyncErrorHandler = require('../../../error/asyncErrorHandler')
const validateRequest = require('../../../middleware/validation.middleware')

// Public routes — no authJwt
router.get('/',
    asyncErrorHandler(CustomerResikController.getAll.bind(CustomerResikController))
)

router.get('/:uuid',
    getCustomerByUuid,
    validateRequest,
    asyncErrorHandler(CustomerResikController.getByUuid.bind(CustomerResikController))
)

// Protected routes — authJwt first, then validators
router.post('/',
    authJwt,
    createCustomerResik,
    validateRequest,
    asyncErrorHandler(CustomerResikController.create.bind(CustomerResikController))
)

router.put('/:uuid',
    authJwt,
    updateCustomerResik,
    validateRequest,
    asyncErrorHandler(CustomerResikController.update.bind(CustomerResikController))
)

router.delete('/:uuid',
    authJwt,
    getCustomerByUuid,
    validateRequest,
    asyncErrorHandler(CustomerResikController.delete.bind(CustomerResikController))
)

module.exports = router
