const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runSQL() {
  try {
    const pool = await poolPromise;
    const sql = fs.readFileSync(path.join(__dirname, '../Stored_Procedures/09_UC05_1_CancelScan_SPs.sql'), 'utf8');
    const batches = sql.split(/\nGO\b/i);
    for (const batch of batches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }
    console.log("SP created successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
runSQL();
