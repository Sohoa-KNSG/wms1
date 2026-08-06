const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// GET /api/oem-orders/products
router.get('/products', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT DISTINCT MFInvtID FROM vw_WMS_Product WHERE MFInvtID IS NOT NULL ORDER BY MFInvtID');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/oem-orders
router.get('/', async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    const pool = await poolPromise;
    let request = pool.request();
    
    let query = `
      SELECT oem_order_no, product_code, batch_no, customer_code, customer_name,
             target_qty, actual_qty, order_receive_date, start_date, due_date, status, created_at, created_by
      FROM tbl_oem_orders
      WHERE 1=1
    `;
    
    if (search) {
      query += ` AND (oem_order_no LIKE @search OR product_code LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }
    
    if (status && status !== 'All') {
      query += ` AND status = @status`;
      request.input('status', sql.NVarChar, status);
    }
    
    if (startDate && endDate) {
      query += ` AND due_date BETWEEN @startDate AND @endDate`;
      request.input('startDate', sql.Date, startDate);
      request.input('endDate', sql.Date, endDate);
    }
    
    query += ` ORDER BY due_date ASC, created_at DESC`;
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching OEM orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/oem-orders/import
router.post('/import', async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu đơn hàng được cung cấp' });
    }
    
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      let insertedCount = 0;
      for (const order of orders) {
        // Validate required fields
        if (!order.oem_order_no || !order.product_code || !order.batch_no || !order.target_qty) {
          throw new Error('Thiếu trường thông tin bắt buộc (Số ĐH, Mã SP, Đợt giao, SL)');
        }
        
        // Check if exists
        const checkReq = new sql.Request(transaction);
        checkReq.input('oem_order_no', sql.NVarChar, order.oem_order_no);
        checkReq.input('product_code', sql.NVarChar, order.product_code);
        checkReq.input('batch_no', sql.Int, order.batch_no);
        
        const checkRes = await checkReq.query(`
          SELECT 1 FROM tbl_oem_orders 
          WHERE oem_order_no = @oem_order_no 
            AND product_code = @product_code 
            AND batch_no = @batch_no
        `);
        
        if (checkRes.recordset.length > 0) {
          throw new Error(`Đơn hàng ${order.oem_order_no} - SP ${order.product_code} (Đợt ${order.batch_no}) đã tồn tại`);
        }
        
        const insertReq = new sql.Request(transaction);
        insertReq.input('oem_order_no', sql.NVarChar, order.oem_order_no);
        insertReq.input('product_code', sql.NVarChar, order.product_code);
        insertReq.input('batch_no', sql.Int, parseInt(order.batch_no));
        insertReq.input('customer_code', sql.NVarChar, order.customer_code || null);
        insertReq.input('customer_name', sql.NVarChar, order.customer_name || null);
        insertReq.input('target_qty', sql.Int, parseInt(order.target_qty));
        insertReq.input('order_receive_date', sql.Date, order.order_receive_date || null);
        insertReq.input('start_date', sql.Date, order.start_date || null);
        insertReq.input('due_date', sql.Date, order.due_date || null);
        insertReq.input('status', sql.NVarChar, order.status || 'NEW');
        insertReq.input('created_by', sql.NVarChar, order.created_by || 'system');
        
        await insertReq.query(`
          INSERT INTO tbl_oem_orders (
            oem_order_no, product_code, batch_no, customer_code, customer_name, 
            target_qty, order_receive_date, start_date, due_date, status, created_by
          ) VALUES (
            @oem_order_no, @product_code, @batch_no, @customer_code, @customer_name, 
            @target_qty, @order_receive_date, @start_date, @due_date, @status, @created_by
          )
        `);
        insertedCount++;
      }
      
      await transaction.commit();
      res.json({ message: 'Import thành công', count: insertedCount });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Error importing OEM orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/oem-orders (Create new single order)
router.post('/', async (req, res) => {
  try {
    const order = req.body;
    
    if (!order.oem_order_no || !order.product_code || !order.batch_no || !order.target_qty) {
      return res.status(400).json({ error: 'Thiếu trường thông tin bắt buộc' });
    }
    
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Check exists
      const checkReq = new sql.Request(transaction);
      checkReq.input('oem_order_no', sql.NVarChar, order.oem_order_no);
      checkReq.input('product_code', sql.NVarChar, order.product_code);
      checkReq.input('batch_no', sql.Int, order.batch_no);
      const checkRes = await checkReq.query(`
        SELECT 1 FROM tbl_oem_orders 
        WHERE oem_order_no = @oem_order_no AND product_code = @product_code AND batch_no = @batch_no
      `);
      
      if (checkRes.recordset.length > 0) {
        throw new Error('Đơn hàng đã tồn tại');
      }
      
      const insertReq = new sql.Request(transaction);
      insertReq.input('oem_order_no', sql.NVarChar, order.oem_order_no);
      insertReq.input('product_code', sql.NVarChar, order.product_code);
      insertReq.input('batch_no', sql.Int, parseInt(order.batch_no));
      insertReq.input('customer_code', sql.NVarChar, order.customer_code || null);
      insertReq.input('customer_name', sql.NVarChar, order.customer_name || null);
      insertReq.input('target_qty', sql.Int, parseInt(order.target_qty));
      insertReq.input('order_receive_date', sql.Date, order.order_receive_date || null);
      insertReq.input('start_date', sql.Date, order.start_date || null);
      insertReq.input('due_date', sql.Date, order.due_date || null);
      insertReq.input('status', sql.NVarChar, order.status || 'NEW');
      insertReq.input('created_by', sql.NVarChar, order.created_by || 'system');
      
      await insertReq.query(`
        INSERT INTO tbl_oem_orders (
          oem_order_no, product_code, batch_no, customer_code, customer_name, 
          target_qty, order_receive_date, start_date, due_date, status, created_by
        ) VALUES (
          @oem_order_no, @product_code, @batch_no, @customer_code, @customer_name, 
          @target_qty, @order_receive_date, @start_date, @due_date, @status, @created_by
        )
      `);
      
      // Log History
      const histReq = new sql.Request(transaction);
      histReq.input('oem_order_no', sql.NVarChar, order.oem_order_no);
      histReq.input('product_code', sql.NVarChar, order.product_code);
      histReq.input('batch_no', sql.Int, parseInt(order.batch_no));
      histReq.input('action_type', sql.NVarChar, 'CREATE');
      histReq.input('new_data', sql.NVarChar, JSON.stringify(order));
      histReq.input('action_by', sql.NVarChar, order.created_by || 'system');
      
      await histReq.query(`
        INSERT INTO tbl_oem_orders_history (oem_order_no, product_code, batch_no, action_type, new_data, action_by)
        VALUES (@oem_order_no, @product_code, @batch_no, @action_type, @new_data, @action_by)
      `);
      
      await transaction.commit();
      res.json({ message: 'Tạo đơn thành công' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Error creating OEM order:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/oem-orders/:orderNo/:productCode/:batchNo (Update order)
router.put('/:orderNo/:productCode/:batchNo', async (req, res) => {
  try {
    const { orderNo, productCode, batchNo } = req.params;
    const newData = req.body;
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      const getReq = new sql.Request(transaction);
      getReq.input('oem_order_no', sql.NVarChar, orderNo);
      getReq.input('product_code', sql.NVarChar, productCode);
      getReq.input('batch_no', sql.Int, parseInt(batchNo));
      
      const oldRes = await getReq.query(`
        SELECT * FROM tbl_oem_orders 
        WHERE oem_order_no = @oem_order_no AND product_code = @product_code AND batch_no = @batch_no
      `);
      
      if (oldRes.recordset.length === 0) {
        throw new Error('Không tìm thấy đơn hàng để sửa');
      }
      const oldData = oldRes.recordset[0];
      
      const updateReq = new sql.Request(transaction);
      updateReq.input('oem_order_no', sql.NVarChar, orderNo);
      updateReq.input('product_code', sql.NVarChar, productCode);
      updateReq.input('batch_no', sql.Int, parseInt(batchNo));
      updateReq.input('customer_code', sql.NVarChar, newData.customer_code || oldData.customer_code);
      updateReq.input('customer_name', sql.NVarChar, newData.customer_name || oldData.customer_name);
      updateReq.input('target_qty', sql.Int, newData.target_qty !== undefined ? parseInt(newData.target_qty) : oldData.target_qty);
      updateReq.input('order_receive_date', sql.Date, newData.order_receive_date !== undefined ? newData.order_receive_date : oldData.order_receive_date);
      updateReq.input('start_date', sql.Date, newData.start_date !== undefined ? newData.start_date : oldData.start_date);
      updateReq.input('due_date', sql.Date, newData.due_date !== undefined ? newData.due_date : oldData.due_date);
      updateReq.input('status', sql.NVarChar, newData.status || oldData.status);
      updateReq.input('updated_by', sql.NVarChar, newData.updated_by || 'system');
      
      await updateReq.query(`
        UPDATE tbl_oem_orders SET
          customer_code = @customer_code,
          customer_name = @customer_name,
          target_qty = @target_qty,
          order_receive_date = @order_receive_date,
          start_date = @start_date,
          due_date = @due_date,
          status = @status
        WHERE oem_order_no = @oem_order_no AND product_code = @product_code AND batch_no = @batch_no
      `);
      
      // Log History
      const histReq = new sql.Request(transaction);
      histReq.input('oem_order_no', sql.NVarChar, orderNo);
      histReq.input('product_code', sql.NVarChar, productCode);
      histReq.input('batch_no', sql.Int, parseInt(batchNo));
      histReq.input('action_type', sql.NVarChar, 'UPDATE');
      histReq.input('old_data', sql.NVarChar, JSON.stringify(oldData));
      histReq.input('new_data', sql.NVarChar, JSON.stringify(newData));
      histReq.input('action_by', sql.NVarChar, newData.updated_by || 'system');
      
      await histReq.query(`
        INSERT INTO tbl_oem_orders_history (oem_order_no, product_code, batch_no, action_type, old_data, new_data, action_by)
        VALUES (@oem_order_no, @product_code, @batch_no, @action_type, @old_data, @new_data, @action_by)
      `);
      
      await transaction.commit();
      res.json({ message: 'Cập nhật thành công' });
    } catch (txErr) {
      await transaction.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Error updating OEM order:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/oem-orders/:orderNo/:productCode/:batchNo/history
router.get('/:orderNo/:productCode/:batchNo/history', async (req, res) => {
  try {
    const { orderNo, productCode, batchNo } = req.params;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('oem_order_no', sql.NVarChar, orderNo);
    request.input('product_code', sql.NVarChar, productCode);
    request.input('batch_no', sql.Int, parseInt(batchNo));
    
    const result = await request.query(`
      SELECT * FROM tbl_oem_orders_history
      WHERE oem_order_no = @oem_order_no 
        AND product_code = @product_code 
        AND batch_no = @batch_no
      ORDER BY action_at DESC
    `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching order history:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
