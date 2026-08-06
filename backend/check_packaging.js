require('dotenv').config();
const { sql, poolPromise } = require('./db');

async function check() {
  try {
    const pool = await poolPromise;
    console.log("Checking ScanLog and Packaging...");
    const result = await pool.request().query(`
      SELECT 
          s.MaThung60 as ScanLog_Thung60,
          s.SoPhieuNhap,
          s.TrangThaiScan,
          p.id_60 as Packaging_id_60,
          p.trangthai as Packaging_trangthai
      FROM dbo.WMS_UC03_ScanLog s
      LEFT JOIN [Packaging].[dbo].[tbl_thung60] p ON s.MaThung60 = p.id_60
      WHERE s.TrangThaiScan = 'VALID' AND s.IsDeleted = 0
    `);
    console.table(result.recordset);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
