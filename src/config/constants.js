/**
 * Nilai valid enum UnitUsaha BUMDes.
 * Semua nilai dalam huruf kecil — konsisten dengan frontend types/index.ts.
 *
 * @type {readonly string[]}
 */
const UNIT_USAHA = Object.freeze(['internet', 'resik', 'niaga', 'mina'])

/**
 * Nilai valid StatusAktivasi untuk pelanggan Internet.
 * @type {readonly string[]}
 */
const STATUS_AKTIVASI = Object.freeze(['aktif', 'nonaktif', 'pending'])

module.exports = { UNIT_USAHA, STATUS_AKTIVASI }
