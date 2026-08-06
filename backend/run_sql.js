const fs = require('fs');
const path = require('path');
const { poolPromise } = require('./db');

async function runSQL() {
  try {
    const pool = await poolPromise;
    
    console.log("Updating database schema for UC04 Dual Ledger and Partner info...");
    try {
      await pool.request().query(`
        IF COL_LENGTH('dbo.stock_transaction_book', 'partner_unit') IS NULL
          ALTER TABLE dbo.stock_transaction_book ADD partner_unit NVARCHAR(100);
        
        IF COL_LENGTH('dbo.stock_transaction_book', 'partner_name') IS NULL
          ALTER TABLE dbo.stock_transaction_book ADD partner_name NVARCHAR(100);
          
        IF COL_LENGTH('dbo.inventory_ledger', 'id_60') IS NULL
          ALTER TABLE dbo.inventory_ledger ADD id_60 NVARCHAR(50);
          
        IF OBJECT_ID('dbo.item_ledger', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.item_ledger (
                item_ledger_id INT IDENTITY(1,1),
                ledger_date DATE NOT NULL,
                product_code NVARCHAR(50) NOT NULL,
                transaction_id NVARCHAR(50) NOT NULL,
                source_document_no NVARCHAR(50),
                total_quantity_change DECIMAL(18,4) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (item_ledger_id)
            );
        END
      `);
      console.log("Schema updated successfully.");
    } catch (e) {
      console.error("Schema update error:", e);
    }
    
    // Also re-run SPs just in case
    const spsToRun = [
      '../Stored_Procedures/04_UC03_Scan_SPs.sql',
      '../Stored_Procedures/06_Ledger_SPs.sql',
      '../Stored_Procedures/07_UC04_1_PartialReceipt_SPs.sql'
    ];
    
    for (const file of spsToRun) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      const batches = sql.split(/\nGO\b/i);
      for (const batch of batches) {
        if (batch.trim()) {
          try {
            await pool.request().query(batch);
          } catch (e) {
            console.error("Error executing batch:", e.message);
          }
        }
      }
    }

    console.log("SQL executed successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
runSQL();
