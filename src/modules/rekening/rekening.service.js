const db = require('../../store/sequelize')
const NotFoundError = require('../../error/NotfoundError')

const Rekening = db.rekening

class RekeningService {

    async getRealTimeBalances() {
        const balances = {
            internet: 0,
            resik: 0,
            niaga: 0,
            mina: 0,
            kantor_pusat: 0
        };

        try {
            const int = await db.internet.findOne({ order: [['tanggal', 'DESC'], ['created_at', 'DESC']], attributes: ['saldo_bank'], raw: true });
            balances.internet = parseFloat(int?.saldo_bank || 0);

            const res = await db.resik.findOne({ order: [['tanggal', 'DESC'], ['created_at', 'DESC']], attributes: ['saldo_bank'], raw: true });
            balances.resik = parseFloat(res?.saldo_bank || 0);

            const ni = await db.niaga.findOne({ order: [['tanggal', 'DESC'], ['created_at', 'DESC']], attributes: ['saldo'], raw: true });
            balances.niaga = parseFloat(ni?.saldo || 0);

            const mi = await db.mina.findOne({ order: [['tanggal', 'DESC'], ['created_at', 'DESC']], attributes: ['saldo'], raw: true });
            balances.mina = parseFloat(mi?.saldo || 0);

            const kp = await db.kantor_pusat.findOne({ order: [['tanggal', 'DESC'], ['created_at', 'DESC']], attributes: ['saldo_bank'], raw: true });
            balances.kantor_pusat = parseFloat(kp?.saldo_bank || 0);
        } catch (error) {
            console.error("Error fetching real-time balances for rekening:", error);
        }

        return balances;
    }

    async getRekeningWithRealTimeBalance() {
        const rekening = await Rekening.findAll({ order: [['nama', 'ASC']] });
        const balances = await this.getRealTimeBalances();

        return rekening.map(r => {
            const rek = r.toJSON();
            // Override saldo dengan saldo real-time dari unit usaha yang dipilih
            if (rek.unit_usaha && balances[rek.unit_usaha] !== undefined) {
                rek.saldo = balances[rek.unit_usaha];
            }
            return rek;
        });
    }

    async getAll() {
        return await this.getRekeningWithRealTimeBalance();
    }

    async getByUuid(uuid) {
        const rekening = await Rekening.findOne({ where: { uuid } });
        if (!rekening) throw new NotFoundError('Rekening tidak ditemukan');

        const rek = rekening.toJSON();
        const balances = await this.getRealTimeBalances();
        if (rek.unit_usaha && balances[rek.unit_usaha] !== undefined) {
            rek.saldo = balances[rek.unit_usaha];
        }
        return rek;
    }

    async create(data) {
        return await Rekening.create({ ...data, saldo: 0 }); // Saldo dinamis, jadi default 0 di DB
    }

    async update(uuid, data) {
        const rekening = await Rekening.findOne({ where: { uuid } });
        if (!rekening) throw new NotFoundError('Rekening tidak ditemukan');

        // Pastikan field saldo tidak ditimpa oleh input manual
        const { saldo, ...updateData } = data;
        await rekening.update(updateData);

        return await this.getByUuid(uuid);
    }

    async delete(uuid) {
        const rekening = await Rekening.findOne({ where: { uuid } });
        if (!rekening) throw new NotFoundError('Rekening tidak ditemukan');

        await rekening.destroy();
        return true;
    }

    async getDashboard() {
        const rekening = await this.getRekeningWithRealTimeBalance();
        
        const aktif = rekening.filter(r => r.is_aktif === true);
        const totalSaldoAktif = aktif.reduce((sum, r) => sum + parseFloat(r.saldo), 0);

        return {
            rekening,
            total_saldo_aktif: totalSaldoAktif,
            jumlah_aktif: aktif.length,
            jumlah_non_aktif: rekening.length - aktif.length,
        };
    }
}

module.exports = new RekeningService()
