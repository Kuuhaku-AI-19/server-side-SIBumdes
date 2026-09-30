const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const Internet = db.internet

// ─── Helper: hitung delta saldo_cash dan saldo_bank dari satu baris internet ─
//
// Pemasukan (selalu ke kas yang sesuai):
//   kas_cash  + iuran_cash  → saldo_cash
//   kas_bank  + iuran_bank  → saldo_bank
//
// Pengeluaran (diarahkan berdasarkan expense_source yang dikirim frontend):
//   expense_source = "kas_cash" → potong dari deltaCash
//   expense_source = "kas_bank" (default) → potong dari deltaBank
//
// Field pengeluaran: aktifasi_rek_internet, aktifasi_edc_brilink,
//                    pengeluaran_insentif, pengeluaran_admin_transaksi_bank,
//                    pengeluaran_belanja_lainnya
function hitungDelta(data) {
    const p = (v) => parseFloat(v || 0)

    // Total semua pengeluaran dalam baris ini
    const totalPengeluaran = p(data.aktifasi_rek_internet)
                           + p(data.aktifasi_edc_brilink)
                           + p(data.pengeluaran_insentif)
                           + p(data.pengeluaran_admin_transaksi_bank)
                           + p(data.pengeluaran_belanja_lainnya)

    // Tentukan ke mana pengeluaran dipotong berdasarkan expense_source
    const source = data.expense_source || 'kas_bank'
    const pengeluaranCash = source === 'kas_cash' ? totalPengeluaran : 0
    const pengeluaranBank = source === 'kas_bank' ? totalPengeluaran : 0

    const deltaCash = p(data.kas_cash) + p(data.iuran_cash) - pengeluaranCash
    const deltaBank = p(data.kas_bank) + p(data.iuran_bank) - pengeluaranBank

    return { deltaCash, deltaBank }
}

class InternetService {
    async recalculateBalances() {
        const semuaTransaksi = await Internet.findAll({
            order: [['tanggal', 'ASC'], ['created_at', 'ASC']]
        })

        let currentCash = 0;
        let currentBank = 0;

        for (const trx of semuaTransaksi) {
            const { deltaCash, deltaBank } = hitungDelta(trx);
            currentCash += deltaCash;
            currentBank += deltaBank;

            if (parseFloat(trx.saldo_cash) !== currentCash || parseFloat(trx.saldo_bank) !== currentBank) {
                await trx.update({
                    saldo_cash: currentCash,
                    saldo_bank: currentBank
                })
            }
        }
    }

    async getAll() {
        return await Internet.findAll({ order: [['tanggal', 'DESC']] })
    }

    async getByUuid(uuid) {
        const transaksi = await Internet.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')
        return transaksi
    }

    async create(data) {
        const newTransaksi = await Internet.create({ ...data, saldo_cash: 0, saldo_bank: 0 })
        await this.recalculateBalances()
        return await this.getByUuid(newTransaksi.uuid)
    }

