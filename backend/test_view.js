const { sql, poolPromise } = require('./db');
async function run() {
  const pool = await poolPromise;
  const result = await pool.request().query("SELECT TOP 1 * FROM dbo.vw_WMS_PhieuNhapKhoTP_ChiTiet");
  console.log(result.recordset);
  process.exit(0);
}
run();
