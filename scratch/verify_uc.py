import os
import re
import glob

MD_DIR = "/home/knsg-s3/WMS/02_Process_UseCase"
BACKEND_DIR = "/home/knsg-s3/WMS/backend"
FRONTEND_DIR = "/home/knsg-s3/WMS/frontend"
SCHEMA_FILE = "/home/knsg-s3/WMS/schema.sql"

REPORT_FILE = "/home/knsg-s3/.gemini/antigravity/brain/cc41d7f7-0565-42bc-9303-1ce6186ba4c0/System_Review_UC_Docs_Report.md"

# 1. Read schema tables
with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
    schema_content = f.read()

schema_tables = set(re.findall(r'CREATE TABLE\s+([a-zA-Z0-9_]+)', schema_content, re.IGNORECASE))

# 2. Extract backend API endpoints and used tables
backend_js_files = glob.glob(f"{BACKEND_DIR}/routes/*.js")
backend_endpoints = []
backend_content = ""

route_prefixes = {
    'auth': '/api/auth',
    'receipt': '/api/receipt',
    'ledger': '/api/ledger',
    'pack360': '/api/pack360',
    'oem': '/api/oem-orders',
    'pallet': '/api/pallets',
    'masterData': '/api/master',
    'export': '/api/export'
}

for js in backend_js_files:
    file_name = os.path.basename(js).replace('.js', '')
    with open(js, 'r', encoding='utf-8') as f:
        content = f.read()
        backend_content += content + "\n"
        
        matches = re.findall(r'router\.(get|post|put|delete|patch)\(\s*[\'"]([^\'"]+)[\'"]', content)
        prefix = route_prefixes.get(file_name, f'/api/{file_name}')
        for method, path in matches:
            full_path = (prefix + path).replace('//', '/')
            if full_path.endswith('/') and len(full_path) > 1:
                full_path = full_path[:-1]
            # Replace express params :id with {id} for easier matching or just keep them
            backend_endpoints.append(f"{method.upper()} {full_path}")

backend_endpoints = set(backend_endpoints)

# 3. Analyze MD files
md_files = sorted(glob.glob(f"{MD_DIR}/*.md"))

report = ["# Báo Cáo Đánh Giá Tài Liệu Use Case vs Codebase (Hệ Thống WMS)\n"]
report.append("Báo cáo này phân tích tất cả các tài liệu Use Case (UC) so với mã nguồn thực tế hiện tại (backend API và schema.sql) để tìm ra các điểm không đồng nhất và đưa ra khuyến nghị.\n")

for md in md_files:
    md_name = os.path.basename(md)
    if md_name in ['Activity_Diagrams.md', 'BPMN_Process.md', 'Process_Map.md', 'Use_Case_Catalog.md']:
        continue
        
    with open(md, 'r', encoding='utf-8') as f:
        content = f.read()
        
    report.append(f"## {md_name}\n")
    
    # Analyze APIs
    apis = re.findall(r'(GET|POST|PUT|DELETE|PATCH)\s+(/api/[a-zA-Z0-9_/-]+(?:\/:[a-zA-Z0-9_]+)?)', content)
    # Also catch paths like /api/receipt/scan-carton etc without methods? No, usually with methods.
    
    issues_found = False
    if apis:
        report.append("### Điểm khác biệt về API Routes:\n")
        has_api_issues = False
        for method, path in set(apis):
            api_str = f"{method} {path}"
            
            # Simple match logic: check if the exact path exists, or if parameterized paths match
            # e.g., /api/pallets/:id -> /api/pallets/:id
            matched = False
            for be_ep in backend_endpoints:
                if method in be_ep:
                    # simplify matching (strip /:id or similar)
                    base_path = re.sub(r'/:[a-zA-Z0-9_]+', '', path)
                    be_base_path = re.sub(r'/:[a-zA-Z0-9_]+', '', be_ep.split(' ')[1])
                    if base_path == be_base_path:
                        matched = True
                        break
            
            if not matched:
                has_api_issues = True
                issues_found = True
                report.append(f"- **MISSING API IN BACKEND**: Document mentions `{api_str}` nhưng không tìm thấy trong code backend.")
        if not has_api_issues:
            report.append("- *Tất cả API được đề cập đều tồn tại trong backend.*\n")
    
    # Analyze Tables
    tables = re.findall(r'`([a-zA-Z0-9_]+)`', content)
    # Filter heuristically: tables usually have underscores and are lower case
    tables = [t for t in tables if '_' in t and t.islower() and not t.endswith('.js') and not t.endswith('.jsx') and not t.endswith('.md')]
    # Also find tbl_xxx specifically
    tbls = re.findall(r'\b(tbl_[a-zA-Z0-9_]+)\b', content)
    tables.extend(tbls)
    
    tables = set(tables)
    
    # filter out known non-table snake_case words (like variable names)
    common_vars = {'user_id', 'is_active', 'failed_attempts', 'lockout_until', 'must_change_password', 'password_hash', 'last_password_changed_at', 'request_no', 'handover_no', 'id_60', 'qr_60', 'product_code'}
    tables = {t for t in tables if t not in common_vars}
    
    if tables:
        has_table_issues = False
        report.append("### Điểm khác biệt về Database Schema:\n")
        for t in sorted(tables):
            # Check if t is in schema
            if t in schema_tables:
                continue
            else:
                # check if it exists in backend queries
                if re.search(r'\b' + re.escape(t) + r'\b', backend_content):
                    report.append(f"- **SCHEMA DISCREPANCY**: Document và Backend code dùng bảng `{t}`, NHƯNG bảng này KHÔNG tồn tại trong `schema.sql`.")
                    has_table_issues = True
                    issues_found = True
                else:
                    # Might be a variable, let's filter if it ends with _id, _no, _qty, _date, _at, _by, _status, _type
                    if t.endswith('_id') or t.endswith('_no') or t.endswith('_qty') or t.endswith('_date') or t.endswith('_at') or t.endswith('_by') or t.endswith('_status') or t.endswith('_type') or t.endswith('_code') or t.endswith('_name'):
                        continue # highly likely a column name
                    if t in ['wms_token', 'wms_user']: continue
                    
                    report.append(f"- **GHOST TABLE**: Document nhắc đến bảng `{t}` nhưng KHÔNG có trong `schema.sql` cũng như trong query của backend.")
                    has_table_issues = True
                    issues_found = True
        
        if not has_table_issues:
            report.append("- *Tất cả bảng được nhắc đến đều đồng nhất với code.*\n")
            
    if not issues_found:
        report.append("✅ Không phát hiện điểm khác biệt đáng kể giữa tài liệu và code.\n")
        
    report.append("\n---\n")

report.append("## KHUYẾN NGHỊ TỔNG THỂ\n")
report.append("1. **Với các API bị thiếu trong backend**: Nếu API này là tính năng mới (theo thiết kế), ưu tiên Cập nhật CODE (Backend). Nếu API này là thiết kế cũ đã bị loại bỏ, ưu tiên Cập nhật TÀI LIỆU.\n")
report.append("2. **Với các Table có trong Backend nhưng thiếu trong schema.sql**: BẮT BUỘC ưu tiên cập nhật `schema.sql` để đảm bảo có thể tái tạo DB.\n")
report.append("3. **Với các Ghost Table (chỉ có trong tài liệu)**: Cần review lại xem có phải là bảng dự kiến (cập nhật code) hay bảng cũ đã bị xóa (cập nhật tài liệu).\n")

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write("\n".join(report))

print(f"Report saved to {REPORT_FILE}")
