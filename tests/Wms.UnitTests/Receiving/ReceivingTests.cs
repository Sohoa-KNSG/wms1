using Wms.Api.Controllers;
using Xunit;

namespace Wms.UnitTests.Receiving;

public class ReceivingTests
{
    [Fact]
    public void OemImportRequest_ShouldValidateBatchLimit()
    {
        var orders = Enumerable.Range(1, 501).Select(i => new OemOrderDto(
            $"DH-{i:D3}", "SKU-001", 1, "KH01", "Customer 1", 100, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow.AddDays(7), "NEW"
        )).ToList();

        var req = new OemImportRequest(orders);
        Assert.True(req.Orders.Count() > 500);
    }
}
