const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Ensure tbl_customers exists
(async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tbl_customers' AND xtype='U')
            CREATE TABLE tbl_customers (
                id INT IDENTITY(1,1) PRIMARY KEY,
                customer_code NVARCHAR(50) NOT NULL UNIQUE,
                customer_name NVARCHAR(255) NOT NULL,
                address NVARCHAR(500),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT GETDATE()
            )
        `);
    } catch(e) { console.error('Error creating tbl_customers', e); }
})();

// --- Trucks ---
router.get('/trucks', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tbl_trucks WHERE status = \'ACTIVE\'');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/trucks', async (req, res) => {
    try {
        const { license_plate, max_weight_kg, max_volume } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('license_plate', sql.NVarChar, license_plate)
            .input('max_weight_kg', sql.Decimal(18, 2), max_weight_kg)
            .input('max_volume', sql.Decimal(18, 2), max_volume || null)
            .query(`
                INSERT INTO tbl_trucks (license_plate, max_weight_kg, max_volume) 
                VALUES (@license_plate, @max_weight_kg, @max_volume)
            `);
        res.json({ success: true, message: 'Truck created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Drivers ---
router.get('/drivers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tbl_drivers WHERE status = \'ACTIVE\'');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/drivers', async (req, res) => {
    try {
        const { driver_name, phone } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('driver_name', sql.NVarChar, driver_name)
            .input('phone', sql.NVarChar, phone || null)
            .query(`
                INSERT INTO tbl_drivers (driver_name, phone) 
                VALUES (@driver_name, @phone)
            `);
        res.json({ success: true, message: 'Driver created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Guards ---
router.get('/guards', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tbl_guards WHERE status = \'ACTIVE\'');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/guards', async (req, res) => {
    try {
        const { guard_name } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('guard_name', sql.NVarChar, guard_name)
            .query(`
                INSERT INTO tbl_guards (guard_name) 
                VALUES (@guard_name)
            `);
        res.json({ success: true, message: 'Guard created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Customers ---
router.get('/customers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM tbl_customers WHERE status = \'ACTIVE\'');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/customers', async (req, res) => {
    try {
        const { customer_code, customer_name, address } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('customer_code', sql.NVarChar, customer_code)
            .input('customer_name', sql.NVarChar, customer_name)
            .input('address', sql.NVarChar, address || null)
            .query(`
                INSERT INTO tbl_customers (customer_code, customer_name, address) 
                VALUES (@customer_code, @customer_name, @address)
            `);
        res.json({ success: true, message: 'Customer created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
