const path = require('path');
const db = require(path.join(__dirname, 'src', 'store', 'sequelize'));
setTimeout(async () => {
  const res = await db.resik.findAll({ order: [['tanggal', 'DESC']] });
  console.log(JSON.stringify(res, null, 2));
  process.exit();
}, 2000);
