const { Op } = require('sequelize')
const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const Niaga = db.niaga

async function getSaldoSebelumnya(excludeId = null) {
    const where = excludeId ? { id: { [Op.ne]: excludeId } } : {}
    const last = await Niaga.findOne({
        where,
        order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
        attributes: ['saldo'],
        raw: true,
    })
    return parseFloat(last?.saldo || 0)
}

class NiagaService {
    async recalculateBalances() {
        const semuaTransaksi = await Niaga.findAll({
            order: [['tanggal', 'ASC'], ['created_at', 'ASC']]
        })

        let currentSaldo = 0;

        for (const trx of semuaTransaksi) {
            currentSaldo += parseFloat(trx.nominal);

            if (parseFloat(trx.saldo) !== currentSaldo) {
                await trx.update({ saldo: currentSaldo });
            }
        }
    }

    // Ambil semua transaksi
    async getAll() {
        return await Niaga.findAll({
            order: [['tanggal', 'DESC']]
        })
    }

    // Ambil transaksi berdasarkan UUID
    async getByUuid(uuid) {
        const transaksi = await Niaga.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')
        return transaksi
    }

    // Buat transaksi baru
    async create(data) {
        // Fallback untuk kompabilitas FE lama yang mengirim 'saldo' sebagai nominal delta
        const nominal = data.nominal !== undefined ? parseFloat(data.nominal) : parseFloat(data.saldo || 0)
        const newTransaksi = await Niaga.create({ ...data, nominal, saldo: 0 })
        await this.recalculateBalances()
        return await this.getByUuid(newTransaksi.uuid)
    }

    // Update transaksi berdasarkan UUID
    async update(uuid, data) {
        const transaksi = await Niaga.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        const nominal = data.nominal !== undefined ? parseFloat(data.nominal) : parseFloat(data.saldo !== undefined ? data.saldo : transaksi.nominal)
        
        await transaksi.update({ ...data, nominal })
        await this.recalculateBalances()

        return await this.getByUuid(uuid)
    }

    // Hapus transaksi berdasarkan UUID
    async delete(uuid) {
        const transaksi = await Niaga.findOne({ where: { uuid } })
        if (!transaksi) throw new NotFoundError('Transaksi tidak ditemukan')

        await transaksi.destroy()
        await this.recalculateBalances()
        return true
    }

    // METHOD UNTUK KEBUTUHAN DASHBOARD

    // 1. Ambil Summary (Kartu Atas) berdasarkan Bulan & Tahun
    async getDashboardSummary(bulan, tahun) {
        const { fn, col } = require('sequelize')

        // SUM nominal positif = pemasukan
        const pemasukan = await Niaga.findOne({
            where: { bulan, tahun, nominal: { [Op.gt]: 0 } },
            attributes: [
                [fn('SUM', col('nominal')), 'total_pemasukan']
            ],
            raw: true
        })

        // SUM nominal negatif = pengeluaran
        const pengeluaran = await Niaga.findOne({
            where: { bulan, tahun, nominal: { [Op.lt]: 0 } },
            attributes: [
                [fn('SUM', col('nominal')), 'total_pengeluaran']
            ],
            raw: true
        })

        // Ambil saldo dari transaksi terakhir di bulan tersebut
        const lastTransaction = await Niaga.findOne({
            where: { bulan, tahun },
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo'],
            raw: true
        })

        // Ambil saldo terkini secara global (carry-over dari bulan sebelumnya)
        const latestTransaction = await Niaga.findOne({
            order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
            attributes: ['saldo'],
            raw: true,
        })

        return {
            saldo_cash: 0,
            saldo_bank: parseFloat(latestTransaction?.saldo || 0),
            pemasukan_bulan_ini: parseFloat(pemasukan?.total_pemasukan || 0),
            pengeluaran_bulan_ini: Math.abs(parseFloat(pengeluaran?.total_pengeluaran || 0)),
            total_saldo: parseFloat(latestTransaction?.saldo || 0)
        }
    }

    // 2. Ambil Data Tren Saldo Bulanan (Line Chart) untuk 1 Tahun
    async getTrendSaldo(tahun) {
        const semuaTransaksi = await Niaga.findAll({
            where: { tahun },
            order: [['bulan', 'ASC'], ['tanggal', 'ASC'], ['created_at', 'ASC']],
            attributes: ['bulan', 'saldo'],
            raw: true
        })

        // Simpan saldo terakhir per bulan (iterasi berurutan, nilai terakhir menang)
        const trendMap = {}
        semuaTransaksi.forEach(t => {
            trendMap[t.bulan] = parseFloat(t.saldo)
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
        // Filter transaksi dengan nominal negatif (pengeluaran) di bulan dan tahun tersebut
        const transaksi = await Niaga.findAll({
            where: {
                bulan,
                tahun,
                nominal: { [Op.lt]: 0 }
            },
            attributes: ['keterangan', 'nominal'],
            raw: true
        })

        let totalPengeluaran = 0
        const breakdownMap = {}

        transaksi.forEach(t => {
            const nominal = Math.abs(parseFloat(t.nominal))
            totalPengeluaran += nominal

            if (breakdownMap[t.keterangan]) {
                breakdownMap[t.keterangan] += nominal
            } else {
                breakdownMap[t.keterangan] = nominal
            }
        })

        // Ubah ke format array dengan persentase
        const result = []
        for (const [keterangan, nominal] of Object.entries(breakdownMap)) {
            const persen = totalPengeluaran > 0
                ? ((nominal / totalPengeluaran) * 100).toFixed(2)
                : 0
            result.push({
                keterangan,
                nominal,
                persentase: parseFloat(persen)
            })
        }

        // Urutkan berdasarkan persentase terbesar
        result.sort((a, b) => b.persentase - a.persentase)

        return result
    }
}

module.exports = new NiagaService()
