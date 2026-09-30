const path = require('path');
const resikService = require(path.join(__dirname, 'src', 'modules', 'resik', 'resik.service'));
setTimeout(async () => {
  try {
    const trx = await resikService.getAll();
    if (trx.length > 0) {
        console.log("Deleting uuid:", trx[0].uuid);
        await resikService.delete(trx[0].uuid);
        console.log("Deleted successfully. Recalculated balances.");
        const after = await resikService.getAll();
        console.log("Balances after:");
        console.log(after.map(t => ({ uuid: t.uuid, saldo_cash: t.saldo_cash, saldo_bank: t.saldo_bank })));
    }
  } catch (e) {
      console.error(e);
  }
  process.exit();
}, 1000);
