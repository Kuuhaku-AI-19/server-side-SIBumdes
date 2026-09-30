const express = require('express')
const router = express.Router()
const CustomerInternetController = require('./customer_internet.controller')
const { createCustomerInternet, updateCustomerInternet, getCustomerByUuid } = require('./customer_internet.validator')
const authJwt = require('../../../middleware/auth.middleware')
const asyncErrorHandler = require('../../../error/asyncErrorHandler')
const validateRequest = require('../../../middleware/validation.middleware')

// Public routes — no authentication required
router.get('/',
    asyncErrorHandler(CustomerInternetController.getAll.bind(CustomerInternetController))
)

router.get('/:uuid',
    getCustomerByUuid,
    validateRequest,
    asyncErrorHandler(CustomerInternetController.getByUuid.bind(CustomerInternetController))
)

// Protected routes — authJwt first
router.post('/',
    authJwt,
    createCustomerInternet,
    validateRequest,
    asyncErrorHandler(CustomerInternetController.create.bind(CustomerInternetController))
)

router.put('/:uuid',
    authJwt,
    updateCustomerInternet,
    validateRequest,
    asyncErrorHandler(CustomerInternetController.update.bind(CustomerInternetController))
)

router.delete('/:uuid',
    authJwt,
    getCustomerByUuid,
    validateRequest,
    asyncErrorHandler(CustomerInternetController.delete.bind(CustomerInternetController))
)

module.exports = router
