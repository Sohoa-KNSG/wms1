const fs = require('fs');
const { poolPromise } = require('./db');

function parseDate(dateStr) {
    if (!dateStr || dateStr.trim().toUpperCase() === 'HỦY' || dateStr.trim() === '') return null;
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
        // Assume MM/DD/YYYY from CSV
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return null;
}

function parseQty(qtyStr) {
    if (!qtyStr) return 0;
    return parseInt(qtyStr.replace(/\./g, '').trim(), 10) || 0;
}

async function importCSV() {
    try {
        const pool = await poolPromise;
        const content = fs.readFileSync('../file_input/dondon_oem.csv', 'utf8');
        const lines = content.split('\n');
        
        let success = 0;
        let errors = 0;
        
        console.log("Starting CSV import...");
        
        // Loop from line 2 to skip headers
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const row = [];
            let inQuotes = false;
            let currentVal = '';
            for (let j = 0; j < line.length; j++) {
                if (line[j] === '"') {
                    inQuotes = !inQuotes;
                } else if (line[j] === ',' && !inQuotes) {
                    row.push(currentVal);
                    currentVal = '';
                } else {
                    currentVal += line[j];
                }
            }
            row.push(currentVal);
            
            if (row.length < 7) continue;
            
            const receiveDate = parseDate(row[0]);
            const startDate = parseDate(row[1]);
            const orderNo = row[2]?.trim();
            const cusCode = row[3]?.trim();
            const cusName = row[4]?.trim();
            const prodCode = row[5]?.trim();
            const qty = parseQty(row[6]);
            const dueDate = parseDate(row[7]);
            
            if (!orderNo || !prodCode) continue;
            
            try {
                const request = pool.request();
                request.input('orderNo', orderNo);
                request.input('prodCode', prodCode);
                request.input('batchNo', 1);
                request.input('cusCode', cusCode);
                request.input('cusName', cusName);
                request.input('qty', qty);
                request.input('receiveDate', receiveDate);
                request.input('startDate', startDate);
                request.input('dueDate', dueDate);
                
                await request.query(`
                    IF NOT EXISTS (SELECT 1 FROM tbl_oem_orders WHERE oem_order_no = @orderNo AND product_code = @prodCode AND batch_no = @batchNo)
                    BEGIN
                        INSERT INTO tbl_oem_orders (
                            oem_order_no, product_code, batch_no, customer_code, customer_name,
                            target_qty, order_receive_date, start_date, due_date
                        ) VALUES (
                            @orderNo, @prodCode, @batchNo, @cusCode, @cusName,
                            @qty, @receiveDate, @startDate, @dueDate
                        )
                    END
                `);
                success++;
                if (success % 1000 === 0) console.log(`Imported ${success} records...`);
            } catch (err) {
                console.error(`Error on line ${i+1}: ${err.message}`);
                errors++;
            }
        }
        
        console.log(`Import completed. Success: ${success}, Errors: ${errors}`);
    } catch (e) {
        console.error('Fatal error:', e);
    }
    process.exit(0);
}

importCSV();
