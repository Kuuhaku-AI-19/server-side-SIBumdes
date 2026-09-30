const { body, param } = require('express-validator')

const VALID_STATUS = ['aktif', 'nonaktif', 'pending']

// CREATE Customer Internet
const createCustomerInternet = [
    body('nama')
        .notEmpty().withMessage('Nama wajib diisi')
        .isString().withMessage('Nama harus berupa teks')
        .trim().escape(),

    body('no_telp')
        .notEmpty().withMessage('Nomor telepon wajib diisi')
        .isString().withMessage('Nomor telepon harus berupa teks')
        .trim().escape(),

    body('alamat')
        .optional()
        .isString().withMessage('Alamat harus berupa teks')
        .trim().escape(),

    body('status_aktivasi')
        .optional()
        .isIn(VALID_STATUS)
        .withMessage(`Status aktivasi harus salah satu dari: ${VALID_STATUS.join(', ')}`),
]

// UPDATE Customer Internet
const updateCustomerInternet = [
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

    body('alamat')
        .optional()
        .isString().withMessage('Alamat harus berupa teks')
        .trim().escape(),

    body('status_aktivasi')
        .optional()
        .isIn(VALID_STATUS)
        .withMessage(`Status aktivasi harus salah satu dari: ${VALID_STATUS.join(', ')}`),
]

// GET BY UUID
const getCustomerByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID customer wajib disertakan')
        .isUUID().withMessage('UUID customer tidak valid'),
]

module.exports = {
    createCustomerInternet,
    updateCustomerInternet,
    getCustomerByUuid,
}
