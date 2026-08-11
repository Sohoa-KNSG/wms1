using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Wms.Application.Common.Interfaces;
using Wms.Application.Common.Models;
using Wms.Domain.Constants;

namespace Wms.Api.Controllers;

[ApiController]
[Route("api/v1/trace")]
[Authorize(Policy = PolicyNames.TraceRead)]
public class TraceController : ControllerBase
{
    private readonly ISqlConnectionFactory _connectionFactory;

    public TraceController(ISqlConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("units/{id60}")]
    public async Task<IActionResult> TraceUnit([FromRoute] string id60)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        var snapshot = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT * FROM tbl_thung60_kho WHERE id_60 = @id OR qr_60 = @id",
            new { id = id60 });

        if (snapshot == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Không tìm thấy Thùng 60."));
        }

        string actualId = snapshot.id_60;

        var events = await connection.QueryAsync<dynamic>("SELECT * FROM thung60_event WHERE id_60 = @id", new { id = actualId });
        var splits = await connection.QueryAsync<dynamic>("SELECT * FROM thung60_split_history WHERE source_id_60 = @id OR generated_id_60 = @id", new { id = actualId });
        var packHistory = await connection.QueryAsync<dynamic>(@"
            SELECT h.*, p.pack360_qr, p.status as pack_status
            FROM pack360_unit_history h
            LEFT JOIN pack360_header p ON h.pack360_id = p.pack360_id
            WHERE h.id_60 = @id", new { id = actualId });

        var ledgers = await connection.QueryAsync<dynamic>(@"
            SELECT l.*, t.transaction_type, t.posted_by
            FROM inventory_ledger l
            LEFT JOIN stock_transaction_book t ON l.transaction_id = t.transaction_id
            WHERE l.id_60 = @id", new { id = actualId });

        var timeline = new List<dynamic>();

        foreach (var e in events)
        {
            timeline.Add(new
            {
                occurred_at = e.performed_at,
                category = "DOMAIN_EVENT",
                event_type = e.event_type,
                document_no = e.source_document_no,
                actor = e.performed_by,
                before_state = e.old_status ?? e.old_stock_type,
                after_state = e.new_status ?? e.new_stock_type,
                request_id = e.request_id,
                details = e.message
            });
        }

        foreach (var s in splits)
        {
            timeline.Add(new
            {
                occurred_at = s.performed_at,
                category = "SPLIT_LINEAGE",
                event_type = s.source_id_60 == actualId ? "SPLIT_SOURCE" : "SPLIT_GENERATED",
                document_no = s.issue_no,
                actor = s.performed_by,
                before_state = $"Qty: {s.source_qty_before}",
                after_state = $"SplitQty: {s.split_qty}, Remaining: {s.source_qty_after}",
                request_id = s.request_id,
                details = $"Source: {s.source_id_60} -> Generated: {s.generated_id_60}"
            });
        }

        foreach (var p in packHistory)
        {
            timeline.Add(new
            {
                occurred_at = p.added_at,
                category = "PACK360_JOIN",
                event_type = "JOIN_PACK",
                document_no = p.pack360_id,
                actor = p.added_by,
                before_state = "STANDALONE",
                after_state = $"IN_PACK ({p.pack360_id})",
                request_id = p.request_id,
                details = $"Pack QR: {p.pack360_qr ?? p.pack360_id}"
            });
        }

        timeline = timeline.OrderBy(x => x.occurred_at).ToList();

        return Ok(ApiResponse<object>.Success(new
        {
            snapshot,
            unified_timeline = timeline,
            ledgers
        }));
    }

    [HttpGet("packs/{pack360Id}")]
    public async Task<IActionResult> TracePack([FromRoute] string pack360Id)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var header = await connection.QueryFirstOrDefaultAsync<dynamic>(
            "SELECT * FROM pack360_header WHERE pack360_id = @id OR pack360_qr = @id",
            new { id = pack360Id });

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, "Không tìm thấy Kiện Pack360."));
        }

        string actualPackId = header.pack360_id;

        var currentUnits = await connection.QueryAsync<dynamic>(@"
            SELECT u.id_60, u.added_at, u.added_by, t.qr_60, t.product_code, t.current_qty, t.status
            FROM pack360_unit u
            INNER JOIN tbl_thung60_kho t ON u.id_60 = t.id_60
            WHERE u.pack360_id = @packId AND u.is_current = 1", new { packId = actualPackId });

        var unitHistory = await connection.QueryAsync<dynamic>(
            "SELECT * FROM pack360_unit_history WHERE pack360_id = @packId ORDER BY added_at ASC",
            new { packId = actualPackId });

        var events = await connection.QueryAsync<dynamic>(
            "SELECT * FROM pack360_event WHERE pack360_id = @packId ORDER BY performed_at ASC",
            new { packId = actualPackId });

        return Ok(ApiResponse<object>.Success(new
        {
            header,
            current_units = currentUnits,
            unit_history = unitHistory,
            events
        }));
    }

    [HttpGet("orders/{orderNo}")]
    public async Task<IActionResult> TraceOrder([FromRoute] string orderNo)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var units = await connection.QueryAsync<dynamic>(@"
            SELECT DISTINCT t.id_60, t.qr_60, t.product_code, t.current_qty, t.status, t.stock_type, t.current_location_code, t.current_oem_order_no
            FROM tbl_thung60_kho t
            LEFT JOIN WMS_UC03_ScanLog s ON t.id_60 = s.MaThung60
            WHERE t.current_oem_order_no = @orderNo OR s.MaDonHang = @orderNo", new { orderNo });

        var packs = await connection.QueryAsync<dynamic>(@"
            SELECT pack360_id, pack360_qr, status, actual_unit_count, weight, created_at
            FROM pack360_header 
            WHERE oem_order_no = @orderNo", new { orderNo });

        return Ok(ApiResponse<object>.Success(new
        {
            order_no = orderNo,
            total_units = units.Count(),
            total_packs = packs.Count(),
            units,
            packs
        }));
    }

    [HttpGet("documents/{type}/{no}")]
    public async Task<IActionResult> TraceDocument([FromRoute] string type, [FromRoute] string no)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        var upperType = type.ToUpperInvariant();

        object? header = null;
        IEnumerable<dynamic> details = Enumerable.Empty<dynamic>();

        if (upperType == "DISPATCH" || upperType == "OUTBOUND")
        {
            header = await connection.QueryFirstOrDefaultAsync<dynamic>("SELECT * FROM delivery_note_header WHERE delivery_note_no = @no", new { no });
            details = await connection.QueryAsync<dynamic>("SELECT * FROM delivery_note_detail WHERE delivery_note_no = @no", new { no });
        }

        if (header == null)
        {
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Không tìm thấy chứng từ {type} - {no}"));
        }

        return Ok(ApiResponse<object>.Success(new { header, details }));
    }

    [HttpGet("dossier/{assetCode}")]
    public async Task<IActionResult> TraceDossier([FromRoute] string assetCode)
    {
        using var connection = await _connectionFactory.CreateConnectionAsync();
        
        using var multi = await connection.QueryMultipleAsync("usp_WMS_UC12_GetUniversalDossier", new { assetCode }, commandType: System.Data.CommandType.StoredProcedure);
        
        var typeResult = await multi.ReadFirstOrDefaultAsync<dynamic>();
        if (typeResult == null || (string)typeResult!.asset_type == "NOT_FOUND")
            return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Không tìm thấy hồ sơ tài sản (Thùng 60 / Kiện 360 / Pallet) với mã [{assetCode}]."));

        string assetType = (string)typeResult!.asset_type;

        if (assetType == "CARTON_60")
        {
            var profile = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var splits = await multi.ReadAsync<dynamic>();
            var events = await multi.ReadAsync<dynamic>();
            var ledgers = await multi.ReadAsync<dynamic>();

            return Ok(ApiResponse<object>.Success(new
            {
                asset_type = assetType,
                profile = profile,
                hierarchy = new
                {
                    parent_pack_id = profile?.parent_pack_id,
                    current_pallet_id = profile?.current_pallet_id,
                    is_virtual = profile?.is_virtual,
                    splits = splits
                },
                timeline = events,
                ledger_audits = ledgers
            }));
        }
        else if (assetType == "PACK_360")
        {
            var profile = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var childUnits = await multi.ReadAsync<dynamic>();
            var events = await multi.ReadAsync<dynamic>();
            var ledgers = await multi.ReadAsync<dynamic>();

            return Ok(ApiResponse<object>.Success(new
            {
                asset_type = assetType,
                profile = profile,
                hierarchy = new
                {
                    child_count = childUnits.Count(),
                    child_units = childUnits,
                    oem_order_no = profile?.oem_order_no
                },
                timeline = events,
                ledger_audits = ledgers
            }));
        }
        else if (assetType == "PALLET")
        {
            var profile = await multi.ReadFirstOrDefaultAsync<dynamic>();
            var mappedUnits = await multi.ReadAsync<dynamic>();
            var events = await multi.ReadAsync<dynamic>();
            var ledgers = await multi.ReadAsync<dynamic>();

            return Ok(ApiResponse<object>.Success(new
            {
                asset_type = assetType,
                profile = profile,
                hierarchy = new
                {
                    child_count = mappedUnits.Count(),
                    child_units = mappedUnits
                },
                timeline = events,
                ledger_audits = ledgers
            }));
        }

        return NotFound(ApiResponse<object>.Error(WmsErrorCodes.NotFound, $"Không tìm thấy hồ sơ tài sản với mã [{assetCode}]."));
    }
}
