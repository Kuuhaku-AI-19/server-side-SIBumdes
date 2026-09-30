const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
const KantorPusatService = require(path.join(__dirname, 'src', 'modules', 'kantor_pusat', 'kantor_pusat.service'));

setTimeout(async () => {
  try {
    // 1. Sync model (adds saldo_cash, saldo_bank, expense_source if missing)
    await db.kantor_pusat.sync({ alter: true });
    console.log("✓ DB kantor_pusat synced (alter: true).");
    
    // 2. Drop old 'saldo' column if it still exists
    try {
      await db.sequelize.query('ALTER TABLE kantor_pusat DROP COLUMN IF EXISTS saldo;');
      console.log("✓ Old 'saldo' column dropped.");
    } catch (e) {
      console.log("  (saldo column already gone or error:", e.message, ")");
    }
    
    // 3. Recalculate all balances from transaction history
    console.log("  Recalculating balances...");
    await KantorPusatService.recalculateBalances();
    console.log("✓ All balances recalculated.");

    // 4. Verify — get latest saldo
    const latest = await db.kantor_pusat.findOne({
      order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
      attributes: ['saldo_cash', 'saldo_bank'],
      raw: true,
    });
    console.log("✓ Latest balances:", latest || "(no transactions yet)");

  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit();
}, 1000);
