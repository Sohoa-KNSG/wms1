# Implementation Plan: UC05 Raspberry Pi Integration

## 1. Database Changes
**File to create:** `migrations/uc05_pi_bridge.sql`

*   **Alter Table `pack360_header`:**
    *   Add `weight_source` (VARCHAR 20)
    *   Add `print_job_id` (VARCHAR 50)
    *   Add `print_status` (VARCHAR 20)
*   **Create Table `pack360_reprint_audit`:**
    *   Columns: `id` (INT IDENTITY), `pack360_id` (VARCHAR 50), `reason` (NVARCHAR 255), `user_code` (VARCHAR 50), `print_job_id` (VARCHAR 50), `created_at` (DATETIME)
*   **Update Stored Procedure `usp_Pack360_Complete`:**
    *   Add parameters: `@weight_source`, `@print_job_id`, `@print_status`.
    *   Update `pack360_header` with these values during completion.
*   **Create Stored Procedure `usp_Pack360_Reprint_Audit`:**
    *   Parameters: `@pack360_id`, `@reason`, `@user_code`, `@print_job_id` (OUTPUT).
    *   Logic: Insert into `pack360_reprint_audit` and return a newly generated `print_job_id`.
*   **Execution:** Run the script using `sqlcmd` with credentials from `cau_hinh_sql.txt`.

## 2. Backend (C#) Changes
**File to modify:** `src/Wms.Api/Controllers/Pack360Controller.cs`

*   **Update `PackCompleteRequest`:**
    *   Add `WeightSource` and `ManualWeightReason` (mapped using `JsonPropertyName`).
*   **Update `Complete` Endpoint:**
    *   Pass the new fields to the DB via `usp_Pack360_Complete`.
    *   Generate a new `print_job_id` (Guid).
    *   Generate `label_data` using a TSPL template with the package info.
    *   Return `print_job_id` and `label_data` in the response.
*   **Create `Reprint` Endpoint (`POST /api/v1/pack360/{id}/reprint`):**
    *   Accept a reason for reprint.
    *   Call `usp_Pack360_Reprint_Audit` to log the audit and get a new `print_job_id`.
    *   Generate new `label_data` (TSPL template).
    *   Return `print_job_id` and `label_data`.
*   **Implement TSPL Helper Function/Class:**
    *   Create logic to escape data correctly and replace hardcoded strings with dynamic TSPL formatting.
*   **Authorization:**
    *   Add `[Authorize(Policy = "...")]` to the `Complete` and `Reprint` endpoints (or the controller class).

## 3. Verification
*   Execute `dotnet build` to ensure the project compiles without errors.

---
Please click **Proceed** if you approve of this plan, and I will begin the implementation.
