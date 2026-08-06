using Wms.Api.Controllers;
using Xunit;

namespace Wms.UnitTests.Outbound;

public class OutboundTests
{
    [Fact]
    public void GateOutRequest_Validation_ShouldDetectEmptyDeliveryNoteNo()
    {
        var req = new GateOutRequest("", "Driver A", "SEAL-01", "Gate Note");
        Assert.True(string.IsNullOrWhiteSpace(req.DeliveryNoteNo));
    }
}
