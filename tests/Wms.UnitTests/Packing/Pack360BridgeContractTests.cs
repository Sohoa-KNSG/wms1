using Microsoft.AspNetCore.Mvc;
using Moq;
using Wms.Api.Controllers;
using Wms.Application.Common.Interfaces;
using Xunit;

namespace Wms.UnitTests.Packing;

public class Pack360BridgeContractTests
{
    [Fact]
    public async Task CompletePack_RejectsManualWeightWithoutReason()
    {
        var controller = CreateController();
        var request = new PackCompleteRequest("PACK-001", 15.45m, "MANUAL", null);

        var result = await controller.CompletePack(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CompletePack_RejectsUnknownWeightSource()
    {
        var controller = CreateController();
        var request = new PackCompleteRequest("PACK-001", 15.45m, "UNKNOWN", null);

        var result = await controller.CompletePack(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void GenerateLabel_ReturnsPrintableTspl()
    {
        var label = TsplHelper.GenerateLabel("PACK-001", 15.45m, "PRODUCT-01", "GT");

        Assert.Contains("QRCODE", label);
        Assert.Contains("PACK-001", label);
        Assert.EndsWith("PRINT 1,1\r\n", label);
    }

    private static Pack360Controller CreateController()
    {
        var executor = new Mock<IStoredProcedureExecutor>(MockBehavior.Strict);
        var connectionFactory = new Mock<ISqlConnectionFactory>(MockBehavior.Strict);
        var currentUser = new Mock<ICurrentUserService>(MockBehavior.Strict);
        return new Pack360Controller(executor.Object, connectionFactory.Object, currentUser.Object);
    }
}
