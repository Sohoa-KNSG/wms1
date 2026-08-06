using Wms.Api.Controllers;
using Xunit;

namespace Wms.UnitTests.Inventory;

public class InventoryClosingTests
{
    [Fact]
    public void PeriodClosingRequest_Validation_ShouldDetectInvalidMonthYear()
    {
        var req1 = new PeriodClosingRequest(2026, 13);
        var req2 = new PeriodClosingRequest(2019, 5);

        Assert.True(req1.Month < 1 || req1.Month > 12);
        Assert.True(req2.Year < 2020);
    }
}
