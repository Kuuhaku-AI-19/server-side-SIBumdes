const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
const InternetService = require(path.join(__dirname, 'src', 'modules', 'internet', 'internet.service'));
const ResikService = require(path.join(__dirname, 'src', 'modules', 'resik', 'resik.service'));

setTimeout(async () => {
  try {
    // 1. Sync Internet model (adds expense_source column)
    await db.internet.sync({ alter: true });
    console.log("✓ Internet model synced (expense_source column added).");

    // 2. Sync Resik model (adds expense_source column)
    await db.resik.sync({ alter: true });
    console.log("✓ Resik model synced (expense_source column added).");

    // 3. Recalculate Internet balances
    console.log("  Recalculating Internet balances...");
    await InternetService.recalculateBalances();
    const intLatest = await db.internet.findOne({
      order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
      attributes: ['saldo_cash', 'saldo_bank'],
      raw: true,
    });
    console.log("✓ Internet latest:", intLatest || "(no transactions)");

    // 4. Recalculate Resik balances
    console.log("  Recalculating Resik balances...");
    await ResikService.recalculateBalances();
    const resLatest = await db.resik.findOne({
      order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
      attributes: ['saldo_cash', 'saldo_bank'],
      raw: true,
    });
    console.log("✓ Resik latest:", resLatest || "(no transactions)");

  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit();
}, 1000);
