import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/auth/AuthContext.jsx';
import { ROUTES } from '../shared/constants/routes.js';
import { 
  PackageSearch, CheckSquare, Settings, Users, BookOpen, ClipboardList, 
  Scissors, ScanBarcode, Truck, Layers, PieChart, ShieldAlert, ShieldCheck, ArrowDownCircle,
  Archive, FileText, Activity, RefreshCcw, LogOut, Lock, User
} from 'lucide-react';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const username = (user?.username || '').toLowerCase();
  const roles = user?.roles || [];
  
  // Role Evaluation: Grant full/appropriate access based on roles or username
  const isAdmin = roles.includes('ADMIN') || roles.includes('IT_ADMIN') || username === 'admin' || user?.is_admin || roles.length === 0;
  const isStorekeeper = isAdmin || roles.includes('STOREKEEPER') || roles.includes('THU_KHO') || username === 'thukho';
  const isStaff = isAdmin || roles.includes('STAFF') || roles.includes('NHAN_VIEN') || username === 'nhanvien';
  const isPlannerOrManager = isAdmin || roles.includes('PLANNER') || roles.includes('MANAGER');

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s ease',
    padding: '1.25rem'
  };

  const iconContainerStyle = (bgColor) => ({
    padding: '0.875rem',
    backgroundColor: bgColor,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  });

  const titleStyle = {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    margin: 0
  };

  const descStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    margin: '0.25rem 0 0 0'
  };

  const routeMapping = {
    staff_list: ROUTES.RECEIPT_LIST,
    storekeeper_list: ROUTES.STOREKEEPER_CONFIRM,
    partial_receipt_list: ROUTES.PARTIAL_RECEIPT,
    pack360: ROUTES.PACK360,
    repack: ROUTES.REPACK,
    detach_cartons: ROUTES.DETACH_CARTONS,
    oem_transfer: ROUTES.PACK360,
    pallet_management: ROUTES.PALLET,
    picking: ROUTES.PICKING,
    gate_approval: ROUTES.EXPORT_GATE,
    export_dispatch: ROUTES.EXPORT,
    temporary_dispatch: ROUTES.EXPORT,
    reports: ROUTES.REPORTS,
    ledger_transactions: ROUTES.LEDGER_REPORTS,
    stock_management: ROUTES.STOCK_MANAGEMENT,
    oem_orders: ROUTES.OEM_ORDERS,
    asset_dossier: ROUTES.ASSET_DOSSIER,
    master_data: ROUTES.MASTER_DATA,
    admin_users: ROUTES.ADMIN_USERS
  };

  const handleNavigate = (screenKey) => {
    const targetRoute = routeMapping[screenKey] || ROUTES.HOME;
    navigate(targetRoute);
  };

  const cardProps = (screenKey, hoverColor) => ({
    role: "button",
    tabIndex: 0,
    className: "card",
    style: cardStyle,
    onClick: () => handleNavigate(screenKey),
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && handleNavigate(screenKey),
    onMouseEnter: (e) => e.currentTarget.style.borderColor = hoverColor,
    onMouseLeave: (e) => e.currentTarget.style.borderColor = 'transparent'
  });

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Header & User Navigation Bar (Sticky Locked on Scroll) */}
      <header style={{
        position: 'sticky',
        top: '0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.875rem 1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.webp" alt="WMS Logo" style={{ maxHeight: '40px' }} />
          <div>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              HỆ THỐNG KHO THÀNH PHẨM (WMS)
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Phiên bản ASP.NET Core 8.0</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '6px 12px', background: '#f1f5f9', borderRadius: '20px' }}>
            <User size={18} color="#475569" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
              {user?.fullName || user?.username || 'Người Dùng'}
            </span>
            <span style={{ fontSize: '0.75rem', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
              {isAdmin ? 'ADMIN' : isStorekeeper ? 'THỦ KHO' : 'NHÂN VIÊN'}
            </span>
          </div>

          <button
            onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
            title="Đổi mật khẩu"
          >
            <Lock size={16} />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            title="Đăng xuất"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Group 1: Nhập Kho & Tiếp Nhận */}
      {(isStaff || isStorekeeper) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ArrowDownCircle size={20} color="var(--primary-color, #2563eb)" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              1. Nhập Kho & Tiếp Nhận
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {isStaff && (
              <div {...cardProps('staff_list', 'var(--primary-color, #2563eb)')}>
                <div style={iconContainerStyle('var(--primary-glow, #dbeafe)')}>
                  <ScanBarcode size={28} color="var(--primary-color, #2563eb)" />
                </div>
                <div>
                  <h3 style={titleStyle}>Quét Nhận Thùng 60</h3>
                  <p style={descStyle}>Nhận và quét mã vạch Thùng 60 theo phiếu bàn giao</p>
                </div>
              </div>
            )}

            {isStorekeeper && (
              <div {...cardProps('storekeeper_list', '#10b981')}>
                <div style={iconContainerStyle('rgba(16, 185, 129, 0.1)')}>
                  <CheckSquare size={28} color="#10b981" />
                </div>
                <div>
                  <h3 style={titleStyle}>Duyệt Phiếu Nhập Kho</h3>
                  <p style={descStyle}>Xác nhận ghi Sổ cái tăng tồn kho chính thức</p>
                </div>
              </div>
            )}

            {isStorekeeper && (
              <div {...cardProps('partial_receipt_list', '#f59e0b')}>
                <div style={iconContainerStyle('#fef3c7')}>
                  <Scissors size={28} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={titleStyle}>Nhập Kho Hàng Lẻ</h3>
                  <p style={descStyle}>Xử lý các lô hàng lệch số lượng hoặc nhập thiếu</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Group 2: Lưu Trữ & Đóng Gói */}
      {(isStaff || isStorekeeper) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={20} color="#0ea5e9" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              2. Lưu Trữ & Đóng Gói
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {isStaff && (
              <div {...cardProps('pack360', '#0ea5e9')}>
                <div style={iconContainerStyle('#e0f2fe')}>
                  <PackageSearch size={28} color="#0ea5e9" />
                </div>
                <div>
                  <h3 style={titleStyle}>Đóng Gói Kiện 360</h3>
                  <p style={descStyle}>Gom Thùng 60 thành kiện 360, cân và in tem TSPL</p>
                </div>
              </div>
            )}

            {isStaff && (
              <div {...cardProps('repack', '#8b5cf6')}>
                <div style={iconContainerStyle('#f3e8ff')}>
                  <Archive size={28} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={titleStyle}>Đóng Gói Kiện Repack</h3>
                  <p style={descStyle}>Đóng gói kiện hàng lẻ sau khi xử lý Repack</p>
                </div>
              </div>
            )}

            {isStaff && (
              <div {...cardProps('detach_cartons', '#ec4899')}>
                <div style={iconContainerStyle('#fce7f3')}>
                  <Scissors size={28} color="#ec4899" />
                </div>
                <div>
                  <h3 style={titleStyle}>Tách Thùng Khỏi Kiện</h3>
                  <p style={descStyle}>Giải phóng hoặc tách Thùng 60 ra khỏi Kiện 360</p>
                </div>
              </div>
            )}

            {(isStaff || isStorekeeper) && (
              <div {...cardProps('oem_transfer', '#0284c7')}>
                <div style={iconContainerStyle('#e0f2fe')}>
                  <FileText size={28} color="#0284c7" />
                </div>
                <div>
                  <h3 style={titleStyle}>Chuyển Đơn OEM Pack360</h3>
                  <p style={descStyle}>Chuyển toàn bộ Thùng 60 trong Kiện 360 sang Đơn OEM mới</p>
                </div>
              </div>
            )}

            {isStorekeeper && (
              <div {...cardProps('pallet_management', '#6366f1')}>
                <div style={iconContainerStyle('#e0e7ff')}>
                  <Archive size={28} color="#6366f1" />
                </div>
                <div>
                  <h3 style={titleStyle}>Quản Lý Pallet & Vị Trí Kho</h3>
                  <p style={descStyle}>Tạo pallet, hạ pallet, chuyển vị trí kệ kho</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Group 3: Soạn Hàng & Xuất Bến */}
      {(isStaff || isStorekeeper) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Truck size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              3. Soạn Hàng & Xuất Bến
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {isStaff && (
              <div {...cardProps('picking', '#f59e0b')}>
                <div style={iconContainerStyle('#fef3c7')}>
                  <ClipboardList size={28} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={titleStyle}>Đơn Soạn Hàng (Picking)</h3>
                  <p style={descStyle}>Soạn hàng theo vị trí kệ, tách thùng lẻ khi pick</p>
                </div>
              </div>
            )}

            <div {...cardProps('gate_approval', '#0284c7')}>
              <div style={iconContainerStyle('#e0f2fe')}>
                <ShieldCheck size={28} color="#0284c7" />
              </div>
              <div>
                <h3 style={titleStyle}>Duyệt Xuất Kho & Kiểm Cổng Bảo Vệ</h3>
                <p style={descStyle}>Thủ Kho ký duyệt xuất kho & Bảo Vệ cổng kiểm soát xe xuất bến</p>
              </div>
            </div>

            {isStorekeeper && (
              <div {...cardProps('export_dispatch', '#ef4444')}>
                <div style={iconContainerStyle('#fee2e2')}>
                  <Truck size={28} color="#ef4444" />
                </div>
                <div>
                  <h3 style={titleStyle}>Phiếu Xuất Bến & Vận Chuyển</h3>
                  <p style={descStyle}>Xác nhận xuất xe, ghi Sổ cái giảm tồn kho</p>
                </div>
              </div>
            )}

            {(isStaff || isStorekeeper) && (
              <div {...cardProps('temporary_dispatch', '#f59e0b')}>
                <div style={iconContainerStyle('#fef3c7')}>
                  <PackageSearch size={28} color="#f59e0b" />
                </div>
                <div>
                  <h3 style={titleStyle}>Quản Lý Xuất Tạm Thành Phẩm (UC18)</h3>
                  <p style={descStyle}>Tạo phiếu xuất tạm triển lãm/hàng mẫu & Hoàn nhập trả hàng</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Group 4: Kiểm Soát & Quản Trị */}
      {(isPlannerOrManager || isAdmin) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={20} color="#10b981" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              4. Kiểm Soát & Quản Trị
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div {...cardProps('asset_dossier', '#0284c7')}>
              <div style={iconContainerStyle('#e0f2fe')}>
                <ScanBarcode size={28} color="#0284c7" />
              </div>
              <div>
                <h3 style={titleStyle}>Tra Cứu Hồ Sơ Tài Sản (UC12)</h3>
                <p style={descStyle}>Tra cứu phả hệ 3 cấp độ Thùng 60 / Pack360 / Pallet, IoT cân nặng & Sổ Cái Kép</p>
              </div>
            </div>

            <div {...cardProps('reports', '#10b981')}>
              <div style={iconContainerStyle('rgba(16, 185, 129, 0.1)')}>
                <PieChart size={28} color="#10b981" />
              </div>
              <div>
                <h3 style={titleStyle}>Báo Cáo Tồn Kho & Truy Vết</h3>
                <p style={descStyle}>Xem tồn kho Macro/Micro và Vòng đời thùng</p>
              </div>
            </div>

            <div {...cardProps('ledger_transactions', '#6366f1')}>
              <div style={iconContainerStyle('#e0e7ff')}>
                <Activity size={28} color="#6366f1" />
              </div>
              <div>
                <h3 style={titleStyle}>Nhật Ký Sổ Cái Giao Dịch</h3>
                <p style={descStyle}>Truy vấn chi tiết Sổ đơn vị & Sổ sản phẩm kép</p>
              </div>
            </div>

            <div {...cardProps('oem_orders', '#f59e0b')}>
              <div style={iconContainerStyle('#fef3c7')}>
                <BookOpen size={28} color="#f59e0b" />
              </div>
              <div>
                <h3 style={titleStyle}>Quản Lý Đơn Hàng OEM</h3>
                <p style={descStyle}>Theo dõi tiến độ sản xuất và đóng gói đơn OEM</p>
              </div>
            </div>

            <div {...cardProps('stock_management', '#dc2626')}>
              <div style={iconContainerStyle('#fef2f2')}>
                <Lock size={28} color="#dc2626" />
              </div>
              <div>
                <h3 style={titleStyle}>Khóa & Release Tồn Kho</h3>
                <p style={descStyle}>Quản lý khóa tồn kho (UC13) và mở khóa giải phóng (UC14)</p>
              </div>
            </div>

            {isAdmin && (
              <div {...cardProps('master_data', '#8b5cf6')}>
                <div style={iconContainerStyle('#f3e8ff')}>
                  <Settings size={28} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={titleStyle}>Danh Mục Master Data</h3>
                  <p style={descStyle}>Quản lý Vị trí kệ, Sản phẩm, Khách hàng</p>
                </div>
              </div>
            )}

            {isAdmin && (
              <div {...cardProps('admin_users', '#ec4899')}>
                <div style={iconContainerStyle('#fce7f3')}>
                  <Users size={28} color="#ec4899" />
                </div>
                <div>
                  <h3 style={titleStyle}>Quản Trị Người Dùng</h3>
                  <p style={descStyle}>Phân quyền tài khoản, cấp lại mật khẩu</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
