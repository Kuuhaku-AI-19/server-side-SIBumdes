const { body, param } = require('express-validator')

// ─── Aturan validasi yang dipakai ulang
const uangField = (fieldName, label) =>
    body(fieldName)
        .optional()
        .isFloat()
        .withMessage(`${label} harus berupa angka `)
        .toFloat()

// CREATE Transaksi Niaga
const createTransaksiNiaga = [
    body('tanggal')
        .notEmpty().withMessage('Tanggal wajib diisi')
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD)'),

    body('keterangan')
        .notEmpty().withMessage('Keterangan wajib diisi')
        .isString().withMessage('Keterangan harus berupa teks')
        .trim().escape(),

    body('bulan')
        .notEmpty().withMessage('Bulan wajib diisi')
        .isInt({ min: 1, max: 12 }).withMessage('Bulan harus berupa angka 1-12')
        .toInt(),

    body('tahun')
        .notEmpty().withMessage('Tahun wajib diisi')
        .isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid')
        .toInt(),

    // ─── SALDO
    uangField('saldo', 'Saldo'),
]

// UPDATE Transaksi Niaga
const updateTransaksiNiaga = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),

    body('tanggal')
        .optional()
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD)'),

    body('keterangan')
        .optional()
        .isString().withMessage('Keterangan harus berupa teks')
        .trim().escape(),

    body('bulan')
        .optional()
        .isInt({ min: 1, max: 12 }).withMessage('Bulan harus berupa angka 1–12')
        .toInt(),

    body('tahun')
        .optional()
        .isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid')
        .toInt(),

    // ─── SALDO
    uangField('saldo', 'Saldo'),
]

// GET BY UUID
const getTransaksiByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),
]

module.exports = {
    createTransaksiNiaga,
    updateTransaksiNiaga,
    getTransaksiByUuid,
}
