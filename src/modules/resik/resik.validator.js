const { body, param } = require('express-validator')

// ─── Field uang: opsional, harus angka (boleh negatif untuk pengeluaran)
const uangField = (fieldName, label) =>
    body(fieldName)
        .optional()
        .isFloat()
        .withMessage(`${label} harus berupa angka`)
        .toFloat()

// CREATE Transaksi Resik
const createTransaksiResik = [
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

    // ─── KAS (bisa negatif untuk pengeluaran)
    uangField('kas_cash', 'Kas Cash'),
    uangField('kas_bank', 'Kas Bank'),

    // ─── IURAN
    uangField('iuran_cash', 'Iuran Cash'),
    uangField('iuran_bank', 'Iuran Bank'),

    // ─── BIAYA OPERASIONAL (nilai positif, maknanya pengeluaran)
    uangField('biaya_insentif',       'Biaya Insentif'),
    uangField('biaya_bbm',            'Biaya BBM'),
    uangField('biaya_cuci_bongkar',   'Biaya Cuci Bongkar'),
    uangField('biaya_beban_setor',    'Biaya Beban Setor'),

    // ─── LAINNYA
    uangField('kredit_belanja_lainnya', 'Kredit Belanja Lainnya'),
    uangField('kredit_admin_fee',       'Kredit Admin Fee'),

    // ─── SALDO
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),

    // ─── EXPENSE SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim(),
]

// UPDATE Transaksi Resik
const updateTransaksiResik = [
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

    uangField('kas_cash', 'Kas Cash'),
    uangField('kas_bank', 'Kas Bank'),
    uangField('iuran_cash', 'Iuran Cash'),
    uangField('iuran_bank', 'Iuran Bank'),
    uangField('biaya_insentif',       'Biaya Insentif'),
    uangField('biaya_bbm',            'Biaya BBM'),
    uangField('biaya_cuci_bongkar',   'Biaya Cuci Bongkar'),
    uangField('biaya_beban_setor',    'Biaya Beban Setor'),
    uangField('kredit_belanja_lainnya', 'Kredit Belanja Lainnya'),
    uangField('kredit_admin_fee',       'Kredit Admin Fee'),
    uangField('saldo_cash', 'Saldo Cash'),
    uangField('saldo_bank', 'Saldo Bank'),

    // ─── EXPENSE SOURCE 
    body('expense_source')
        .optional()
        .isString().withMessage('Sumber dana pengeluaran harus berupa teks')
        .trim(),
]

// GET BY UUID
const getTransaksiByUuid = [
    param('uuid')
        .notEmpty().withMessage('UUID transaksi wajib disertakan')
        .isUUID().withMessage('UUID transaksi tidak valid'),
]

module.exports = {
    createTransaksiResik,
    updateTransaksiResik,
    getTransaksiByUuid,
}
