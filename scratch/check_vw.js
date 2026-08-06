const { poolPromise, sql } = require('../backend/db');
async function test() {
  try {
    const pool = await poolPromise;
    console.log("=== Columns in [WMS].[dbo].[vw_thung60_trenke] ===");
    const res = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM [WMS].INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'vw_thung60_trenke'
    `);
    console.table(res.recordset);

    console.log("=== First 5 rows of [WMS].[dbo].[vw_thung60_trenke] ===");
    const res2 = await pool.request().query(`
      SELECT TOP 5 * FROM [WMS].[dbo].[vw_thung60_trenke]
    `);
    console.log(res2.recordset);
    
    console.log("=== Columns in [WMS1].[dbo].[tbl_thung60_kho] ===");
    const res3 = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM [WMS1].INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'tbl_thung60_kho'
    `);
    console.table(res3.recordset);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
