const { body, param } = require('express-validator')

// ─── Aturan validasi yang dipakai ulang 
const uangField = (fieldName, label) =>
    body(fieldName)
        .optional()
        .isFloat()
        .withMessage(`${label} harus berupa angka`)
        .toFloat()

// CREATE Transaksi Internet
const createTransaksiInternet = [
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

    // ─── KAS 
    uangField('kas_cash', 'Kas Cash'),
    uangField('kas_bank', 'Kas Bank'),

    // ─── IURAN 
    uangField('iuran_cash', 'Iuran Cash'),
    uangField('iuran_bank', 'Iuran Bank'),

    // ─── PENGELUARAN 
    uangField('aktifasi_rek_internet',            'Aktifasi Rekening Internet'),
    uangField('aktifasi_edc_brilink',             'Aktifasi EDC Brilink'),
    uangField('pengeluaran_insentif',             'Pengeluaran Insentif'),
    uangField('pengeluaran_admin_transaksi_bank', 'Pengeluaran Admin Transaksi Bank'),
    uangField('pengeluaran_belanja_lainnya',      'Pengeluaran Belanja Lainnya'),

    // ─── SALDO 
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),

    // ─── EXPENSE SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim().escape(),
]

// UPDATE Transaksi Internet
const updateTransaksiInternet = [
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

    // ─── KAS 
    uangField('kas_cash', 'Kas Cash'),
    uangField('kas_bank', 'Kas Bank'),

    // ─── IURAN 
    uangField('iuran_cash', 'Iuran Cash'),
    uangField('iuran_bank', 'Iuran Bank'),

    // ─── PENGELUARAN 
    uangField('aktifasi_rek_internet',            'Aktifasi Rekening Internet'),
    uangField('aktifasi_edc_brilink',             'Aktifasi EDC Brilink'),
    uangField('pengeluaran_insentif',             'Pengeluaran Insentif'),
    uangField('pengeluaran_admin_transaksi_bank', 'Pengeluaran Admin Transaksi Bank'),
    uangField('pengeluaran_belanja_lainnya',      'Pengeluaran Belanja Lainnya'),

    // ─── SALDO 
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),

    // ─── EXPENSE SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim().escape(),
]

// GET BY UUID
const getTransaksiByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),
]

module.exports = {
    createTransaksiInternet,
    updateTransaksiInternet,
    getTransaksiByUuid,
}
