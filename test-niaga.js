const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
const NiagaService = require(path.join(__dirname, 'src', 'modules', 'niaga', 'niaga.service'));

setTimeout(async () => {
  try {
    await db.sequelize.sync({ alter: true });
    console.log("DB synced.");
    
    // Test creating a transaction
    const data = {
        tanggal: '2026-09-29',
        keterangan: 'Test Transaksi Niaga',
        bulan: 9,
        tahun: 2026,
        nominal: 150000,
        user_id: 12,
        created_by: 12,
        updated_by: 12
    };
    
    const created = await NiagaService.create(data);
    console.log("Created:", { uuid: created.uuid, nominal: created.nominal, saldo: created.saldo });
    
    // Clean up
    await NiagaService.delete(created.uuid);
    console.log("Cleaned up.");
  } catch (e) {
      console.error(e);
  }
  process.exit();
}, 1000);