    async update(uuid, data) {
        const transaksi = await Internet.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })
        await this.recalculateBalances()

        return await this.getByUuid(uuid)
    }

    async delete(uuid) {
        const transaksi = await Internet.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')
        await transaksi.destroy()
        await this.recalculateBalances()
        return true
    }

    async getDashboardSummary(bulan, tahun) {
        const { fn, col } = require('sequelize')

        const totals = await Internet.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('kas_cash')), 'total_kas_cash'],
                [fn('SUM', col('kas_bank')), 'total_kas_bank'],
                [fn('SUM', col('iuran_cash')), 'total_iuran_cash'],
                [fn('SUM', col('iuran_bank')), 'total_iuran_bank'],
                [fn('SUM', col('aktifasi_rek_internet')), 'total_aktifasi_rek_internet'],
                [fn('SUM', col('aktifasi_edc_brilink')), 'total_aktifasi_edc_brilink'],
                [fn('SUM', col('pengeluaran_insentif')), 'total_pengeluaran_insentif'],
                [fn('SUM', col('pengeluaran_admin_transaksi_bank')), 'total_pengeluaran_admin_transaksi_bank'],
                [fn('SUM', col('pengeluaran_belanja_lainnya')), 'total_pengeluaran_belanja_lainnya']
            ],
            raw: true
        })

        const lastTransaction = await Internet.findOne({
            where: { bulan, tahun },
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo_cash', 'saldo_bank'],
            raw: true
        })

        // Ambil saldo terkini secara global — bukan hanya dari bulan ini.
        // Ini memastikan saldo carry-over dari bulan sebelumnya kalau bulan ini belum ada transaksi.
        const latestTransaction = await Internet.findOne({
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo_cash', 'saldo_bank'],
            raw: true,
        })

        const totalPemasukan = (
            parseFloat(totals?.total_kas_cash || 0) +
            parseFloat(totals?.total_kas_bank || 0) +
            parseFloat(totals?.total_iuran_cash || 0) +
            parseFloat(totals?.total_iuran_bank || 0)
        )

        const totalPengeluaran = (
            parseFloat(totals?.total_aktifasi_rek_internet || 0) +
            parseFloat(totals?.total_aktifasi_edc_brilink || 0) +
            parseFloat(totals?.total_pengeluaran_insentif || 0) +
            parseFloat(totals?.total_pengeluaran_admin_transaksi_bank || 0) +
            parseFloat(totals?.total_pengeluaran_belanja_lainnya || 0)
        )

        const saldo_cash = parseFloat(latestTransaction?.saldo_cash || 0)
        const saldo_bank = parseFloat(latestTransaction?.saldo_bank || 0)

        return {
            saldo_cash,
            saldo_bank,
            pemasukan_bulan_ini: totalPemasukan,
            pengeluaran_bulan_ini: totalPengeluaran,
            total_saldo: saldo_cash + saldo_bank
        }
    }

    async getTrendSaldo(tahun) {
        const semuaTransaksi = await Internet.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo_cash', 'saldo_bank'],
            raw: true
        })

        const trendMap = {}
        semuaTransaksi.forEach(t => {
            trendMap[t.bulan] = parseFloat(t.saldo_cash || 0) + parseFloat(t.saldo_bank || 0)
        })

        const trendArray = []
        for (let i = 1; i <= 12; i++) {
            trendArray.push({ bulan: i, saldo: trendMap[i] || 0 })
        }
        return trendArray
    }

    async getBreakdownPengeluaran(bulan, tahun) {
        const transaksi = await Internet.findAll({
            where: { bulan, tahun },
            attributes: [
                'keterangan', 'aktifasi_rek_internet', 'aktifasi_edc_brilink',
                'pengeluaran_insentif', 'pengeluaran_admin_transaksi_bank', 'pengeluaran_belanja_lainnya'
            ],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const pengeluaran = (
                parseFloat(t.aktifasi_rek_internet || 0) +
                parseFloat(t.aktifasi_edc_brilink || 0) +
                parseFloat(t.pengeluaran_insentif || 0) +
                parseFloat(t.pengeluaran_admin_transaksi_bank || 0) +
                parseFloat(t.pengeluaran_belanja_lainnya || 0)
            )

            if (pengeluaran > 0) {
                totalPengeluaran += pengeluaran
                if (breakdownMap[t.keterangan]) {
                    breakdownMap[t.keterangan] += pengeluaran
                } else {
                    breakdownMap[t.keterangan] = pengeluaran
                }
            }
        })

        const result = []
        for (const [keterangan, nominal] of Object.entries(breakdownMap)) {
            const persen = totalPengeluaran > 0 ? ((nominal / totalPengeluaran) * 100).toFixed(2) : 0
            result.push({ keterangan, nominal, persentase: parseFloat(persen) })
        }
        result.sort((a, b) => b.persentase - a.persentase)
        return result
    }
}

module.exports = new InternetService()
