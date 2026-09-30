const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
const RekeningService = require(path.join(__dirname, 'src', 'modules', 'rekening', 'rekening.service'));

setTimeout(async () => {
  try {
    await db.sequelize.sync({ alter: true });
    console.log("DB synced.");
    
    // Test fetching all rekening
    const rek = await RekeningService.getAll();
    console.log("Rekening List:", JSON.stringify(rek, null, 2));

  } catch (e) {
      console.error(e);
  }
  process.exit();
}, 1000);
