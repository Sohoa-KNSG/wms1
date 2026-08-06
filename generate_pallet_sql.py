import csv
from datetime import datetime

with open('file_input/tbl_pallet.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    
    with open('import_pallet_data.sql', 'w', encoding='utf-8') as out:
        out.write("USE WMS1;\nGO\n\n")
        
        for row in reader:
            pallet_id = row['ma_pallet'].strip()
            if pallet_id == '-' or not pallet_id:
                continue
                
            status_val = row['ma_trangthai'].strip()
            status = 'ACTIVE' if status_val == '0' else 'INACTIVE'
            
            location = row['ma_ke'].strip()
            if location == 'NULL' or not location:
                location = "NULL"
            else:
                location = f"N'{location}'"
                
            created_at = row['time_cre'].strip()
            if created_at == 'NULL' or not created_at:
                created_at = "GETDATE()"
            else:
                created_at = f"N'{created_at}'"
                
            # Output MERGE or INSERT statement
            stmt = f"""
IF NOT EXISTS (SELECT 1 FROM pallet WHERE pallet_id = N'{pallet_id}')
BEGIN
    INSERT INTO pallet (pallet_id, status, current_location_code, created_at, created_by)
    VALUES (N'{pallet_id}', N'{status}', {location}, {created_at}, 'SYSTEM');
END
ELSE
BEGIN
    UPDATE pallet
    SET status = N'{status}', current_location_code = {location}
    WHERE pallet_id = N'{pallet_id}';
END
GO
"""
            out.write(stmt)

print("Created import_pallet_data.sql")
