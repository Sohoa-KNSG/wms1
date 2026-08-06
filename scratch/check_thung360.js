const { poolPromise, sql } = require('../backend/db');
async function test() {
  try {
    const pool = await poolPromise;
    console.log("=== Columns in [WMS].[dbo].[vw_thung360] or similar? Let's check tables ===");
    const res = await pool.request().query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM [WMS].INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME LIKE '%thung360%'
    `);
    console.table(res.recordset);

    console.log("=== Columns in [WMS1].[dbo].[pack360_header] ===");
    const res3 = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM [WMS1].INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'pack360_header'
    `);
    console.table(res3.recordset);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
