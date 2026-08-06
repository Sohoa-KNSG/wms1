const { poolPromise, sql } = require('../backend/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const pool = await poolPromise;
    console.log("Connected to database.");

    // 1. Read the SQL file
    const sqlPath = path.join(__dirname, '../Stored_Procedures/usp_wms_migrate_initial_inventory.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Remove GO statements because tedious/mssql driver doesn't support them
    sqlContent = sqlContent.replace(/\bGO\b/gi, '');

    console.log("Creating/Altering Stored Procedure...");
    await pool.request().query(sqlContent);
    console.log("Stored Procedure created/updated successfully.");

    console.log("Executing Migration (EXEC usp_wms_migrate_initial_inventory)...");
    const result = await pool.request().query("EXEC usp_wms_migrate_initial_inventory");
    console.log("Migration executed successfully!");
    
    // Quick check to see how many rows are in the new table
    const countRes = await pool.request().query("SELECT COUNT(*) AS Total60 FROM [WMS1].[dbo].[tbl_thung60_kho]");
    console.log(`Total records in WMS1 tbl_thung60_kho: ${countRes.recordset[0].Total60}`);

    process.exit(0);
  } catch (e) {
    console.error("Migration Error:", e);
    process.exit(1);
  }
}

runMigration();
