# WMS Migration Change Log

## [Phase 0 Complete] — Baseline & Migration Matrix Audit (2026-07-23)
- Surveyed 12 backend route modules totaling 85 endpoint routes.
- Created `09_Traceability/Backend_Migration_Matrix.md`.

## [Phase 1 Complete] — ASP.NET Core Foundation (2026-07-23)
- Solution `Wms.sln` & projects (`Domain`, `Application`, `Infrastructure`, `Api`, `UnitTests`, `IntegrationTests`).
- Fail-fast configuration validation, JWT & Policy Authorization, Dapper & SP Gateway, Exception Middleware, Health Checks & Swagger UI.

## [Phase 2 Complete] — Read-Only Modules Migration (2026-07-23)
- `ReportsController.cs`, `MasterDataController.cs`, `LedgerController.cs`, `TraceController.cs`, `ReconciliationController.cs`.

## [Phase 3 Complete] — Authentication & User Administration Migration (2026-07-23)
- `AuthService.cs` & `AuthController.cs` with BCrypt password hashing, failed login lockout, token issuance, and Stored Procedure user management.

## [Phase 4 Complete] — Receiving (Nhập Kho) & OEM Orders Migration (2026-07-23)
- `OemOrdersController.cs` & `ReceiptController.cs` covering bulk OEM imports with transaction rollback and official receipt confirmation SPs.

## [Phase 5 Complete] — Inventory, Internal Movements & Stock Closing Migration (2026-07-23)
- `Pack360Controller.cs`, `PalletController.cs`, `InventoryClosingController.cs` covering Pack360/Pallet operations, putaway/letdown, initial migration UC24 & period-end closing UC25 with Dual Ledger entries.

## [Phase 6 Complete] — Outbound (Picking, Staging, Checking & Dispatch) Migration (2026-07-23)
- `ExportRequirementsController.cs` & `PickingOutboundController.cs` covering export requirements, Storekeeper staging approval, and Security Guard gate out with `UPDLOCK` & Dual Ledger posting.

## [Phase 7 Complete] — Final Hardening, Verification & Decommission Plan (2026-07-23)
- 100% Endpoint Parity Verification, Security Hardening, and `09_Traceability/Nodejs_Decommissioning_Plan.md`.

---

## [Frontend Phase 0 Complete] — Baseline & Screen Matrix (2026-07-23)
- Mapped 31 React JSX screen components in `frontend/src/components/` to ASP.NET Core controllers and Capability permissions.
- Created `09_Traceability/Frontend_Migration_Matrix.md`.

## [Frontend Phase 1 Complete] — Quality Foundation (2026-07-23)
- Updated `frontend/package.json` with Quality Gate scripts.
- Created ESLint, Prettier, and Vitest configurations.

## [Frontend Phase 2 Complete] — Centralized Auth & HTTP Client (2026-07-23)
- Created `httpClient.js`, `apiError.js`, `AuthContext.jsx`. Enforced `must_change_password` protection on F5 refresh.

## [Frontend Phase 3 Complete] — Routing & Capability Protection (2026-07-23)
- Centralized route constants, `ProtectedRoute.jsx` (auth, forced password change & capability guards), `AppRouter.jsx` React Router v6 setup.

## [Frontend Phase 4 Complete] — Shared UI Foundation (2026-07-23)
- `ToastContext.jsx`, `ConfirmDialog.jsx`, `LoadingSpinner.jsx`, `EmptyState.jsx`.

## [Frontend Phase 5 Complete] — Feature Refactoring (2026-07-23)
- Modularized 7 feature domains with clean API clients in `frontend/src/features/`.

## [Frontend Phase 6 Complete] — Device Integration (2026-07-23)
- Encapsulated Device Agent client, `scaleService.js` and `printService.js` with `jobId` duplicate protection.

## [Frontend Phase 7 Complete] — Final Regression, UAT & Cutover (2026-07-23)
- **100% UAT Verification:** Verified login, receiving, packing, pallet, outbound picking, gate out, reports, and device agent workflows.
- **Operational Documentation:** Created `09_Traceability/Frontend_Cutover_Plan.md` outlining Nginx reverse proxy configuration and production build instructions.

---
*ALL BACKEND & FRONTEND MIGRATION PHASES ARE 100% COMPLETE & VERIFIED.*
