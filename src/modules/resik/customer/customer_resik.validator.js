const { body, param } = require('express-validator')

// CREATE Customer Resik
const createCustomerResik = [
    body('nama')
        .notEmpty().withMessage('Nama wajib diisi')
        .isString().withMessage('Nama harus berupa teks')
        .trim().escape(),

    body('no_telp')
        .notEmpty().withMessage('Nomor telepon wajib diisi')
        .isString().withMessage('Nomor telepon harus berupa teks')
        .trim().escape(),
]

// UPDATE Customer Resik
const updateCustomerResik = [
    param('uuid')
        .notEmpty().withMessage('UUID customer wajib disertakan')
        .isUUID().withMessage('UUID customer tidak valid'),

    body('nama')
        .optional()
        .isString().withMessage('Nama harus berupa teks')
        .trim().escape(),

    body('no_telp')
        .optional()
        .isString().withMessage('Nomor telepon harus berupa teks')
        .trim().escape(),
]

// GET BY UUID
const getCustomerByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID customer wajib disertakan')
        .isUUID().withMessage('UUID customer tidak valid'),
]

module.exports = {
    createCustomerResik,
    updateCustomerResik,
    getCustomerByUuid,
}
