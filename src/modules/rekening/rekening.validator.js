const { body, param } = require('express-validator')

// CREATE Rekening
const createRekening = [
    body('nama')
        .notEmpty().withMessage('Nama rekening wajib diisi')
        .isString().withMessage('Nama rekening harus berupa teks')
        .trim(),

    body('nomor')
        .notEmpty().withMessage('Nomor rekening wajib diisi')
        .isString().withMessage('Nomor rekening harus berupa teks')
        .trim(),

    body('kode_bank')
        .notEmpty().withMessage('Kode bank wajib diisi')
        .isString().withMessage('Kode bank harus berupa teks')
        .trim(),

    body('saldo')
        .optional()
        .isFloat({ min: 0 }).withMessage('Saldo harus berupa angka dan tidak boleh negatif')
        .toFloat(),

    body('deskripsi')
        .optional()
        .isString().withMessage('Deskripsi harus berupa teks')
        .trim(),

    body('is_aktif')
        .optional()
        .isBoolean().withMessage('is_aktif harus berupa boolean')
        .toBoolean(),
]

// UPDATE Rekening
const updateRekening = [
    param('uuid')
        .notEmpty().withMessage('UUID rekening wajib disertakan')
        .isUUID().withMessage('UUID rekening tidak valid'),

    body('nama')
        .optional()
        .isString().withMessage('Nama rekening harus berupa teks')
        .trim(),

    body('nomor')
        .optional()
        .isString().withMessage('Nomor rekening harus berupa teks')
        .trim(),

    body('kode_bank')
        .optional()
        .isString().withMessage('Kode bank harus berupa teks')
        .trim(),

    body('saldo')
        .optional()
        .isFloat({ min: 0 }).withMessage('Saldo harus berupa angka dan tidak boleh negatif')
        .toFloat(),

    body('deskripsi')
        .optional()
        .isString().withMessage('Deskripsi harus berupa teks')
        .trim(),

    body('is_aktif')
        .optional()
        .isBoolean().withMessage('is_aktif harus berupa boolean')
        .toBoolean(),
]

// GET BY UUID
const getRekeningByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID rekening wajib disertakan')
        .isUUID().withMessage('UUID rekening tidak valid'),
]

module.exports = {
    createRekening,
    updateRekening,
    getRekeningByUuid,
}
