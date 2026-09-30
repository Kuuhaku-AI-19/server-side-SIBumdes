const { body, param } = require('express-validator')

// ─── Aturan validasi yang dipakai ulang 
const uangField = (fieldName, label) =>
    body(fieldName)
        .optional()
        .isFloat()
        .withMessage(`${label} harus berupa angka `)
        .toFloat()

// CREATE Transaksi Kantor Pusat
const createTransaksiKantor = [
    body('tanggal')
        .notEmpty().withMessage('Tanggal wajib diisi')
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD)'),

    body('keterangan')
        .notEmpty().withMessage('Keterangan wajib diisi')
        .isString().withMessage('Keterangan harus berupa teks')
        .trim(),

    body('bulan')
        .notEmpty().withMessage('Bulan wajib diisi')
        .isInt({ min: 1, max: 12 }).withMessage('Bulan harus berupa angka 1-12')
        .toInt(),

    body('tahun')
        .notEmpty().withMessage('Tahun wajib diisi')
        .isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid')
        .toInt(),

    body('rekening_bank')
        .notEmpty().withMessage('Rekening bank wajib dipilih')
        .isIn(['bank_bri', 'bank_jateng']).withMessage('Rekening bank harus bank_bri atau bank_jateng'),

    // ─── KAS 
    uangField('kas_bank_jateng', 'Kas Bank Jateng'),
    uangField('kas_cash',        'Kas Cash'),

    // ─── DEBET 
    uangField('debet_bank', 'Debet Bank'),
    uangField('debet_cash', 'Debet Cash'),
    
    // ─── PENGELUARAN SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim(),

    // ─── KREDIT 
    uangField('kredit_insentif',       'Kredit Insentif'),
    uangField('kredit_belanja',        'Kredit Belanja'),
    uangField('kredit_transaksi_bank', 'Kredit Transaksi Bank'),

    // ─── SALDO 
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),
]

// UPDATE Transaksi Kantor Pusat
const updateTransaksiKantor = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),

    body('tanggal')
        .optional()
        .isDate({ format: 'YYYY-MM-DD' }).withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD)'),

    body('keterangan')
        .optional()
        .isString().withMessage('Keterangan harus berupa teks')
        .trim(),

    body('bulan')
        .optional()
        .isInt({ min: 1, max: 12 }).withMessage('Bulan harus berupa angka 1–12')
        .toInt(),

    body('tahun')
        .optional()
        .isInt({ min: 2000, max: 2100 }).withMessage('Tahun tidak valid')
        .toInt(),

    body('rekening_bank')
        .optional()
        .isIn(['bank_bri', 'bank_jateng']).withMessage('Rekening bank harus bank_bri atau bank_jateng'),

    // ─── KAS 
    uangField('kas_bank_jateng', 'Kas Bank Jateng'),
    uangField('kas_cash',        'Kas Cash'),

    // ─── DEBET 
    uangField('debet_bank', 'Debet Bank'),
    uangField('debet_cash', 'Debet Cash'),
    
    // ─── PENGELUARAN SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim(),

    // ─── KREDIT 
    uangField('kredit_insentif',       'Kredit Insentif'),
    uangField('kredit_belanja',        'Kredit Belanja'),
    uangField('kredit_transaksi_bank', 'Kredit Transaksi Bank'),

    // ─── SALDO 
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),
]

// GET BY UUID
const getTransaksiByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),
]

module.exports = {
    createTransaksiKantor,
    updateTransaksiKantor,
    getTransaksiByUuid,
}