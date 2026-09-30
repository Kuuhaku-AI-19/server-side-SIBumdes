const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const KantorPusat = db.kantor_pusat

const num = (v) => parseFloat(v) || 0

// ─── Helper: hitung delta saldo_cash dan saldo_bank dari satu baris kantor_pusat ─
//
// Pemasukan (selalu ke kas yang sesuai):
//   kas_cash  + debet_cash  → saldo_cash
//   kas_bank_jateng + debet_bank → saldo_bank
//
// Pengeluaran (diarahkan berdasarkan expense_source yang dikirim frontend):
//   expense_source = "kas_cash" → potong dari deltaCash
//   expense_source = "kas_bank_jateng" (default) → potong dari deltaBank
//
function hitungDelta(data) {
    const p = (v) => parseFloat(v || 0)

    // Total semua pengeluaran dalam baris ini
    const totalPengeluaran = p(data.kredit_insentif)
                           + p(data.kredit_belanja)
                           + p(data.kredit_transaksi_bank)

    // Tentukan ke mana pengeluaran dipotong berdasarkan expense_source
    const source = data.expense_source || 'kas_bank_jateng'
    const pengeluaranCash = (source === 'kas_cash' || source === 'debet_cash') ? totalPengeluaran : 0
    const pengeluaranBank = (source === 'kas_bank_jateng' || source === 'debet_bank') ? totalPengeluaran : 0

    const deltaCash = p(data.kas_cash) + p(data.debet_cash) - pengeluaranCash
    const deltaBank = p(data.kas_bank_jateng) + p(data.debet_bank) - pengeluaranBank

    return { deltaCash, deltaBank }
}


class KantorPusatService {

    // Method untuk menghitung ulang semua saldo setelah ada perubahan (Create/Update/Delete)
    async recalculateBalances() {
        const semuaTransaksi = await KantorPusat.findAll({
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
                });
            }
        }
    }

    // Ambil semua transaksi
    async getAll() {
        return await KantorPusat.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await KantorPusat.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        return transaksi
    }

    // Buat transaksi baru
    async create(data) {
        const newTransaksi = await KantorPusat.create({ ...data, saldo_cash: 0, saldo_bank: 0 })
        await this.recalculateBalances()
        return await this.getByUuid(newTransaksi.uuid)
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await KantorPusat.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.update({ ...data })
        await this.recalculateBalances()
        return await this.getByUuid(uuid)
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await KantorPusat.findOne({
            where: { uuid }
        })

        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.destroy()
        await this.recalculateBalances()
        return true
    }

    // METHOD UNTUK KEBUTUHAN DASHBOARD

    // 1. Ambil Summary (Kartu Atas) berdasarkan Bulan & Tahun
    async getDashboardSummary(bulan, tahun) {
        const { fn, col, Op } = require('sequelize')
        
        // Cari total pemasukan dan pengeluaran di bulan tersebut
        const totals = await KantorPusat.findOne({
            where: { bulan, tahun },
            attributes: [
                [fn('SUM', col('kas_bank_jateng')), 'total_kas_bank_jateng'],
                [fn('SUM', col('kas_cash')), 'total_kas_cash'],
                [fn('SUM', col('debet_bank')), 'total_debet_bank'],
                [fn('SUM', col('debet_cash')), 'total_debet_cash'],
                [fn('SUM', col('kredit_insentif')), 'total_kredit_insentif'],
                [fn('SUM', col('kredit_belanja')), 'total_kredit_belanja'],
                [fn('SUM', col('kredit_transaksi_bank')), 'total_kredit_transaksi_bank']
            ],
            raw: true
        })

        const t = totals || {}
        const totalPemasukan = num(t.total_kas_bank_jateng) + num(t.total_kas_cash) + num(t.total_debet_bank) + num(t.total_debet_cash)
        const totalPengeluaran = num(t.total_kredit_insentif) + num(t.total_kredit_belanja) + num(t.total_kredit_transaksi_bank)

        // Ambil saldo terkini secara global (carry-over dari bulan sebelumnya)
        const latestTransaction = await KantorPusat.findOne({
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
        const semuaTransaksi = await KantorPusat.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo_cash', 'saldo_bank'],
            raw: true
        })

        const trendMap = {}
        semuaTransaksi.forEach(t => {
            trendMap[t.bulan] = parseFloat(t.saldo_cash || 0) + parseFloat(t.saldo_bank || 0)
        })

        // Format array 1-12
        const trendArray = []
        for (let i = 1; i <= 12; i++) {
            trendArray.push({
                bulan: i,
                saldo: trendMap[i] !== undefined ? trendMap[i] : 0
            })
        }

        return trendArray
    }

    // 3. Ambil Data Breakdown Pengeluaran (Pie Chart)
    async getBreakdownPengeluaran(bulan, tahun) {
        // Ambil semua transaksi di bulan dan tahun tersebut
        const transaksi = await KantorPusat.findAll({
            where: { bulan, tahun },
            attributes: ['keterangan', 'kredit_insentif', 'kredit_belanja', 'kredit_transaksi_bank'],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const pengeluaran = parseFloat(t.kredit_insentif || 0) + parseFloat(t.kredit_belanja || 0) + parseFloat(t.kredit_transaksi_bank || 0)
            
            if (pengeluaran > 0) {
                totalPengeluaran += pengeluaran
                
                if (breakdownMap[t.keterangan]) {
                    breakdownMap[t.keterangan] += pengeluaran
                } else {
                    breakdownMap[t.keterangan] = pengeluaran
                }
            }
        })

        // Ubah ke format array dengan persentase
        const result = []
        for (const [keterangan, nominal] of Object.entries(breakdownMap)) {
            const persen = totalPengeluaran > 0 ? ((nominal / totalPengeluaran) * 100).toFixed(2) : 0
            result.push({
                keterangan: keterangan,
                nominal: nominal,
                persentase: parseFloat(persen)
            })
        }
        
        // Urutkan berdasarkan persentase terbesar
        result.sort((a, b) => b.persentase - a.persentase)

        return result
    }
}

module.exports = new KantorPusatService()