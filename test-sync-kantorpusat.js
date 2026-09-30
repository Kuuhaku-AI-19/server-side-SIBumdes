const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
const KantorPusatService = require(path.join(__dirname, 'src', 'modules', 'kantor_pusat', 'kantor_pusat.service'));

setTimeout(async () => {
  try {
    await db.kantor_pusat.sync({ alter: true });
    console.log("DB kantor_pusat synced with alter: true.");
    
    // Recalculate existing rows to populate saldo_cash and saldo_bank
    console.log("Recalculating balances...");
    await KantorPusatService.recalculateBalances();
    console.log("Balances recalculated.");

  } catch (e) {
      console.error(e);
  }
  process.exit();
}, 1000);
