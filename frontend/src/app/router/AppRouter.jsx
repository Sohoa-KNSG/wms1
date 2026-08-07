import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { ROUTES } from '../../shared/constants/routes.js';

// Lazy/Direct component imports
import LoginScreen from '../../components/LoginScreen.jsx';
import ChangePasswordScreen from '../../components/ChangePasswordScreen.jsx';
import HomeScreen from '../../components/HomeScreen.jsx';
import ReceiptList from '../../components/ReceiptList.jsx';
import ReceiptDetail from '../../components/ReceiptDetail.jsx';
import ScanScreen from '../../components/ScanScreen.jsx';
import StorekeeperConfirmOverview from '../../components/StorekeeperConfirmOverview.jsx';
import PartialReceiptOverview from '../../components/PartialReceiptOverview.jsx';
import Pack360Screen from '../../components/Pack360Screen.jsx';
import RepackScreen from '../../components/RepackScreen.jsx';
import DetachCartonsScreen from '../../components/DetachCartonsScreen.jsx';
import PalletScreen from '../../components/PalletScreen.jsx';
import ExportDispatchScreen from '../../components/ExportDispatchScreen.jsx';
import ExportGateApprovalScreen from '../../components/ExportGateApprovalScreen.jsx';
import PickingScreen from '../../components/PickingScreen.jsx';
import MasterDataScreen from '../../components/MasterDataScreen.jsx';
import RealtimeReportScreen from '../../components/RealtimeReportScreen.jsx';
import SmartAnalyticsDashboard from '../../components/SmartAnalyticsDashboard.jsx';
import LedgerReportScreen from '../../components/LedgerReportScreen.jsx';
import OemOrderList from '../../components/OemOrderList.jsx';
import StockManagementScreen from '../../components/StockManagementScreen.jsx';
import AdminUserList from '../../components/AdminUserList.jsx';
import AssetDossierScreen from '../../components/AssetDossierScreen.jsx';

export const AppRouter = () => {
  const navigate = useNavigate();
  const handleBack = () => navigate(ROUTES.HOME);

  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTES.LOGIN} element={<LoginScreen />} />

      {/* Protected Forced Password Change Route */}
      <Route
        path={ROUTES.CHANGE_PASSWORD}
        element={
          <ProtectedRoute>
            <ChangePasswordScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      {/* Main Protected App Routes */}
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <HomeScreen />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.RECEIPT_LIST}
        element={
          <ProtectedRoute requiredPermission="Receipt.Read">
            <ReceiptList onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.RECEIPT_DETAIL}
        element={
          <ProtectedRoute requiredPermission="Receipt.Read">
            <ReceiptDetail onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.SCAN}
        element={
          <ProtectedRoute requiredPermission="Receipt.Scan">
            <ScanScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.RECEIPT_SCAN}
        element={
          <ProtectedRoute requiredPermission="Receipt.Scan">
            <ScanScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.STOREKEEPER_CONFIRM}
        element={
          <ProtectedRoute requiredPermission="THU_KHO">
            <StorekeeperConfirmOverview onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.STOREKEEPER_CONFIRM_DETAIL}
        element={
          <ProtectedRoute requiredPermission="THU_KHO">
            <StorekeeperConfirmOverview onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PARTIAL_RECEIPT}
        element={
          <ProtectedRoute requiredPermission="THU_KHO">
            <PartialReceiptOverview onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PARTIAL_RECEIPT_DETAIL}
        element={
          <ProtectedRoute requiredPermission="THU_KHO">
            <PartialReceiptOverview onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PACK360}
        element={
          <ProtectedRoute requiredPermission="Pack360.ScanUnit">
            <Pack360Screen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.REPACK}
        element={
          <ProtectedRoute requiredPermission="Pack360.Scan">
            <RepackScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.DETACH_CARTONS}
        element={
          <ProtectedRoute requiredPermission="Pack360.Detach">
            <DetachCartonsScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PALLET}
        element={
          <ProtectedRoute requiredPermission="Pallet.Manage">
            <PalletScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.EXPORT}
        element={
          <ProtectedRoute requiredPermission="Export.Manage">
            <ExportDispatchScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.EXPORT_GATE}
        element={
          <ProtectedRoute requiredPermission="Picking.Ship">
            <ExportGateApprovalScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.PICKING}
        element={
          <ProtectedRoute requiredPermission="Picking.Scan">
            <PickingScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MASTER_DATA}
        element={
          <ProtectedRoute requiredPermission="MasterData.Read">
            <MasterDataScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.REPORTS}
        element={
          <ProtectedRoute requiredPermission="Reports.Read">
            <SmartAnalyticsDashboard onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.LEDGER_REPORTS}
        element={
          <ProtectedRoute requiredPermission="Ledger.Read">
            <LedgerReportScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.OEM_ORDERS}
        element={
          <ProtectedRoute requiredPermission="Oem.Read">
            <OemOrderList onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.STOCK_MANAGEMENT}
        element={
          <ProtectedRoute>
            <StockManagementScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <ProtectedRoute requiredPermission="Admin.Users.Manage">
            <AdminUserList onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ASSET_DOSSIER}
        element={
          <ProtectedRoute>
            <AssetDossierScreen onBack={handleBack} />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
};
