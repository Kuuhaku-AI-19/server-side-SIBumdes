import { beforeAll, afterAll, afterEach } from "bun:test";
const db = require('../src/store/sequelize');
const app = require('../src/app');

beforeAll(async () => {
    // Sinkronisasi database in-memory
    await db.sequelize.sync({ force: true });
});

afterEach(async () => {
    // Kosongkan semua data setelah setiap test agar bersih
    // Transaction/customer tables first (FK dependencies on user)
    await db.niaga.destroy({ where: {} });
    await db.mina.destroy({ where: {} });
    await db.customer_internet.destroy({ where: {} });
    await db.customer_resik.destroy({ where: {} });
    await db.rekening.destroy({ where: {} });
    await db.kantor_pusat.destroy({ where: {} });
    await db.resik.destroy({ where: {} });
    await db.internet.destroy({ where: {} });
    // user last (referenced by FK in other tables)
    await db.user.destroy({ where: {} });
});

export { app, db };
