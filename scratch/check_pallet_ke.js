const { poolPromise, sql } = require('../backend/db');
async function test() {
  try {
    const pool = await poolPromise;
    console.log("=== Tables in [WMS] matching 'pallet' ===");
    const res1 = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM [WMS].INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%pallet%'
    `);
    console.table(res1.recordset);

    console.log("=== Columns in [WMS1].[dbo].[inventory_locations] ===");
    const res2 = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM [WMS1].INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'inventory_locations'
    `);
    console.table(res2.recordset);
    
    console.log("=== First 5 rows of [WMS].[dbo].[vw_thung60_trenke] Pallet & Ke ===");
    const res3 = await pool.request().query(`
      SELECT TOP 5 ma_ke, pallet_in 
      FROM [WMS].[dbo].[vw_thung60_trenke] 
      WHERE pallet_in IS NOT NULL OR ma_ke IS NOT NULL
    `);
    console.table(res3.recordset);
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
