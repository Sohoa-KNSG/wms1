const { poolPromise } = require('./db');
async function setup() {
    try {
        const pool = await poolPromise;
        // Check if table exists
        const check = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tbl_oem_orders'");
        if (check.recordset.length === 0) {
            await pool.request().query(`
            CREATE TABLE tbl_oem_orders (
                oem_order_no NVARCHAR(50) NOT NULL,
                product_code NVARCHAR(50) NOT NULL,
                batch_no INT NOT NULL DEFAULT 1,
                customer_code NVARCHAR(50),
                customer_name NVARCHAR(255),
                target_qty INT NOT NULL,
                actual_qty INT NOT NULL DEFAULT 0,
                order_receive_date DATE,
                start_date DATE,
                due_date DATE,
                status NVARCHAR(30) NOT NULL DEFAULT 'NEW',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by NVARCHAR(50),
                PRIMARY KEY (oem_order_no, product_code, batch_no)
            );`);
            console.log("Table tbl_oem_orders created successfully.");
        } else {
            console.log("Table tbl_oem_orders already exists.");
        }
        
        const checkHist = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'tbl_oem_orders_history'");
        if (checkHist.recordset.length === 0) {
            await pool.request().query(`
            CREATE TABLE tbl_oem_orders_history (
                history_id INT IDENTITY(1,1) PRIMARY KEY,
                oem_order_no NVARCHAR(50) NOT NULL,
                product_code NVARCHAR(50) NOT NULL,
                batch_no INT NOT NULL,
                action_type NVARCHAR(20) NOT NULL,
                old_data NVARCHAR(MAX),
                new_data NVARCHAR(MAX),
                action_by NVARCHAR(50) NOT NULL,
                action_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );`);
            console.log("Table tbl_oem_orders_history created successfully.");
        } else {
            console.log("Table tbl_oem_orders_history already exists.");
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
setup();
