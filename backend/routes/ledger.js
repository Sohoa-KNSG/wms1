const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Lấy danh sách giao dịch (Master)
router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const { type, fromDate, toDate } = req.query;
    const pool = await poolPromise;
    const request = pool.request();
    
    if (type) request.input('Type', type);
    if (fromDate) request.input('FromDate', fromDate);
    if (toDate) request.input('ToDate', toDate);

    const result = await request.execute('usp_WMS_GetTransactions');
    
    res.json({
      status: 'SUCCESS',
      data: result.recordset
    });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách giao dịch:', err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Lấy chi tiết giao dịch (Detail)
router.get('/transactions/:transactionId/details', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    request.input('TransactionId', req.params.transactionId);
    
    const result = await request.execute('usp_WMS_GetTransactionDetails');
    
    res.json({
      status: 'SUCCESS',
      data: result.recordset
    });
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết giao dịch:', err);
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

module.exports = router;
