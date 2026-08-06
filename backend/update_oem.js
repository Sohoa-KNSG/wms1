const { sql, poolPromise } = require('./db');
async function run() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      UPDATE w1
      SET w1.current_oem_order_no = w2.oem_2
      FROM [WMS1].[dbo].[tbl_thung60_kho] w1
      INNER JOIN [WMS].[dbo].[vw_thung60_trenke] w2 ON w1.id_60 = w2.id_60;
    `);
    console.log('Updated rows:', result.rowsAffected);
  } catch(e) { console.error(e); }
  process.exit();
}
run();
