using System.Data;
using System.Text.Json.Serialization;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/temporary-dispatch")]
public class TemporaryDispatchController : ControllerBase
{
    private const decimal QuantityTolerance = 0.0001m;
    private readonly ISqlConnectionFactory _connectionFactory;
    private readonly ICurrentUserService _currentUserService;

    public TemporaryDispatchController(
        ISqlConnectionFactory connectionFactory,
        ICurrentUserService currentUserService)
    {
        _connectionFactory = connectionFactory;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.TemporaryDispatchRead)]
    public async Task<IActionResult> GetTemporaryDispatches(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] bool? overdueOnly)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var sql = @"
            SELECT dispatch_no, reason_code, borrower_name, dispatch_date, due_date,
                   total_cartons, total_qty, returned_qty, converted_qty, status,
                   created_by, created_at,
                   CASE WHEN due_date < CAST(GETUTCDATE() AS DATE)
                             AND status = 'TEMP_OUT' THEN 1 ELSE 0 END AS is_overdue
            FROM tbl_temporary_dispatch_header
            WHERE (@Search IS NULL OR dispatch_no LIKE @Search OR borrower_name LIKE @Search)
              AND (@Status IS NULL OR @Status = 'All' OR status = @Status)
              AND (@OverdueOnly = 0 OR (due_date < CAST(GETUTCDATE() AS DATE) AND status = 'TEMP_OUT'))
            ORDER BY created_at DESC";

        var rows = await connection.QueryAsync(sql, new
        {
            Search = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%",
            Status = string.IsNullOrWhiteSpace(status) ? null : status,
            OverdueOnly = overdueOnly == true
        });

        return Ok(ApiResponse<object>.Success(rows));
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.TemporaryDispatchManage)]
    public async Task<IActionResult> CreateTemporaryDispatch([FromBody] CreateTempDispatchRequest request)
    {
        var requestId = RequireRequestId();
        if (requestId is null)
        {
            return MissingRequestId();
        }

        var requestItems = request.Items ?? new List<TempDispatchRequestItemDto>();
        var normalizedItems = requestItems
            .Where(item => !string.IsNullOrWhiteSpace(item.ProductCode) && item.Qty > 0)
            .GroupBy(item => item.ProductCode.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(group => new TempDispatchRequestItemDto
            {
                ProductCode = group.Key,
                Qty = group.Sum(item => item.Qty)
            })
            .ToList();

        if (string.IsNullOrWhiteSpace(request.BorrowerName) ||
            request.DueDate.Date < DateTime.UtcNow.Date ||
            requestItems.Count == 0 ||
            requestItems.Any(item => string.IsNullOrWhiteSpace(item.ProductCode) || item.Qty <= 0))
        {
            return BadRequest(ApiResponse<object>.Error(
                WmsErrorCodes.ValidationFailed,
                "Bên mượn, hạn trả và toàn bộ dòng SKU/số lượng phải hợp lệ."));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var existingDispatch = await connection.QueryFirstOrDefaultAsync<string>(@"
                SELECT dispatch_no
                FROM tbl_temporary_dispatch_header WITH (UPDLOCK, HOLDLOCK)
                WHERE request_id = @RequestId",
                new { RequestId = requestId }, transaction);

            if (!string.IsNullOrWhiteSpace(existingDispatch))
            {
                transaction.Commit();
                return Ok(ApiResponse<object>.Success(
                    new { dispatch_no = existingDispatch, idempotent = true },
                    "Yêu cầu đã được xử lý trước đó."));
            }

            await EnsureRequestIdAvailableAsync(connection, transaction, requestId);

            var dispatchNo = $"TEMP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}"[..27].ToUpperInvariant();
            var actor = _currentUserService.Username;
            var totalQty = normalizedItems.Sum(item => item.Qty);

            await connection.ExecuteAsync(@"
                INSERT INTO tbl_temporary_dispatch_header
                    (dispatch_no, request_id, reason_code, borrower_name, dispatch_date,
                     due_date, total_cartons, total_qty, returned_qty, converted_qty,
                     status, created_by, created_at)
                VALUES
                    (@DispatchNo, @RequestId, @ReasonCode, @BorrowerName, CAST(GETUTCDATE() AS DATE),
                     @DueDate, 0, @TotalQty, 0, 0, 'PENDING_OUT', @Actor, GETUTCDATE())",
                new
                {
                    DispatchNo = dispatchNo,
                    RequestId = requestId,
                    ReasonCode = string.IsNullOrWhiteSpace(request.ReasonCode) ? "OTHER" : request.ReasonCode.Trim(),
                    BorrowerName = request.BorrowerName.Trim(),
                    DueDate = request.DueDate.Date,
                    TotalQty = totalQty,
                    Actor = actor
                }, transaction);

            var lineNo = 0;
            foreach (var item in normalizedItems)
            {
                lineNo++;
                await connection.ExecuteAsync(@"
                    INSERT INTO tbl_temporary_dispatch_request_line
                        (dispatch_no, line_no, product_code, requested_qty, scanned_qty)
                    VALUES (@DispatchNo, @LineNo, @ProductCode, @Qty, 0)",
                    new { DispatchNo = dispatchNo, LineNo = lineNo, item.ProductCode, item.Qty }, transaction);
            }

            await RecordCommandAsync(
                connection,
                transaction,
                requestId,
                BuildCommandType("UC18_CREATE", dispatchNo));
            transaction.Commit();

            return Ok(ApiResponse<object>.Success(
                new { dispatch_no = dispatchNo, status = "PENDING_OUT" },
                "Tạo phiếu chờ quét xuất tạm thành công."));
        }
        catch (InvalidOperationException ex)
        {
            transaction.Rollback();
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpPost("{dispatchNo}/confirm-scan")]
    [Authorize(Policy = PolicyNames.TemporaryDispatchManage)]
    public async Task<IActionResult> ConfirmScan(
        [FromRoute] string dispatchNo,
        [FromBody] ConfirmTempDispatchRequest request)
    {
        var requestId = RequireRequestId();
        if (requestId is null)
        {
            return MissingRequestId();
        }

        var requestedCartonIds = request.Id60List ?? new List<string>();
        var cartonIds = requestedCartonIds
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (cartonIds.Length == 0 || cartonIds.Length != requestedCartonIds.Count)
        {
            return BadRequest(ApiResponse<object>.Error(
                WmsErrorCodes.ValidationFailed,
                "Danh sách mã thùng không được rỗng hoặc trùng lặp."));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var commandType = BuildCommandType("UC18_CONFIRM", dispatchNo);
            if (await IsDuplicateCommandAsync(connection, transaction, requestId, commandType))
            {
                transaction.Commit();
                return Ok(ApiResponse<object>.Success(
                    new { dispatch_no = dispatchNo, idempotent = true },
                    "Yêu cầu đã được xử lý trước đó."));
            }

            var header = await connection.QueryFirstOrDefaultAsync<DispatchHeaderState>(@"
                SELECT dispatch_no AS DispatchNo, status AS Status, total_qty AS TotalQty
                FROM tbl_temporary_dispatch_header WITH (UPDLOCK, HOLDLOCK)
                WHERE dispatch_no = @DispatchNo",
                new { DispatchNo = dispatchNo }, transaction);

            if (header is null)
            {
                throw new KeyNotFoundException("Không tìm thấy phiếu xuất tạm.");
            }

            if (!string.Equals(header.Status, "PENDING_OUT", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Chỉ phiếu PENDING_OUT mới được xác nhận quét thực xuất.");
            }

            var actor = _currentUserService.Username;
            var transactionId = NewTransactionId("TOUT");
            var scannedItems = new List<CartonState>();

            foreach (var cartonId in cartonIds)
            {
                var carton = await connection.QueryFirstOrDefaultAsync<CartonState>(@"
                    SELECT id_60 AS Id60, qr_60 AS Qr60, product_code AS ProductCode,
                           product_name AS ProductName, current_qty AS CurrentQty,
                           uom AS Uom, status AS Status, stock_type AS StockType,
                           customer_code AS CustomerCode,
                           ISNULL(root_id_60, id_60) AS RootId60
                    FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK)
                    WHERE id_60 = @CartonId OR qr_60 = @CartonId",
                    new { CartonId = cartonId }, transaction);

                if (carton is null)
                {
                    throw new KeyNotFoundException($"Không tìm thấy thùng {cartonId}.");
                }

                if (!string.Equals(carton.StockType, "UNRESTRICTED", StringComparison.OrdinalIgnoreCase) ||
                    !string.Equals(carton.Status, "AVAILABLE", StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException($"Thùng {carton.Id60} không ở trạng thái AVAILABLE/UNRESTRICTED.");
                }

                var line = await connection.QueryFirstOrDefaultAsync<RequestLineState>(@"
                    SELECT TOP (1) line_no AS LineNo, requested_qty AS RequestedQty,
                                   scanned_qty AS ScannedQty
                    FROM tbl_temporary_dispatch_request_line WITH (UPDLOCK, HOLDLOCK)
                    WHERE dispatch_no = @DispatchNo
                      AND product_code = @ProductCode
                      AND scanned_qty + @Qty <= requested_qty + @Tolerance
                    ORDER BY line_no",
                    new
                    {
                        DispatchNo = dispatchNo,
                        carton.ProductCode,
                        Qty = carton.CurrentQty,
                        Tolerance = QuantityTolerance
                    }, transaction);

                if (line is null)
                {
                    throw new InvalidOperationException($"SKU hoặc số lượng của thùng {carton.Id60} vượt khai báo phiếu.");
                }

                await connection.ExecuteAsync(@"
                    UPDATE tbl_temporary_dispatch_request_line
                    SET scanned_qty = scanned_qty + @Qty
                    WHERE dispatch_no = @DispatchNo AND line_no = @LineNo;

                    INSERT INTO tbl_temporary_dispatch_detail
                        (dispatch_no, id_60, product_code, qty, item_status, returned_qty)
                    VALUES
                        (@DispatchNo, @Id60, @ProductCode, @Qty, 'TEMP_OUT', 0);

                    UPDATE tbl_thung60_kho
                    SET stock_type = 'TEMPORARY_ISSUE', status = 'DISPATCHED',
                        last_event_type = 'TEMP_ISSUE_OUT', last_event_at = GETUTCDATE(),
                        last_event_by = @Actor, updated_at = GETUTCDATE()
                    WHERE id_60 = @Id60;

                    INSERT INTO thung60_event
                        (event_id, id_60, event_type, old_status, new_status,
                         old_stock_type, new_stock_type, old_qty, new_qty,
                         source_document_no, request_id, performed_by, performed_at, message)
                    VALUES
                        (@EventId, @Id60, 'TEMP_ISSUE_OUT', 'AVAILABLE', 'DISPATCHED',
                         'UNRESTRICTED', 'TEMPORARY_ISSUE', @Qty, @Qty,
                         @DispatchNo, @RequestId, @Actor, GETUTCDATE(), N'Xác nhận thực xuất tạm');",
                    new
                    {
                        DispatchNo = dispatchNo,
                        line.LineNo,
                        carton.Id60,
                        carton.ProductCode,
                        Qty = carton.CurrentQty,
                        Actor = actor,
                        RequestId = requestId,
                        EventId = NewEventId()
                    }, transaction);

                scannedItems.Add(carton);
            }

            var incompleteLines = await connection.ExecuteScalarAsync<int>(@"
                SELECT COUNT(*)
                FROM tbl_temporary_dispatch_request_line
                WHERE dispatch_no = @DispatchNo
                  AND ABS(requested_qty - scanned_qty) > @Tolerance",
                new { DispatchNo = dispatchNo, Tolerance = QuantityTolerance }, transaction);

            if (incompleteLines > 0)
            {
                throw new InvalidOperationException("Số lượng quét chưa khớp hoàn toàn với số lượng đã khai báo.");
            }

            await connection.ExecuteAsync(@"
                INSERT INTO stock_transaction_book
                    (transaction_id, transaction_type, document_no, partner_name, posted_at, posted_by)
                SELECT @TransactionId, 'TEMPORARY_DISPATCH_OUT', dispatch_no, borrower_name, GETUTCDATE(), @Actor
                FROM tbl_temporary_dispatch_header
                WHERE dispatch_no = @DispatchNo;",
                new { TransactionId = transactionId, DispatchNo = dispatchNo, Actor = actor }, transaction);

            foreach (var item in scannedItems)
            {
                await connection.ExecuteAsync(@"
                    INSERT INTO inventory_ledger
                        (ledger_date, id_60, product_code, customer_code, transaction_id,
                         source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
                    VALUES
                        (CAST(GETUTCDATE() AS DATE), @Id60, @ProductCode, @CustomerCode,
                         @TransactionId, @DispatchNo, -@Qty, 'UNRESTRICTED',
                         'TEMPORARY_ISSUE', GETUTCDATE());",
                    new
                {
                    TransactionId = transactionId,
                    DispatchNo = dispatchNo,
                    item.Id60,
                    item.ProductCode,
                    item.CustomerCode,
                    Qty = item.CurrentQty
                }, transaction);
            }

            foreach (var itemGroup in scannedItems.GroupBy(item => item.ProductCode, StringComparer.OrdinalIgnoreCase))
            {
                await connection.ExecuteAsync(@"
                    INSERT INTO item_ledger
                        (ledger_date, product_code, transaction_id, source_document_no,
                         total_quantity_change, created_at)
                    VALUES
                        (CAST(GETUTCDATE() AS DATE), @ProductCode, @TransactionId,
                         @DispatchNo, -@Qty, GETUTCDATE())",
                    new
                    {
                        ProductCode = itemGroup.Key,
                        TransactionId = transactionId,
                        DispatchNo = dispatchNo,
                        Qty = itemGroup.Sum(item => item.CurrentQty)
                    }, transaction);
            }

            await connection.ExecuteAsync(@"
                UPDATE tbl_temporary_dispatch_header
                SET status = 'TEMP_OUT', total_cartons = @CartonCount
                WHERE dispatch_no = @DispatchNo",
                new { DispatchNo = dispatchNo, CartonCount = scannedItems.Count }, transaction);

            await RecordCommandAsync(connection, transaction, requestId, commandType);
            transaction.Commit();

            return Ok(ApiResponse<object>.Success(
                new { dispatch_no = dispatchNo, status = "TEMP_OUT", transaction_id = transactionId },
                "Xác nhận thực xuất tạm thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            transaction.Rollback();
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            transaction.Rollback();
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    [HttpPost("{dispatchNo}/return")]
    [Authorize(Policy = PolicyNames.TemporaryDispatchManage)]
    public async Task<IActionResult> ReturnTemporaryDispatch(
        [FromRoute] string dispatchNo,
        [FromBody] ReturnTempDispatchRequest request)
    {
        var requestId = RequireRequestId();
        if (requestId is null)
        {
            return MissingRequestId();
        }

        var returnItems = request.ReturnItems ?? new List<ReturnTempDispatchItemDto>();
        if (returnItems.Count == 0)
        {
            return BadRequest(ApiResponse<object>.Error(WmsErrorCodes.ValidationFailed, "Danh sách hoàn trả không được rỗng."));
        }

        using var connection = await _connectionFactory.CreateConnectionAsync();
        using var transaction = connection.BeginTransaction(IsolationLevel.Serializable);
        try
        {
            var commandType = BuildCommandType("UC18_RETURN", dispatchNo);
            if (await IsDuplicateCommandAsync(connection, transaction, requestId, commandType))
            {
                transaction.Commit();
                return Ok(ApiResponse<object>.Success(
                    new { dispatch_no = dispatchNo, idempotent = true },
                    "Yêu cầu đã được xử lý trước đó."));
            }

            var header = await connection.QueryFirstOrDefaultAsync<DispatchHeaderState>(@"
                SELECT dispatch_no AS DispatchNo, status AS Status, total_qty AS TotalQty
                FROM tbl_temporary_dispatch_header WITH (UPDLOCK, HOLDLOCK)
                WHERE dispatch_no = @DispatchNo",
                new { DispatchNo = dispatchNo }, transaction);

            if (header is null)
            {
                throw new KeyNotFoundException("Không tìm thấy phiếu xuất tạm.");
            }

            if (!new[] { "TEMP_OUT", "OVERDUE" }.Contains(header.Status, StringComparer.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Chỉ phiếu TEMP_OUT/OVERDUE mới được hoàn nhập.");
            }

            var actor = _currentUserService.Username;
            var transactionId = NewTransactionId("TRET");
            var ledgerItems = new List<ReturnLedgerItem>();

            foreach (var returnItem in returnItems)
            {
                var condition = returnItem.ReturnCondition?.Trim().ToUpperInvariant() ?? string.Empty;
                if (returnItem.Qty <= 0 ||
                    !new[] { "EXACT", "REPACKED_NEW_BOX", "REWORKED_NEW_SKU" }.Contains(condition))
                {
                    throw new InvalidOperationException("Số lượng hoặc hình thức hoàn trả không hợp lệ.");
                }

                var detail = await connection.QueryFirstOrDefaultAsync<DispatchDetailState>(@"
                    SELECT d.id_60 AS Id60, d.product_code AS ProductCode, d.qty AS Qty,
                           ISNULL(d.returned_qty, 0) AS ReturnedQty,
                           t.product_name AS ProductName, t.uom AS Uom,
                           t.customer_code AS CustomerCode,
                           ISNULL(t.root_id_60, t.id_60) AS RootId60
                    FROM tbl_temporary_dispatch_detail d WITH (UPDLOCK, HOLDLOCK)
                    INNER JOIN tbl_thung60_kho t WITH (UPDLOCK, HOLDLOCK) ON t.id_60 = d.id_60
                    WHERE d.dispatch_no = @DispatchNo AND d.id_60 = @Id60",
                    new { DispatchNo = dispatchNo, returnItem.Id60 }, transaction);

                if (detail is null)
                {
                    throw new KeyNotFoundException($"Thùng {returnItem.Id60} không thuộc phiếu xuất tạm.");
                }

                var remaining = detail.Qty - detail.ReturnedQty;
                if (returnItem.Qty - remaining > QuantityTolerance)
                {
                    throw new InvalidOperationException($"Số lượng trả của thùng {detail.Id60} vượt dư nợ còn lại.");
                }

                if (Math.Abs(returnItem.Qty - remaining) > QuantityTolerance)
                {
                    throw new InvalidOperationException($"Mỗi mã thùng phải được hoàn trả/tất toán toàn bộ số lượng còn lại ({remaining}).");
                }

                string ledgerId60;
                string ledgerProductCode;

                if (condition == "EXACT")
                {
                    if (!string.IsNullOrWhiteSpace(returnItem.ReturnedId60) &&
                        !string.Equals(returnItem.ReturnedId60, detail.Id60, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException("Trả nguyên bản phải dùng đúng mã thùng gốc.");
                    }

                    ledgerId60 = detail.Id60;
                    ledgerProductCode = detail.ProductCode;

                    await connection.ExecuteAsync(@"
                        UPDATE tbl_thung60_kho
                        SET stock_type = 'UNRESTRICTED', status = 'AVAILABLE',
                            last_event_type = 'TEMP_RETURN', last_event_at = GETUTCDATE(),
                            last_event_by = @Actor, updated_at = GETUTCDATE()
                        WHERE id_60 = @Id60",
                        new { detail.Id60, Actor = actor }, transaction);
                }
                else
                {
                    if (detail.ReturnedQty > QuantityTolerance ||
                        string.IsNullOrWhiteSpace(returnItem.ReturnedId60))
                    {
                        throw new InvalidOperationException("Trả đổi mã phải hoàn tất toàn bộ dư nợ và cung cấp mã thùng mới.");
                    }

                    ledgerId60 = returnItem.ReturnedId60.Trim();
                    ledgerProductCode = condition == "REWORKED_NEW_SKU"
                        ? returnItem.ReturnedProductCode?.Trim() ?? string.Empty
                        : detail.ProductCode;

                    if (string.IsNullOrWhiteSpace(ledgerProductCode))
                    {
                        throw new InvalidOperationException("Trả tái tạo bắt buộc khai báo mã SKU mới.");
                    }

                    var exists = await connection.ExecuteScalarAsync<int>(@"
                        SELECT COUNT(*) FROM tbl_thung60_kho WITH (UPDLOCK, HOLDLOCK)
                        WHERE id_60 = @ReturnedId60 OR qr_60 = @ReturnedId60",
                        new { ReturnedId60 = ledgerId60 }, transaction);

                    if (exists > 0)
                    {
                        throw new InvalidOperationException($"Mã thùng trả mới {ledgerId60} đã tồn tại.");
                    }

                    await connection.ExecuteAsync(@"
                        INSERT INTO tbl_thung60_kho
                            (id_60, qr_60, product_code, product_name, standard_qty,
                             original_qty, current_qty, uom, status, stock_type,
                             is_virtual, unit_origin_type, root_id_60, customer_code,
                             last_event_type, last_event_at, last_event_by, created_at, updated_at)
                        VALUES
                            (@ReturnedId60, @ReturnedId60, @ReturnedProductCode, @ProductName, @Qty,
                             @Qty, @Qty, @Uom, 'AVAILABLE', 'UNRESTRICTED',
                             0, 'TEMP_RETURN', @RootId60, @CustomerCode,
                             'TEMP_RETURN', GETUTCDATE(), @Actor, GETUTCDATE(), GETUTCDATE());

                        UPDATE tbl_thung60_kho
                        SET status = 'REPLACED', stock_type = 'REPLACED',
                            last_event_type = 'TEMP_RETURN_REPLACED', last_event_at = GETUTCDATE(),
                            last_event_by = @Actor, updated_at = GETUTCDATE()
                        WHERE id_60 = @OriginalId60;",
                        new
                        {
                            ReturnedId60 = ledgerId60,
                            ReturnedProductCode = ledgerProductCode,
                            detail.ProductName,
                            Qty = returnItem.Qty,
                            detail.Uom,
                            detail.RootId60,
                            detail.CustomerCode,
                            Actor = actor,
                            OriginalId60 = detail.Id60
                        }, transaction);
                }

                await connection.ExecuteAsync(@"
                    UPDATE tbl_temporary_dispatch_detail
                    SET returned_qty = ISNULL(returned_qty, 0) + @Qty,
                        returned_id_60 = @ReturnedId60,
                        returned_product_code = @ReturnedProductCode,
                        return_condition = @ReturnCondition,
                        returned_at = GETUTCDATE(),
                        item_status = CASE
                            WHEN ISNULL(returned_qty, 0) + @Qty >= qty - @Tolerance THEN 'RETURNED'
                            ELSE 'PARTIAL_RETURN'
                        END
                    WHERE dispatch_no = @DispatchNo AND id_60 = @OriginalId60;

                    INSERT INTO thung60_event
                        (event_id, id_60, event_type, old_status, new_status,
                         old_stock_type, new_stock_type, old_qty, new_qty,
                         source_document_no, request_id, performed_by, performed_at, message)
                    VALUES
                        (@EventId, @OriginalId60, 'TEMP_RETURN', 'DISPATCHED',
                         CASE WHEN @ReturnCondition = 'EXACT' THEN 'AVAILABLE' ELSE 'REPLACED' END,
                         'TEMPORARY_ISSUE',
                         CASE WHEN @ReturnCondition = 'EXACT' THEN 'UNRESTRICTED' ELSE 'REPLACED' END,
                         @Qty, @Qty, @DispatchNo, @RequestId, @Actor, GETUTCDATE(),
                         N'Hoàn nhập xuất tạm: ' + @ReturnCondition);",
                    new
                    {
                        DispatchNo = dispatchNo,
                        OriginalId60 = detail.Id60,
                        Qty = returnItem.Qty,
                        ReturnedId60 = ledgerId60,
                        ReturnedProductCode = ledgerProductCode,
                        ReturnCondition = condition,
                        Tolerance = QuantityTolerance,
                        EventId = NewEventId(),
                        RequestId = requestId,
                        Actor = actor
                    }, transaction);

                ledgerItems.Add(new ReturnLedgerItem(
                    ledgerId60,
                    ledgerProductCode,
                    detail.CustomerCode,
                    returnItem.Qty,
                    condition));
            }

            await connection.ExecuteAsync(@"
                INSERT INTO stock_transaction_book
                    (transaction_id, transaction_type, document_no, partner_name, posted_at, posted_by)
                SELECT @TransactionId, 'TEMPORARY_DISPATCH_RETURN', dispatch_no, borrower_name,
                       GETUTCDATE(), @Actor
                FROM tbl_temporary_dispatch_header
                WHERE dispatch_no = @DispatchNo",
                new { TransactionId = transactionId, DispatchNo = dispatchNo, Actor = actor }, transaction);

            foreach (var ledgerItem in ledgerItems)
            {
                await connection.ExecuteAsync(@"
                    INSERT INTO inventory_ledger
                        (ledger_date, id_60, product_code, customer_code, transaction_id,
                         source_document_no, quantity_change, old_stock_type, new_stock_type, created_at)
                    VALUES
                        (CAST(GETUTCDATE() AS DATE), @Id60, @ProductCode, @CustomerCode,
                         @TransactionId, @DispatchNo, @Qty, 'TEMPORARY_ISSUE',
                         'UNRESTRICTED', GETUTCDATE())",
                    new
                    {
                        ledgerItem.Id60,
                        ledgerItem.ProductCode,
                        ledgerItem.CustomerCode,
                        TransactionId = transactionId,
                        DispatchNo = dispatchNo,
                        ledgerItem.Qty
                    }, transaction);
            }

            foreach (var itemGroup in ledgerItems.GroupBy(item => item.ProductCode, StringComparer.OrdinalIgnoreCase))
            {
                await connection.ExecuteAsync(@"
                    INSERT INTO item_ledger
                        (ledger_date, product_code, transaction_id, source_document_no,
                         total_quantity_change, created_at)
                    VALUES
                        (CAST(GETUTCDATE() AS DATE), @ProductCode, @TransactionId,
                         @DispatchNo, @Qty, GETUTCDATE())",
                    new
                    {
                        ProductCode = itemGroup.Key,
                        TransactionId = transactionId,
                        DispatchNo = dispatchNo,
                        Qty = itemGroup.Sum(item => item.Qty)
                    }, transaction);
            }

            await connection.ExecuteAsync(@"
                UPDATE h
                SET returned_qty = totals.returned_qty,
                    converted_qty = totals.converted_qty,
                    status = CASE
                        WHEN totals.returned_qty + totals.converted_qty >= h.total_qty - @Tolerance
                            THEN 'RETURNED'
                        ELSE 'TEMP_OUT'
                    END
                FROM tbl_temporary_dispatch_header h
                CROSS APPLY (
                    SELECT
                        SUM(CASE WHEN d.return_condition = 'REWORKED_NEW_SKU' THEN 0 ELSE ISNULL(d.returned_qty, 0) END) AS returned_qty,
                        SUM(CASE WHEN d.return_condition = 'REWORKED_NEW_SKU' THEN ISNULL(d.returned_qty, 0) ELSE 0 END) AS converted_qty
                    FROM tbl_temporary_dispatch_detail d
                    WHERE d.dispatch_no = h.dispatch_no
                ) totals
                WHERE h.dispatch_no = @DispatchNo",
                new { DispatchNo = dispatchNo, Tolerance = QuantityTolerance }, transaction);

            await RecordCommandAsync(connection, transaction, requestId, commandType);
            transaction.Commit();

            return Ok(ApiResponse<object>.Success(
                new { dispatch_no = dispatchNo, transaction_id = transactionId },
                "Hoàn nhập xuất tạm thành công."));
        }
        catch (KeyNotFoundException ex)
        {
            transaction.Rollback();
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            transaction.Rollback();
            return Conflict(ApiResponse<object>.Error(WmsErrorCodes.InvalidStateTransition, ex.Message));
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    private string? RequireRequestId()
    {
        if (!Request.Headers.TryGetValue("X-Request-Id", out var values))
        {
            return null;
        }

        var requestId = values.FirstOrDefault();
        return string.IsNullOrWhiteSpace(requestId) ? null : requestId.Trim();
    }

    private BadRequestObjectResult MissingRequestId() => BadRequest(
        ApiResponse<object>.Error(
            WmsErrorCodes.ValidationFailed,
            "Thiếu header X-Request-Id để đảm bảo idempotency."));

    private static async Task<bool> IsDuplicateCommandAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        string requestId,
        string expectedCommandType)
    {
        var existing = await connection.QueryFirstOrDefaultAsync<CommandState>(@"
            SELECT command_type AS CommandType, status AS Status
            FROM command_request_log WITH (UPDLOCK, HOLDLOCK)
            WHERE request_id = @RequestId",
            new { RequestId = requestId }, transaction);

        if (existing is null)
        {
            return false;
        }

        if (!string.Equals(existing.CommandType, expectedCommandType, StringComparison.Ordinal) ||
            !new[] { "SUCCESS", "COMPLETED" }.Contains(existing.Status, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("X-Request-Id đã được sử dụng cho một lệnh khác hoặc chưa hoàn tất.");
        }

        return true;
    }

    private static async Task EnsureRequestIdAvailableAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        string requestId)
    {
        var exists = await connection.ExecuteScalarAsync<int>(@"
            SELECT COUNT(*)
            FROM command_request_log WITH (UPDLOCK, HOLDLOCK)
            WHERE request_id = @RequestId",
            new { RequestId = requestId }, transaction);

        if (exists > 0)
        {
            throw new InvalidOperationException("X-Request-Id đã được sử dụng cho một lệnh khác.");
        }
    }

    private static Task RecordCommandAsync(
        IDbConnection connection,
        IDbTransaction transaction,
        string requestId,
        string commandType)
    {
        return connection.ExecuteAsync(@"
            INSERT INTO command_request_log (request_id, command_type, status, created_at)
            VALUES (@RequestId, @CommandType, 'SUCCESS', GETUTCDATE())",
            new { RequestId = requestId, CommandType = commandType }, transaction);
    }

    private static string BuildCommandType(string operation, string dispatchNo) =>
        $"{operation}:{dispatchNo}"[..Math.Min(50, operation.Length + dispatchNo.Length + 1)];

    private static string NewTransactionId(string prefix) =>
        $"{prefix}-{Guid.NewGuid():N}".ToUpperInvariant();

    private static string NewEventId() => $"EVT-{Guid.NewGuid():N}"[..16].ToUpperInvariant();
}

public sealed class CreateTempDispatchRequest
{
    [JsonPropertyName("reason_code")]
    public string? ReasonCode { get; init; }

    [JsonPropertyName("borrower_name")]
    public string BorrowerName { get; init; } = string.Empty;

    [JsonPropertyName("due_date")]
    public DateTime DueDate { get; init; }

    [JsonPropertyName("items")]
    public List<TempDispatchRequestItemDto> Items { get; init; } = new();
}

public sealed class TempDispatchRequestItemDto
{
    [JsonPropertyName("product_code")]
    public string ProductCode { get; init; } = string.Empty;

    [JsonPropertyName("qty")]
    public decimal Qty { get; init; }
}

public sealed class ConfirmTempDispatchRequest
{
    [JsonPropertyName("id_60_list")]
    public List<string> Id60List { get; init; } = new();
}

public sealed class ReturnTempDispatchRequest
{
    [JsonPropertyName("return_items")]
    public List<ReturnTempDispatchItemDto> ReturnItems { get; init; } = new();
}

public sealed class ReturnTempDispatchItemDto
{
    [JsonPropertyName("id_60")]
    public string Id60 { get; init; } = string.Empty;

    [JsonPropertyName("return_condition")]
    public string ReturnCondition { get; init; } = string.Empty;

    [JsonPropertyName("qty")]
    public decimal Qty { get; init; }

    [JsonPropertyName("returned_id_60")]
    public string? ReturnedId60 { get; init; }

    [JsonPropertyName("returned_product_code")]
    public string? ReturnedProductCode { get; init; }
}

internal sealed class DispatchHeaderState
{
    public string DispatchNo { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal TotalQty { get; init; }
}

internal sealed class CommandState
{
    public string CommandType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}

internal sealed class RequestLineState
{
    public int LineNo { get; init; }
    public decimal RequestedQty { get; init; }
    public decimal ScannedQty { get; init; }
}

internal sealed class CartonState
{
    public string Id60 { get; init; } = string.Empty;
    public string Qr60 { get; init; } = string.Empty;
    public string ProductCode { get; init; } = string.Empty;
    public string? ProductName { get; init; }
    public decimal CurrentQty { get; init; }
    public string Uom { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public string StockType { get; init; } = string.Empty;
    public string? CustomerCode { get; init; }
    public string RootId60 { get; init; } = string.Empty;
}

internal sealed class DispatchDetailState
{
    public string Id60 { get; init; } = string.Empty;
    public string ProductCode { get; init; } = string.Empty;
    public decimal Qty { get; init; }
    public decimal ReturnedQty { get; init; }
    public string? ProductName { get; init; }
    public string Uom { get; init; } = string.Empty;
    public string? CustomerCode { get; init; }
    public string RootId60 { get; init; } = string.Empty;
}

internal sealed record ReturnLedgerItem(
    string Id60,
    string ProductCode,
    string? CustomerCode,
    decimal Qty,
    string ReturnCondition);
