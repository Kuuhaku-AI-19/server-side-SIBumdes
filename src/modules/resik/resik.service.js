const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')
const { Op, fn, col } = require('sequelize')

const Resik = db.resik

const num = (v) => parseFloat(v) || 0

// ─── Helper: hitung delta saldo_cash dan saldo_bank dari satu baris resik ─
//
// Pemasukan (selalu ke kas yang sesuai):
//   kas_cash  + iuran_cash  → saldo_cash
//   kas_bank  + iuran_bank  → saldo_bank
//
// Pengeluaran (diarahkan berdasarkan expense_source yang dikirim frontend):
//   expense_source = "kas_cash" → potong dari deltaCash
//   expense_source = "kas_bank" (default) → potong dari deltaBank
//
function hitungDelta(data) {
    const p = (v) => parseFloat(v || 0)

    // Total semua pengeluaran dalam baris ini
    const totalPengeluaran = p(data.biaya_insentif)
                           + p(data.biaya_bbm)
                           + p(data.biaya_cuci_bongkar)
                           + p(data.biaya_beban_setor)
                           + p(data.kredit_belanja_lainnya)
                           + p(data.kredit_admin_fee)

    // Tentukan ke mana pengeluaran dipotong berdasarkan expense_source
    const source = data.expense_source || 'kas_bank'
    const pengeluaranCash = source === 'kas_cash' ? totalPengeluaran : 0
    const pengeluaranBank = source === 'kas_bank' ? totalPengeluaran : 0

    const deltaCash = p(data.kas_cash) + p(data.iuran_cash) - pengeluaranCash
    const deltaBank = p(data.kas_bank) + p(data.iuran_bank) - pengeluaranBank

    return { deltaCash, deltaBank }
}



class ResikService {
    // Ambil semua transaksi
    async getAll() {
        return await Resik.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await Resik.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        return transaksi
    }

    // Method untuk menghitung ulang semua saldo setelah ada perubahan (Create/Update/Delete)
    async recalculateBalances() {
        const semuaTransaksi = await Resik.findAll({
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

    // Buat transaksi baru
    async create(data) {
        const newTransaksi = await Resik.create({ ...data, saldo_cash: 0, saldo_bank: 0 })
        await this.recalculateBalances()
        return await this.getByUuid(newTransaksi.uuid)
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await Resik.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })
        await this.recalculateBalances()

        return await this.getByUuid(uuid)
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await Resik.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.destroy()
        await this.recalculateBalances()
        return true
    }

    // METHOD UNTUK KEBUTUHAN DASHBOARD

    // 1. Ambil Summary (Kartu Atas) berdasarkan Bulan & Tahun
    async getDashboardSummary(bulan, tahun) {
        const totals = await Resik.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('kas_cash')), 'total_kas_cash'],
                [fn('SUM', col('kas_bank')), 'total_kas_bank'],
                [fn('SUM', col('iuran_cash')), 'total_iuran_cash'],
                [fn('SUM', col('iuran_bank')), 'total_iuran_bank'],
                [fn('SUM', col('biaya_insentif')), 'total_biaya_insentif'],
                [fn('SUM', col('biaya_bbm')), 'total_biaya_bbm'],
                [fn('SUM', col('biaya_cuci_bongkar')), 'total_biaya_cuci_bongkar'],
                [fn('SUM', col('biaya_beban_setor')), 'total_biaya_beban_setor'],
                [fn('SUM', col('kredit_belanja_lainnya')), 'total_kredit_belanja_lainnya'],
                [fn('SUM', col('kredit_admin_fee')), 'total_kredit_admin_fee']
            ],
            raw: true
        })

        const t = totals || {}
        const totalPemasukan = num(t.total_kas_cash) + num(t.total_kas_bank) + num(t.total_iuran_cash) + num(t.total_iuran_bank)
        const totalPengeluaran = num(t.total_biaya_insentif) + num(t.total_biaya_bbm) + num(t.total_biaya_cuci_bongkar) + num(t.total_biaya_beban_setor) + num(t.total_kredit_belanja_lainnya) + num(t.total_kredit_admin_fee)

        // Ambil saldo terkini secara global (carry-over dari bulan sebelumnya)
        const latestTransaction = await Resik.findOne({
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo_cash', 'saldo_bank'],
            raw: true,
        })

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

    // 2. Ambil Data Tren Saldo Bulanan (Line Chart) untuk 1 Tahun
    async getTrendSaldo(tahun) {
        const semuaTransaksi = await Resik.findAll({
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
            trendArray.push({
                bulan: i,
                saldo: trendMap[i] !== undefined ? trendMap[i] : 0
            })
        }

        return trendArray
    }

    // 3. Ambil Data Breakdown Pengeluaran dikelompokkan berdasarkan Keterangan
    async getBreakdownPengeluaran(bulan, tahun) {
        const transaksi = await Resik.findAll({
            where: { bulan, tahun },
            attributes: [
                'keterangan',
                'biaya_insentif',
                'biaya_bbm',
                'biaya_cuci_bongkar',
                'biaya_beban_setor',
                'kredit_belanja_lainnya',
                'kredit_admin_fee'
            ],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        const p = (v) => parseFloat(v || 0)
        transaksi.forEach(t => {
            const pengeluaran = p(t.biaya_insentif) + p(t.biaya_bbm) + p(t.biaya_cuci_bongkar) + p(t.biaya_beban_setor) + p(t.kredit_belanja_lainnya) + p(t.kredit_admin_fee)

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
            result.push({
                keterangan,
                nominal,
                persentase: parseFloat(persen)
            })
        }

        result.sort((a, b) => b.persentase - a.persentase)

        return result
    }
}

module.exports = new ResikService()